from lxml import etree
from datetime import datetime
from decimal import Decimal
from typing import Optional
import uuid
from app.schemas.validation import InvoiceCreate


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
    
    def __init__(self, invoice_data: InvoiceCreate, previous_invoice_hash: Optional[str] = None):
        """
        Initialize XML builder.
        
        Args:
            invoice_data: Validated invoice data
            previous_invoice_hash: Hash of previous invoice (PIH) for chaining
        """
        self.invoice = invoice_data
        self.previous_hash = previous_invoice_hash
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
        self._build_supplier_party(root)
        self._build_customer_party(root)
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
        
        # UUID
        uuid_elem = etree.SubElement(root, f"{cbc_ns}UUID")
        uuid_elem.text = self.invoice_uuid
        
        # Invoice ID
        id_elem = etree.SubElement(root, f"{cbc_ns}ID")
        id_elem.text = self.invoice.invoice_number
        
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
        """Build AdditionalDocumentReference with PIH (Previous Invoice Hash)."""
        if not self.previous_hash:
            return
        
        cac_ns = f"{{{self.NAMESPACES['cac']}}}"
        cbc_ns = f"{{{self.NAMESPACES['cbc']}}}"
        
        doc_ref = etree.SubElement(root, f"{cac_ns}AdditionalDocumentReference")
        
        ref_id = etree.SubElement(doc_ref, f"{cbc_ns}ID")
        ref_id.text = "PIH"
        
        attachment = etree.SubElement(doc_ref, f"{cac_ns}Attachment")
        embedded_doc = etree.SubElement(attachment, f"{cbc_ns}EmbeddedDocumentBinaryObject")
        embedded_doc.set("mimeCode", "text/plain")
        embedded_doc.text = self.previous_hash
    
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
        
        street = etree.SubElement(address, f"{cbc_ns}StreetName")
        street.text = self.invoice.supplier.street
        
        building = etree.SubElement(address, f"{cbc_ns}BuildingNumber")
        building.text = self.invoice.supplier.building_number
        
        city = etree.SubElement(address, f"{cbc_ns}CityName")
        city.text = self.invoice.supplier.city
        
        postal = etree.SubElement(address, f"{cbc_ns}PostalCode")
        postal.text = self.invoice.supplier.postal_code
        
        district = etree.SubElement(address, f"{cbc_ns}CitySubdivisionName")
        district.text = self.invoice.supplier.district
        
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
        
        street = etree.SubElement(address, f"{cbc_ns}StreetName")
        street.text = self.invoice.customer.street
        
        building = etree.SubElement(address, f"{cbc_ns}BuildingNumber")
        building.text = self.invoice.customer.building_number
        
        city = etree.SubElement(address, f"{cbc_ns}CityName")
        city.text = self.invoice.customer.city
        
        postal = etree.SubElement(address, f"{cbc_ns}PostalCode")
        postal.text = self.invoice.customer.postal_code
        
        district = etree.SubElement(address, f"{cbc_ns}CitySubdivisionName")
        district.text = self.invoice.customer.district
        
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
