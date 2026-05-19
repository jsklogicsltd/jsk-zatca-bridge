from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature, encode_dss_signature
from lxml import etree
import hashlib
import base64
from datetime import datetime
from typing import Tuple, Optional
import struct


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
