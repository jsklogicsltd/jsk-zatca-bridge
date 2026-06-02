from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SQLEnum, JSON, Numeric
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.db.base import Base


class InvoiceStatus(str, enum.Enum):
    """Invoice status enum for ZATCA compliance workflow."""
    DRAFT = "DRAFT"
    SIGNED = "SIGNED"
    REPORTED = "REPORTED"
    CLEARED = "CLEARED"
    REJECTED = "REJECTED"


class Invoice(Base):
    """
    Invoice model for storing ZATCA-compliant e-invoices.
    
    Implements blockchain-like hash chaining required by ZATCA.
    """
    __tablename__ = "invoices"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Unique identifiers
    uuid = Column(String(36), unique=True, index=True, nullable=False)
    invoice_number = Column(String(100), unique=True, index=True, nullable=False)
    
    # Monetary totals (kept on the row so /stats can aggregate without
    # re-parsing xml_content). Columns exist on the table from migration 001.
    subtotal = Column(Numeric(12, 2), nullable=True)      # TaxExclusiveAmount
    tax_amount = Column(Numeric(12, 2), nullable=True)    # TaxAmount (VAT)
    total = Column(Numeric(12, 2), nullable=True)         # TaxInclusiveAmount
    currency = Column(String(3), nullable=True)

    # Invoice data
    xml_content = Column(Text, nullable=True)  # Generated UBL 2.1 XML
    
    # ZATCA compliance fields
    hash = Column(String(64), nullable=True)  # SHA256 hash of invoice
    previous_hash = Column(String(64), nullable=True)  # Previous invoice hash for chaining
    signature = Column(Text, nullable=True)  # Digital signature
    qr_code = Column(Text, nullable=True)  # Base64 TLV QR code data
    
    # Status tracking
    status = Column(
        SQLEnum(InvoiceStatus),
        nullable=False,
        default=InvoiceStatus.DRAFT,
        index=True
    )
    
    # ZATCA API response
    zatca_response = Column(JSON, nullable=True)  # Store API errors/warnings
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<Invoice(id={self.id}, invoice_number='{self.invoice_number}', status='{self.status}')>"
