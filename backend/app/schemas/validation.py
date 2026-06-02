from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Optional
from decimal import Decimal
from datetime import date
from enum import Enum
import re


class InvoiceType(str, Enum):
    """ZATCA invoice type."""
    TAX = "Tax"
    SIMPLIFIED = "Simplified"


class Address(BaseModel):
    """Address validation schema."""
    street: str = Field(..., min_length=1, max_length=127)
    building_number: str = Field(..., pattern=r'^\d{4}$')
    city: str = Field(..., min_length=1, max_length=127)
    district: str = Field(..., min_length=1, max_length=127)
    postal_code: str = Field(..., pattern=r'^\d{5}$')
    country_code: str = Field(default="SA", pattern=r'^[A-Z]{2}$')
    
    @field_validator('street', 'city', 'district')
    @classmethod
    def validate_no_special_chars(cls, v: str) -> str:
        """Ensure no prohibited special characters."""
        prohibited = r'[<>{}\\]'
        if re.search(prohibited, v):
            raise ValueError(f'Field contains prohibited characters: {v}')
        return v.strip()


class Party(BaseModel):
    """Supplier/Customer party validation."""
    trn: str = Field(..., description="Tax Registration Number (15 digits)")
    name: str = Field(..., min_length=1, max_length=127)
    street: str = Field(..., min_length=1, max_length=127)
    building_number: str = Field(..., pattern=r'^\d{4}$')
    # ZATCA KSA-23/KSA-19 "additional number" (UBL PlotIdentification): a
    # mandatory 4-digit secondary address number distinct from the building
    # number (BR-KSA-64/65). Defaults to the building number when the source
    # ERP doesn't carry a separate value.
    additional_number: Optional[str] = Field(default=None, pattern=r'^\d{4}$')
    city: str = Field(..., min_length=1, max_length=127)
    district: str = Field(..., min_length=1, max_length=127)
    postal_code: str = Field(..., pattern=r'^\d{5}$')
    country_code: str = Field(default="SA", pattern=r'^[A-Z]{2}$')

    @property
    def plot_identification(self) -> str:
        """KSA-23 additional number, falling back to the building number."""
        return self.additional_number or self.building_number
    
    @field_validator('trn')
    @classmethod
    def validate_trn(cls, v: str) -> str:
        """
        Validate TRN (Tax Registration Number) according to ZATCA rules.
        - Must be exactly 15 digits
        - Must start with '3' (for entities) or '1' (for individuals)
        - Must end with '3' (VAT registration)
        """
        # Remove any spaces or dashes
        trn_clean = v.replace(' ', '').replace('-', '')
        
        # Check if exactly 15 digits
        if not trn_clean.isdigit() or len(trn_clean) != 15:
            raise ValueError('TRN must be exactly 15 digits')
        
        # Check starting digit (3 for entities, 1 for individuals)
        if trn_clean[0] not in ['1', '3']:
            raise ValueError('TRN must start with 1 (individual) or 3 (entity)')
        
        # Check ending digit (must be 3 for VAT registration)
        if trn_clean[-1] != '3':
            raise ValueError('TRN must end with 3 (VAT registration)')
        
        return trn_clean
    
    @field_validator('name', 'street', 'city', 'district')
    @classmethod
    def validate_no_special_chars(cls, v: str) -> str:
        """Ensure no prohibited special characters."""
        prohibited = r'[<>{}\\]'
        if re.search(prohibited, v):
            raise ValueError(f'Field contains prohibited characters')
        return v.strip()


class LineItem(BaseModel):
    """Invoice line item validation."""
    name: str = Field(..., min_length=1, max_length=127, description="Item name")
    quantity: Decimal = Field(..., gt=0, description="Quantity")
    price: Decimal = Field(..., gt=0, description="Unit price (excluding VAT)")
    vat_rate: Decimal = Field(..., ge=0, le=100, description="VAT percentage (0-100)")
    tax_code: str = Field(..., pattern=r'^[A-Z]{1,2}$', description="Tax category code (S, Z, E, O)")
    discount: Optional[Decimal] = Field(default=Decimal('0'), ge=0, description="Line discount amount")
    
    @property
    def line_extension_amount(self) -> Decimal:
        """Calculate line amount before VAT."""
        return (self.quantity * self.price - self.discount).quantize(Decimal('0.01'))
    
    @property
    def tax_amount(self) -> Decimal:
        """Calculate VAT amount for this line."""
        return (self.line_extension_amount * self.vat_rate / 100).quantize(Decimal('0.01'))
    
    @property
    def line_total(self) -> Decimal:
        """Calculate total including VAT."""
        return (self.line_extension_amount + self.tax_amount).quantize(Decimal('0.01'))
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Ensure no prohibited characters in item name."""
        prohibited = r'[<>{}\\]'
        if re.search(prohibited, v):
            raise ValueError('Item name contains prohibited characters')
        return v.strip()
    
    @field_validator('tax_code')
    @classmethod
    def validate_tax_code(cls, v: str) -> str:
        """Validate ZATCA tax category codes."""
        valid_codes = ['S', 'Z', 'E', 'O', 'SR', 'ZR', 'ES', 'OS']
        if v.upper() not in valid_codes:
            raise ValueError(f'Tax code must be one of: {", ".join(valid_codes)}')
        return v.upper()


class InvoiceCreate(BaseModel):
    """
    Invoice creation schema with ZATCA validation.
    Accepts simplified JSON from legacy ERP systems.
    """
    invoice_type: InvoiceType = Field(..., description="Tax or Simplified invoice")
    invoice_number: str = Field(..., min_length=1, max_length=50, description="Unique invoice number")
    issue_date: date = Field(..., description="Invoice issue date (YYYY-MM-DD)")
    
    # Parties
    supplier: Party = Field(..., description="Supplier details")
    customer: Party = Field(..., description="Customer details")
    
    # Line items
    line_items: List[LineItem] = Field(..., min_items=1, description="Invoice line items")
    
    # Optional totals (for validation)
    total_excluding_vat: Optional[Decimal] = Field(None, description="Total before VAT")
    total_vat: Optional[Decimal] = Field(None, description="Total VAT amount")
    total_including_vat: Optional[Decimal] = Field(None, description="Total including VAT")
    
    # Additional fields
    currency_code: str = Field(default="SAR", pattern=r'^[A-Z]{3}$')
    notes: Optional[str] = Field(None, max_length=500)
    
    @property
    def calculated_total_excluding_vat(self) -> Decimal:
        """Calculate total before VAT from line items."""
        return sum(item.line_extension_amount for item in self.line_items).quantize(Decimal('0.01'))
    
    @property
    def calculated_total_vat(self) -> Decimal:
        """Calculate total VAT from line items."""
        return sum(item.tax_amount for item in self.line_items).quantize(Decimal('0.01'))
    
    @property
    def calculated_total_including_vat(self) -> Decimal:
        """Calculate total including VAT from line items."""
        return (self.calculated_total_excluding_vat + self.calculated_total_vat).quantize(Decimal('0.01'))
    
    @model_validator(mode='after')
    def validate_totals(self):
        """
        Validate that provided totals match calculated totals.
        Tolerance of 0.01 for rounding differences.
        """
        tolerance = Decimal('0.01')
        
        # If totals provided, validate them
        if self.total_excluding_vat is not None:
            diff = abs(self.total_excluding_vat - self.calculated_total_excluding_vat)
            if diff > tolerance:
                raise ValueError(
                    f'Total excluding VAT mismatch: provided {self.total_excluding_vat}, '
                    f'calculated {self.calculated_total_excluding_vat}'
                )
        
        if self.total_vat is not None:
            diff = abs(self.total_vat - self.calculated_total_vat)
            if diff > tolerance:
                raise ValueError(
                    f'Total VAT mismatch: provided {self.total_vat}, '
                    f'calculated {self.calculated_total_vat}'
                )
        
        if self.total_including_vat is not None:
            diff = abs(self.total_including_vat - self.calculated_total_including_vat)
            if diff > tolerance:
                raise ValueError(
                    f'Total including VAT mismatch: provided {self.total_including_vat}, '
                    f'calculated {self.calculated_total_including_vat}'
                )
        
        return self
    
    @field_validator('invoice_number')
    @classmethod
    def validate_invoice_number(cls, v: str) -> str:
        """Validate invoice number format."""
        # No special characters except hyphen and underscore
        if not re.match(r'^[A-Za-z0-9\-_]+$', v):
            raise ValueError('Invoice number can only contain letters, numbers, hyphens, and underscores')
        return v.strip()


class InvoiceValidationResponse(BaseModel):
    """Response for invoice validation."""
    success: bool
    message: str
    invoice_number: Optional[str] = None
    calculated_totals: Optional[dict] = None
    errors: Optional[List[dict]] = None


class InvoiceCalculationResult(BaseModel):
    """Calculation results for invoice."""
    total_excluding_vat: Decimal
    total_vat: Decimal
    total_including_vat: Decimal
    line_items_count: int
    currency_code: str
