from lxml import etree
from datetime import datetime
from decimal import Decimal
from typing import Optional
import base64
import hashlib
import uuid
from app.schemas.validation import InvoiceCreate


# ZATCA business-process identifier (BT-23). Required to be exactly
# "reporting:1.0" by BR-KSA-EN16931-01.
PROFILE_ID = "reporting:1.0"

# Default Previous-Invoice-Hash for the first invoice in a chain (KSA-13 /
# BR-KSA-61). ZATCA's schematron pins this to base64 of the *hex digest
# string* of SHA-256("0") — not base64 of the raw 32 digest bytes:
#   b64("5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9")
DEFAULT_PIH = base64.b64encode(
    hashlib.sha256(b"0").hexdigest().encode("ascii")
).decode("ascii")


class InvoiceXMLBuilder:
    """
    UBL 2.1 XML Builder for ZATCA-compliant e-invoices.
    Converts validated JSON data to UBL 2.1 XML format.
    """
    
    # ZATCA UBL 2.1 Namespaces
    NAMESPACES = {
        None: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
        "cac": "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
        "cbc": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
        "ext": "urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
    }
    
    def __init__(
        self,
        invoice_data: InvoiceCreate,
        previous_invoice_hash: Optional[str] = None,
        invoice_counter: int = 1,
    ):
        """
        Initialize XML builder.

        Args:
            invoice_data: Validated invoice data
            previous_invoice_hash: Hash of previous invoice (PIH) for chaining.
                When omitted, the first-invoice default (base64 SHA-256 of "0")
                is used so BR-KSA-61 (PIH must exist) is always satisfied.
            invoice_counter: Monotonic invoice counter value (ICV / KSA-16),
                required by BR-KSA-33. Starts at 1 for the first invoice.
        """
        self.invoice = invoice_data
        self.previous_hash = previous_invoice_hash or DEFAULT_PIH
        self.invoice_counter = invoice_counter
        self.invoice_uuid = str(uuid.uuid4())
        
    def build(self) -> bytes:
        """
        Build complete UBL 2.1 XML invoice.
        
        Returns:
            bytes: XML byte string ready for signing
        """
        # Create root element with namespaces
        nsmap = {k if k else None: v for k, v in self.NAMESPACES.items()}
        root = etree.Element("Invoice", nsmap=nsmap)
        
        # Build sections
        self._build_extensions(root)
        self._build_header(root)
        self._build_additional_document_references(root)
        self._build_signature_reference(root)
        self._build_supplier_party(root)
        self._build_customer_party(root)
        self._build_delivery(root)
        self._build_payment_means(root)
        self._build_tax_total(root)
        self._build_legal_monetary_total(root)
        self._build_invoice_lines(root)
        
        # Convert to bytes with XML declaration
        xml_bytes = etree.tostring(
            root,
            pretty_print=True,
            xml_declaration=True,
            encoding='UTF-8'
        )
        
        return xml_bytes
    
    def _build_extensions(self, root: etree.Element):
        """Build UBLExtensions section (required for ZATCA)."""
        ext_ns = f"{{{self.NAMESPACES['ext']}}}"
        
        extensions = etree.SubElement(root, f"{ext_ns}UBLExtensions")
        extension = etree.SubElement(extensions, f"{ext_ns}UBLExtension")
        extension_uri = etree.SubElement(extension, f"{ext_ns}ExtensionURI")
        extension_uri.text = "urn:oasis:names:specification:ubl:dsig:enveloped:xades"
        
        extension_content = etree.SubElement(extension, f"{ext_ns}ExtensionContent")
        # Placeholder for signature (will be added during signing)
        comment = etree.Comment(" Signature will be inserted here ")
        extension_content.append(comment)
    
    def _build_header(self, root: etree.Element):
        """Build invoice header with UUID, ID, IssueDate, InvoiceTypeCode."""
        cbc_ns = f"{{{self.NAMESPACES['cbc']}}}"

        # UBL 2.1 Invoice header element order is fixed by the schema:
        # ProfileID precedes ID, which precedes UUID, then IssueDate/IssueTime.
        # Business process / ProfileID (BT-23) — must be "reporting:1.0".
        profile_id = etree.SubElement(root, f"{cbc_ns}ProfileID")
        profile_id.text = PROFILE_ID

        # Invoice ID
        id_elem = etree.SubElement(root, f"{cbc_ns}ID")
        id_elem.text = self.invoice.invoice_number

        # UUID
        uuid_elem = etree.SubElement(root, f"{cbc_ns}UUID")
        uuid_elem.text = self.invoice_uuid

        # Issue Date
        issue_date = etree.SubElement(root, f"{cbc_ns}IssueDate")
        issue_date.text = self.invoice.issue_date.isoformat()
        
        # Issue Time
        issue_time = etree.SubElement(root, f"{cbc_ns}IssueTime")
        issue_time.text = datetime.now().strftime("%H:%M:%S")
        
        # Invoice Type Code (388 = Tax Invoice, with ZATCA transaction code)
        invoice_type_code = etree.SubElement(root, f"{cbc_ns}InvoiceTypeCode")
        invoice_type_code.text = "388"
        
        # Transaction type code based on invoice type
        if self.invoice.invoice_type.value == "Tax":
            invoice_type_code.set("name", "0100000")  # Standard B2B tax invoice
        else:  # Simplified
            invoice_type_code.set("name", "0200000")  # Simplified tax invoice
        
        # Document Currency Code
        currency = etree.SubElement(root, f"{cbc_ns}DocumentCurrencyCode")
        currency.text = self.invoice.currency_code
        
        # Tax Currency Code
        tax_currency = etree.SubElement(root, f"{cbc_ns}TaxCurrencyCode")
        tax_currency.text = self.invoice.currency_code
    
    def _build_additional_document_references(self, root: etree.Element):
        """
        Build the AdditionalDocumentReference blocks ZATCA requires:
          - ICV: the invoice counter value (KSA-16 / BR-KSA-33).
          - PIH: the previous-invoice hash (KSA-13 / BR-KSA-61).
        The QR-code reference (KSA-14) is appended later, during signing.
        """
        cac_ns = f"{{{self.NAMESPACES['cac']}}}"
        cbc_ns = f"{{{self.NAMESPACES['cbc']}}}"

        # Invoice counter value (ICV).
        icv_ref = etree.SubElement(root, f"{cac_ns}AdditionalDocumentReference")
        icv_id = etree.SubElement(icv_ref, f"{cbc_ns}ID")
        icv_id.text = "ICV"
        icv_uuid = etree.SubElement(icv_ref, f"{cbc_ns}UUID")
        icv_uuid.text = str(self.invoice_counter)

        # Previous invoice hash (PIH).
        pih_ref = etree.SubElement(root, f"{cac_ns}AdditionalDocumentReference")
        pih_id = etree.SubElement(pih_ref, f"{cbc_ns}ID")
        pih_id.text = "PIH"
        attachment = etree.SubElement(pih_ref, f"{cac_ns}Attachment")
        embedded_doc = etree.SubElement(attachment, f"{cbc_ns}EmbeddedDocumentBinaryObject")
        embedded_doc.set("mimeCode", "text/plain")
        embedded_doc.text = self.previous_hash
    
    # UBL/ZATCA signature reference identifiers (cac:Signature in the body and
    # the sig:UBLDocumentSignatures envelope in the extension must agree).
    SIGNATURE_ID = "urn:oasis:names:specification:ubl:signature:Invoice"
    SIGNATURE_METHOD = "urn:oasis:names:specification:ubl:dsig:enveloped:xades"

    def _build_signature_reference(self, root: etree.Element):
        """
        Build the cac:Signature reference block (UBL order: after
        AdditionalDocumentReference, before AccountingSupplierParty). ZATCA's
        cryptographic-stamp rules pin these exact values:
          - cbc:ID            -> BR-KSA-29 (and the referenced signature ID)
          - cbc:SignatureMethod -> BR-KSA-30
        Its mere presence satisfies BR-KSA-60.
        """
        cac_ns = f"{{{self.NAMESPACES['cac']}}}"
        cbc_ns = f"{{{self.NAMESPACES['cbc']}}}"

        signature = etree.SubElement(root, f"{cac_ns}Signature")
        sig_id = etree.SubElement(signature, f"{cbc_ns}ID")
        sig_id.text = self.SIGNATURE_ID
        sig_method = etree.SubElement(signature, f"{cbc_ns}SignatureMethod")
        sig_method.text = self.SIGNATURE_METHOD

    def _build_supplier_party(self, root: etree.Element):
        """Build AccountingSupplierParty section."""
        cac_ns = f"{{{self.NAMESPACES['cac']}}}"
        cbc_ns = f"{{{self.NAMESPACES['cbc']}}}"
        
        supplier = etree.SubElement(root, f"{cac_ns}AccountingSupplierParty")
        party = etree.SubElement(supplier, f"{cac_ns}Party")
        
        # Party Identification (VAT Number)
        party_id = etree.SubElement(party, f"{cac_ns}PartyIdentification")
        id_elem = etree.SubElement(party_id, f"{cbc_ns}ID")
        id_elem.set("schemeID", "CRN")
        id_elem.text = self.invoice.supplier.trn
        
        # Postal Address
        address = etree.SubElement(party, f"{cac_ns}PostalAddress")
        
        # UBL AddressType order: StreetName, BuildingNumber, PlotIdentification,
        # CitySubdivisionName, CityName, PostalZone, Country. (The zone element
        # is PostalZone, not PostalCode, which is not a valid UBL element.)
        street = etree.SubElement(address, f"{cbc_ns}StreetName")
        street.text = self.invoice.supplier.street

        building = etree.SubElement(address, f"{cbc_ns}BuildingNumber")
        building.text = self.invoice.supplier.building_number

        # Additional number (KSA-23) — required 4-digit field, BR-KSA-09/64.
        plot = etree.SubElement(address, f"{cbc_ns}PlotIdentification")
        plot.text = self.invoice.supplier.plot_identification

        # Neighborhood (KSA-3).
        district = etree.SubElement(address, f"{cbc_ns}CitySubdivisionName")
        district.text = self.invoice.supplier.district

        city = etree.SubElement(address, f"{cbc_ns}CityName")
        city.text = self.invoice.supplier.city

        postal = etree.SubElement(address, f"{cbc_ns}PostalZone")
        postal.text = self.invoice.supplier.postal_code

        # Region / province (BT-39). Required on the buyer side by BR-KSA-10;
        # emitted for both parties for consistency.
        subentity = etree.SubElement(address, f"{cbc_ns}CountrySubentity")
        subentity.text = self.invoice.supplier.district

        country = etree.SubElement(address, f"{cac_ns}Country")
        country_code = etree.SubElement(country, f"{cbc_ns}IdentificationCode")
        country_code.text = self.invoice.supplier.country_code
        
        # Party Tax Scheme
        tax_scheme = etree.SubElement(party, f"{cac_ns}PartyTaxScheme")
        company_id = etree.SubElement(tax_scheme, f"{cbc_ns}CompanyID")
        company_id.text = self.invoice.supplier.trn
        
        tax_scheme_elem = etree.SubElement(tax_scheme, f"{cac_ns}TaxScheme")
        tax_id = etree.SubElement(tax_scheme_elem, f"{cbc_ns}ID")
        tax_id.text = "VAT"
        
        # Party Legal Entity
        legal_entity = etree.SubElement(party, f"{cac_ns}PartyLegalEntity")
        reg_name = etree.SubElement(legal_entity, f"{cbc_ns}RegistrationName")
        reg_name.text = self.invoice.supplier.name
    
    def _build_customer_party(self, root: etree.Element):
        """Build AccountingCustomerParty section."""
        cac_ns = f"{{{self.NAMESPACES['cac']}}}"
        cbc_ns = f"{{{self.NAMESPACES['cbc']}}}"
        
        customer = etree.SubElement(root, f"{cac_ns}AccountingCustomerParty")
        party = etree.SubElement(customer, f"{cac_ns}Party")
        
        # Party Identification
        party_id = etree.SubElement(party, f"{cac_ns}PartyIdentification")
        id_elem = etree.SubElement(party_id, f"{cbc_ns}ID")
        id_elem.set("schemeID", "CRN")
        id_elem.text = self.invoice.customer.trn
        
        # Postal Address
        address = etree.SubElement(party, f"{cac_ns}PostalAddress")
        
        # UBL AddressType order: StreetName, BuildingNumber, PlotIdentification,
        # CitySubdivisionName, CityName, PostalZone, Country.
        street = etree.SubElement(address, f"{cbc_ns}StreetName")
        street.text = self.invoice.customer.street

        building = etree.SubElement(address, f"{cbc_ns}BuildingNumber")
        building.text = self.invoice.customer.building_number

        # Additional number (KSA-19) — required when buyer country is SA, BR-KSA-63.
        plot = etree.SubElement(address, f"{cbc_ns}PlotIdentification")
        plot.text = self.invoice.customer.plot_identification

        # Neighborhood (KSA-3).
        district = etree.SubElement(address, f"{cbc_ns}CitySubdivisionName")
        district.text = self.invoice.customer.district

        city = etree.SubElement(address, f"{cbc_ns}CityName")
        city.text = self.invoice.customer.city

        postal = etree.SubElement(address, f"{cbc_ns}PostalZone")
        postal.text = self.invoice.customer.postal_code

        # Region / province (BT-39) — mandatory for SA buyers, BR-KSA-10.
        subentity = etree.SubElement(address, f"{cbc_ns}CountrySubentity")
        subentity.text = self.invoice.customer.district

        country = etree.SubElement(address, f"{cac_ns}Country")
        country_code = etree.SubElement(country, f"{cbc_ns}IdentificationCode")
        country_code.text = self.invoice.customer.country_code
        
        # Party Tax Scheme
        tax_scheme = etree.SubElement(party, f"{cac_ns}PartyTaxScheme")
        company_id = etree.SubElement(tax_scheme, f"{cbc_ns}CompanyID")
        company_id.text = self.invoice.customer.trn
        
        tax_scheme_elem = etree.SubElement(tax_scheme, f"{cac_ns}TaxScheme")
        tax_id = etree.SubElement(tax_scheme_elem, f"{cbc_ns}ID")
        tax_id.text = "VAT"
        
        # Party Legal Entity
        legal_entity = etree.SubElement(party, f"{cac_ns}PartyLegalEntity")
        reg_name = etree.SubElement(legal_entity, f"{cbc_ns}RegistrationName")
        reg_name.text = self.invoice.customer.name
    
    def _build_delivery(self, root: etree.Element):
        """
        Build the Delivery section carrying the supply / actual-delivery date
        (KSA-5). BR-KSA-15 requires it on standard tax invoices; it is harmless
        on simplified invoices, so we always emit it (defaulting to the issue
        date). UBL order: after AccountingCustomerParty, before PaymentMeans.
        """
        cac_ns = f"{{{self.NAMESPACES['cac']}}}"
        cbc_ns = f"{{{self.NAMESPACES['cbc']}}}"

        delivery = etree.SubElement(root, f"{cac_ns}Delivery")
        actual_date = etree.SubElement(delivery, f"{cbc_ns}ActualDeliveryDate")
        actual_date.text = self.invoice.issue_date.isoformat()

    def _build_payment_means(self, root: etree.Element):
        """Build PaymentMeans section."""
        cac_ns = f"{{{self.NAMESPACES['cac']}}}"
        cbc_ns = f"{{{self.NAMESPACES['cbc']}}}"
        
        payment = etree.SubElement(root, f"{cac_ns}PaymentMeans")
        code = etree.SubElement(payment, f"{cbc_ns}PaymentMeansCode")
        code.text = "10"  # Cash (default for simplified)
    
    def _build_tax_total(self, root: etree.Element):
        """Build TaxTotal section with tax subtotals."""
        cac_ns = f"{{{self.NAMESPACES['cac']}}}"
        cbc_ns = f"{{{self.NAMESPACES['cbc']}}}"
        
        tax_total = etree.SubElement(root, f"{cac_ns}TaxTotal")
        
        # Total tax amount
        tax_amount = etree.SubElement(tax_total, f"{cbc_ns}TaxAmount")
        tax_amount.set("currencyID", self.invoice.currency_code)
        tax_amount.text = str(self.invoice.calculated_total_vat)
        
        # Tax subtotal (grouped by VAT rate)
        tax_rates = {}
        for item in self.invoice.line_items:
            rate = item.vat_rate
            if rate not in tax_rates:
                tax_rates[rate] = {
                    'taxable_amount': Decimal('0'),
                    'tax_amount': Decimal('0'),
                    'category': item.tax_code
                }
            tax_rates[rate]['taxable_amount'] += item.line_extension_amount
            tax_rates[rate]['tax_amount'] += item.tax_amount
        
        for rate, data in tax_rates.items():
            subtotal = etree.SubElement(tax_total, f"{cac_ns}TaxSubtotal")
            
            taxable = etree.SubElement(subtotal, f"{cbc_ns}TaxableAmount")
            taxable.set("currencyID", self.invoice.currency_code)
            taxable.text = str(data['taxable_amount'])
            
            tax_amt = etree.SubElement(subtotal, f"{cbc_ns}TaxAmount")
            tax_amt.set("currencyID", self.invoice.currency_code)
            tax_amt.text = str(data['tax_amount'])
            
            category = etree.SubElement(subtotal, f"{cac_ns}TaxCategory")
            cat_id = etree.SubElement(category, f"{cbc_ns}ID")
            cat_id.text = data['category']
            
            percent = etree.SubElement(category, f"{cbc_ns}Percent")
            percent.text = str(rate)
            
            scheme = etree.SubElement(category, f"{cac_ns}TaxScheme")
            scheme_id = etree.SubElement(scheme, f"{cbc_ns}ID")
            scheme_id.text = "VAT"
    
    def _build_legal_monetary_total(self, root: etree.Element):
        """Build LegalMonetaryTotal section."""
        cac_ns = f"{{{self.NAMESPACES['cac']}}}"
        cbc_ns = f"{{{self.NAMESPACES['cbc']}}}"
        
        monetary_total = etree.SubElement(root, f"{cac_ns}LegalMonetaryTotal")
        
        # Line Extension Amount
        line_ext = etree.SubElement(monetary_total, f"{cbc_ns}LineExtensionAmount")
        line_ext.set("currencyID", self.invoice.currency_code)
        line_ext.text = str(self.invoice.calculated_total_excluding_vat)
        
        # Tax Exclusive Amount
        tax_excl = etree.SubElement(monetary_total, f"{cbc_ns}TaxExclusiveAmount")
        tax_excl.set("currencyID", self.invoice.currency_code)
        tax_excl.text = str(self.invoice.calculated_total_excluding_vat)
        
        # Tax Inclusive Amount
        tax_incl = etree.SubElement(monetary_total, f"{cbc_ns}TaxInclusiveAmount")
        tax_incl.set("currencyID", self.invoice.currency_code)
        tax_incl.text = str(self.invoice.calculated_total_including_vat)
        
        # Payable Amount
        payable = etree.SubElement(monetary_total, f"{cbc_ns}PayableAmount")
        payable.set("currencyID", self.invoice.currency_code)
        payable.text = str(self.invoice.calculated_total_including_vat)
    
    def _build_invoice_lines(self, root: etree.Element):
        """Build InvoiceLine elements for each line item."""
        cac_ns = f"{{{self.NAMESPACES['cac']}}}"
        cbc_ns = f"{{{self.NAMESPACES['cbc']}}}"
        
        for idx, item in enumerate(self.invoice.line_items, start=1):
            line = etree.SubElement(root, f"{cac_ns}InvoiceLine")
            
            # Line ID
            line_id = etree.SubElement(line, f"{cbc_ns}ID")
            line_id.text = str(idx)
            
            # Invoiced Quantity
            quantity = etree.SubElement(line, f"{cbc_ns}InvoicedQuantity")
            quantity.set("unitCode", "PCE")  # Piece
            quantity.text = str(item.quantity)
            
            # Line Extension Amount
            line_amount = etree.SubElement(line, f"{cbc_ns}LineExtensionAmount")
            line_amount.set("currencyID", self.invoice.currency_code)
            line_amount.text = str(item.line_extension_amount)
            
            # Tax Total
            tax_total = etree.SubElement(line, f"{cac_ns}TaxTotal")
            tax_amt = etree.SubElement(tax_total, f"{cbc_ns}TaxAmount")
            tax_amt.set("currencyID", self.invoice.currency_code)
            tax_amt.text = str(item.tax_amount)
            
            rounded_amt = etree.SubElement(tax_total, f"{cbc_ns}RoundingAmount")
            rounded_amt.set("currencyID", self.invoice.currency_code)
            rounded_amt.text = str(item.line_total)
            
            # Item
            item_elem = etree.SubElement(line, f"{cac_ns}Item")
            item_name = etree.SubElement(item_elem, f"{cbc_ns}Name")
            item_name.text = item.name
            
            # Classified Tax Category
            tax_category = etree.SubElement(item_elem, f"{cac_ns}ClassifiedTaxCategory")
            cat_id = etree.SubElement(tax_category, f"{cbc_ns}ID")
            cat_id.text = item.tax_code
            
            percent = etree.SubElement(tax_category, f"{cbc_ns}Percent")
            percent.text = str(item.vat_rate)
            
            tax_scheme = etree.SubElement(tax_category, f"{cac_ns}TaxScheme")
            scheme_id = etree.SubElement(tax_scheme, f"{cbc_ns}ID")
            scheme_id.text = "VAT"
            
            # Price
            price_elem = etree.SubElement(line, f"{cac_ns}Price")
            price_amount = etree.SubElement(price_elem, f"{cbc_ns}PriceAmount")
            price_amount.set("currencyID", self.invoice.currency_code)
            price_amount.text = str(item.price)
