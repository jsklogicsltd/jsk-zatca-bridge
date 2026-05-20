from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature, encode_dss_signature
from cryptography import x509
from cryptography.x509.oid import NameOID
from lxml import etree
import hashlib
import base64
from datetime import datetime
from typing import Tuple, Optional
import struct


# ZATCA-relevant X.509 attribute / extension OIDs.
# Reference: https://sandbox.zatca.gov.sa/IntegrationSandbox  (CSR config example)
OID_SN = x509.ObjectIdentifier("2.5.4.4")                        # surName (used for EGS "SN")
OID_UID = x509.ObjectIdentifier("0.9.2342.19200300.100.1.1")     # userId (VAT registration number)
OID_TITLE = x509.ObjectIdentifier("2.5.4.12")                    # title (invoice-type 4-digit code)
OID_REGISTERED_ADDRESS = x509.ObjectIdentifier("2.5.4.26")       # registeredAddress
OID_BUSINESS_CATEGORY = x509.ObjectIdentifier("2.5.4.15")        # businessCategory
OID_MS_TEMPLATE = x509.ObjectIdentifier("1.3.6.1.4.1.311.20.2")  # Microsoft certificate template name

# Sandbox developer-portal expects this template name; production CSIDs use
# "ZATCA-Code-Signing"; the simulation environment uses "PREZATCA-Code-Signing".
TEMPLATE_NAMES = {
    "sandbox": "TSTZATCA-Code-Signing",
    "simulation": "PREZATCA-Code-Signing",
    "production": "ZATCA-Code-Signing",
}


class CryptoSigner:
    """
    Cryptographic signing service for ZATCA e-invoices.
    Handles SHA-256 hashing, ECDSA signing, and TLV QR code generation.
    """
    
    def __init__(self, private_key_pem: Optional[str] = None, certificate_pem: Optional[str] = None):
        """
        Initialize crypto signer.
        
        Args:
            private_key_pem: PEM-encoded private key (SECP256k1)
            certificate_pem: PEM-encoded X.509 certificate
        """
        self.private_key = None
        self.certificate = None
        self.public_key = None
        
        if private_key_pem:
            self.load_private_key(private_key_pem)
        
        if certificate_pem:
            self.load_certificate(certificate_pem)
    
    def generate_key_pair(self) -> Tuple[str, str]:
        """
        Generate new SECP256k1 key pair for testing.
        
        Returns:
            Tuple of (private_key_pem, public_key_pem)
        """
        # Generate private key using SECP256R1 (closest to SECP256k1 available in cryptography)
        private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
        
        # Serialize private key
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode('utf-8')
        
        # Get public key
        public_key = private_key.public_key()
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')
        
        self.private_key = private_key
        self.public_key = public_key
        
        return private_pem, public_pem
    
    def generate_csr(
        self,
        common_name: str,
        organization_name: str,
        organization_unit_name: str,
        organization_identifier: str,
        invoice_type: str = "1100",
        registered_address: str = "Riyadh",
        business_category: str = "General",
        country_code: str = "SA",
        egs_solution_name: str = "ZATCA-Bridge",
        egs_model: str = "EGS-1.0",
        egs_serial: Optional[str] = None,
        environment: str = "sandbox",
    ) -> Tuple[str, str, str]:
        """
        Generate a ZATCA Phase-2 Compliance CSR with a fresh secp256k1 keypair.

        The CSR carries:
          - Subject:           C, OU, O, CN
          - Microsoft template: 1.3.6.1.4.1.311.20.2 = UTF8String:<env-specific name>
          - subjectAltName:    directoryName with
              * SN              (surName OID; format "1-<solution>|2-<model>|3-<serial>")
              * UID             (15-digit VAT registration number)
              * title           (4-digit invoice type, e.g. 1100 = standard+simplified)
              * registeredAddress
              * businessCategory

        Args:
            common_name:             X.509 CN, e.g. "JSK Logics Trading Est."
            organization_name:       Legal name of the organisation
            organization_unit_name:  Department (often "Finance" or branch name)
            organization_identifier: 15-digit VAT number (TRN)
            invoice_type:            4-char invoice-type indicator (see ZATCA spec)
            registered_address:      Free-form address text
            business_category:       Business category, e.g. "Technology"
            country_code:            ISO country code (must be "SA" for ZATCA)
            egs_solution_name:       Name of the e-invoice generation solution
            egs_model:               Model identifier of the EGS unit
            egs_serial:              Per-device unique serial (UUID will be generated if None)
            environment:             sandbox | simulation | production (selects template name)

        Returns:
            Tuple of (private_key_pem, csr_pem, csr_base64)
            where csr_base64 is the base64 encoding of the PEM-formatted CSR — the
            exact form ZATCA's `/compliance` endpoint expects in its `csr` field.
        """
        import uuid as _uuid

        if egs_serial is None:
            egs_serial = str(_uuid.uuid4())

        # 1. secp256k1 keypair (ZATCA requirement; differs from invoice signing
        #    which historically used SECP256R1 in this codebase).
        private_key = ec.generate_private_key(ec.SECP256K1(), default_backend())

        # 2. Subject
        subject = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, country_code),
            x509.NameAttribute(NameOID.ORGANIZATIONAL_UNIT_NAME, organization_unit_name),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, organization_name),
            x509.NameAttribute(NameOID.COMMON_NAME, common_name),
        ])

        # 3. directoryName for SAN
        san_directory = x509.Name([
            x509.NameAttribute(OID_SN, f"1-{egs_solution_name}|2-{egs_model}|3-{egs_serial}"),
            x509.NameAttribute(OID_UID, organization_identifier),
            x509.NameAttribute(OID_TITLE, invoice_type),
            x509.NameAttribute(OID_REGISTERED_ADDRESS, registered_address),
            x509.NameAttribute(OID_BUSINESS_CATEGORY, business_category),
        ])

        # 4. Microsoft cert-template extension carrying ZATCA's template name,
        #    DER-encoded as an ASN.1 UTF8String.
        template_name = TEMPLATE_NAMES.get(environment, TEMPLATE_NAMES["sandbox"])
        template_bytes = template_name.encode("utf-8")
        utf8_string_der = bytes([0x0C, len(template_bytes)]) + template_bytes
        template_extension = x509.UnrecognizedExtension(OID_MS_TEMPLATE, utf8_string_der)

        # 5. Build & sign the CSR
        csr_builder = (
            x509.CertificateSigningRequestBuilder()
            .subject_name(subject)
            .add_extension(
                x509.SubjectAlternativeName([x509.DirectoryName(san_directory)]),
                critical=False,
            )
            .add_extension(template_extension, critical=False)
        )
        csr = csr_builder.sign(private_key, hashes.SHA256(), default_backend())

        # 6. Serialise
        private_key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        ).decode("utf-8")
        csr_pem = csr.public_bytes(serialization.Encoding.PEM).decode("utf-8")

        # ZATCA's /compliance endpoint wants the PEM (headers included) base64-
        # encoded again as a single string in the `csr` field of the JSON body.
        csr_base64 = base64.b64encode(csr_pem.encode("utf-8")).decode("utf-8")

        return private_key_pem, csr_pem, csr_base64

    def load_private_key(self, private_key_pem: str):
        """Load private key from PEM string."""
        self.private_key = serialization.load_pem_private_key(
            private_key_pem.encode('utf-8'),
            password=None,
            backend=default_backend()
        )
        self.public_key = self.private_key.public_key()
    
    def load_certificate(self, certificate_pem: str):
        """Load X.509 certificate from PEM string."""
        self.certificate = certificate_pem
    
    def canonicalize_xml(self, xml_bytes: bytes) -> bytes:
        """
        Apply C14N (Canonicalization) to XML.
        Removes whitespace and sorts attributes for consistent hashing.
        
        Args:
            xml_bytes: Raw XML bytes
            
        Returns:
            Canonicalized XML bytes
        """
        tree = etree.fromstring(xml_bytes)
        
        # Apply C14N canonicalization
        canonical_xml = etree.tostring(
            tree,
            method='c14n',
            exclusive=False,
            with_comments=False
        )
        
        return canonical_xml
    
    def hash_xml(self, xml_bytes: bytes) -> str:
        """
        Generate SHA-256 hash of canonicalized XML.
        
        Args:
            xml_bytes: XML bytes to hash
            
        Returns:
            Base64-encoded SHA-256 hash
        """
        # Canonicalize first
        canonical_xml = self.canonicalize_xml(xml_bytes)
        
        # Generate SHA-256 hash
        hash_digest = hashlib.sha256(canonical_xml).digest()
        
        # Encode to Base64
        hash_base64 = base64.b64encode(hash_digest).decode('utf-8')
        
        return hash_base64
    
    def sign_hash(self, hash_bytes: bytes) -> str:
        """
        Sign hash using ECDSA with SECP256R1.
        
        Args:
            hash_bytes: Hash to sign
            
        Returns:
            Base64-encoded signature
        """
        if not self.private_key:
            raise ValueError("Private key not loaded")
        
        # Sign using ECDSA
        signature = self.private_key.sign(
            hash_bytes,
            ec.ECDSA(hashes.SHA256())
        )
        
        # Encode to Base64
        signature_base64 = base64.b64encode(signature).decode('utf-8')
        
        return signature_base64
    
    def sign_invoice_xml(self, xml_bytes: bytes) -> Tuple[str, str, bytes]:
        """
        Sign invoice XML and return hash, signature, and signed XML.
        
        Args:
            xml_bytes: UBL XML to sign
            
        Returns:
            Tuple of (hash_base64, signature_base64, signed_xml_bytes)
        """
        # Generate hash
        hash_base64 = self.hash_xml(xml_bytes)
        hash_bytes = base64.b64decode(hash_base64)
        
        # Sign hash
        signature_base64 = self.sign_hash(hash_bytes)
        
        # Insert signature into XML
        signed_xml = self._insert_signature_into_xml(
            xml_bytes,
            hash_base64,
            signature_base64
        )
        
        return hash_base64, signature_base64, signed_xml
    
    def _insert_signature_into_xml(
        self,
        xml_bytes: bytes,
        hash_base64: str,
        signature_base64: str
    ) -> bytes:
        """
        Insert digital signature into UBLExtensions section.
        
        Args:
            xml_bytes: Original XML
            hash_base64: Base64-encoded hash
            signature_base64: Base64-encoded signature
            
        Returns:
            Signed XML bytes
        """
        tree = etree.fromstring(xml_bytes)
        
        # Find UBLExtensions/UBLExtension/ExtensionContent
        namespaces = {
            'ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
            'ds': 'http://www.w3.org/2000/09/xmldsig#'
        }
        
        extension_content = tree.find('.//ext:ExtensionContent', namespaces)
        
        if extension_content is not None:
            # Clear existing content
            extension_content.clear()
            
            # Create Signature element
            ds_ns = '{http://www.w3.org/2000/09/xmldsig#}'
            signature = etree.SubElement(extension_content, f'{ds_ns}Signature')
            signature.set('Id', 'signature')
            
            # SignedInfo
            signed_info = etree.SubElement(signature, f'{ds_ns}SignedInfo')
            
            canonicalization_method = etree.SubElement(signed_info, f'{ds_ns}CanonicalizationMethod')
            canonicalization_method.set('Algorithm', 'http://www.w3.org/2001/10/xml-exc-c14n#')
            
            signature_method = etree.SubElement(signed_info, f'{ds_ns}SignatureMethod')
            signature_method.set('Algorithm', 'http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256')
            
            reference = etree.SubElement(signed_info, f'{ds_ns}Reference')
            reference.set('URI', '')
            
            transforms = etree.SubElement(reference, f'{ds_ns}Transforms')
            transform = etree.SubElement(transforms, f'{ds_ns}Transform')
            transform.set('Algorithm', 'http://www.w3.org/2000/09/xmldsig#enveloped-signature')
            
            digest_method = etree.SubElement(reference, f'{ds_ns}DigestMethod')
            digest_method.set('Algorithm', 'http://www.w3.org/2001/04/xmlenc#sha256')
            
            digest_value = etree.SubElement(reference, f'{ds_ns}DigestValue')
            digest_value.text = hash_base64
            
            # SignatureValue
            signature_value = etree.SubElement(signature, f'{ds_ns}SignatureValue')
            signature_value.text = signature_base64
            
            # KeyInfo (if certificate available)
            if self.certificate:
                key_info = etree.SubElement(signature, f'{ds_ns}KeyInfo')
                x509_data = etree.SubElement(key_info, f'{ds_ns}X509Data')
                x509_cert = etree.SubElement(x509_data, f'{ds_ns}X509Certificate')
                # Remove PEM headers and newlines
                cert_clean = self.certificate.replace('-----BEGIN CERTIFICATE-----', '')
                cert_clean = cert_clean.replace('-----END CERTIFICATE-----', '')
                cert_clean = cert_clean.replace('\n', '').strip()
                x509_cert.text = cert_clean
        
        # Convert back to bytes
        signed_xml_bytes = etree.tostring(
            tree,
            pretty_print=True,
            xml_declaration=True,
            encoding='UTF-8'
        )
        
        return signed_xml_bytes
    
    def generate_tlv_qr(
        self,
        seller_name: str,
        vat_number: str,
        timestamp: str,
        invoice_total: str,
        vat_total: str,
        xml_hash: str,
        signature: str,
        public_key: str
    ) -> str:
        """
        Generate TLV (Tag-Length-Value) encoded QR code data.
        
        ZATCA TLV Tags:
        - Tag 1: Seller Name
        - Tag 2: VAT Registration Number
        - Tag 3: Invoice Timestamp
        - Tag 4: Invoice Total (with VAT)
        - Tag 5: VAT Total
        - Tag 6: Invoice Hash (XML)
        - Tag 7: ECDSA Signature
        - Tag 8: Public Key / Certificate
        
        Args:
            seller_name: Supplier name
            vat_number: Supplier TRN
            timestamp: Invoice timestamp (ISO format)
            invoice_total: Total amount including VAT
            vat_total: Total VAT amount
            xml_hash: SHA-256 hash of XML
            signature: ECDSA signature
            public_key: Public key or certificate
            
        Returns:
            Base64-encoded TLV byte array
        """
        tlv_data = bytearray()
        
        # Helper to add TLV field
        def add_tlv_field(tag: int, value: str):
            value_bytes = value.encode('utf-8')
            tlv_data.append(tag)  # Tag
            tlv_data.append(len(value_bytes))  # Length
            tlv_data.extend(value_bytes)  # Value
        
        # Tag 1: Seller Name
        add_tlv_field(1, seller_name)
        
        # Tag 2: VAT Registration Number
        add_tlv_field(2, vat_number)
        
        # Tag 3: Timestamp
        add_tlv_field(3, timestamp)
        
        # Tag 4: Invoice Total
        add_tlv_field(4, invoice_total)
        
        # Tag 5: VAT Total
        add_tlv_field(5, vat_total)
        
        # Tag 6: Invoice Hash (decode from base64 first)
        hash_bytes = base64.b64decode(xml_hash)
        tlv_data.append(6)
        tlv_data.append(len(hash_bytes))
        tlv_data.extend(hash_bytes)
        
        # Tag 7: ECDSA Signature (decode from base64 first)
        sig_bytes = base64.b64decode(signature)
        tlv_data.append(7)
        tlv_data.append(len(sig_bytes))
        tlv_data.extend(sig_bytes)
        
        # Tag 8: Public Key/Certificate
        add_tlv_field(8, public_key)
        
        # Encode entire TLV to Base64
        tlv_base64 = base64.b64encode(bytes(tlv_data)).decode('utf-8')
        
        return tlv_base64
    
    def insert_qr_code_into_xml(self, xml_bytes: bytes, qr_data: str) -> bytes:
        """
        Insert QR code data into AdditionalDocumentReference section.
        
        Args:
            xml_bytes: Signed XML
            qr_data: Base64-encoded TLV QR data
            
        Returns:
            XML with QR code inserted
        """
        tree = etree.fromstring(xml_bytes)
        
        namespaces = {
            'cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
            'cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'
        }
        
        cac_ns = '{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}'
        cbc_ns = '{urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2}'
        
        # Find or create AdditionalDocumentReference for QR
        # Insert before AccountingSupplierParty
        supplier_party = tree.find('.//cac:AccountingSupplierParty', namespaces)
        
        if supplier_party is not None:
            qr_ref = etree.Element(f'{cac_ns}AdditionalDocumentReference')
            
            ref_id = etree.SubElement(qr_ref, f'{cbc_ns}ID')
            ref_id.text = "QR"
            
            attachment = etree.SubElement(qr_ref, f'{cac_ns}Attachment')
            embedded_doc = etree.SubElement(attachment, f'{cbc_ns}EmbeddedDocumentBinaryObject')
            embedded_doc.set('mimeCode', 'text/plain')
            embedded_doc.text = qr_data
            
            # Insert before supplier party
            supplier_index = list(tree).index(supplier_party)
            tree.insert(supplier_index, qr_ref)
        
        # Convert back to bytes
        qr_xml_bytes = etree.tostring(
            tree,
            pretty_print=True,
            xml_declaration=True,
            encoding='UTF-8'
        )
        
        return qr_xml_bytes
