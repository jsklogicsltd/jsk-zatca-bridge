"""
File Upload Endpoints

Handles file uploads for batch invoice processing and PDF parsing.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel

from app.services.file_parser import parse_excel_csv, invoice_to_dict
from app.services.pdf_parser import parse_pdf, extracted_invoice_to_dict


router = APIRouter()


# Response models
class LineItemResponse(BaseModel):
    description: str
    quantity: float
    unit_price: float
    tax_rate: float


class CustomerResponse(BaseModel):
    name: str
    vat: str
    address: str = ""
    city: str = ""


class ParsedInvoiceResponse(BaseModel):
    invoice_type: str = "Tax"
    customer: CustomerResponse
    issue_date: str
    due_date: Optional[str] = None
    reference: Optional[str] = None
    line_items: List[LineItemResponse]


class BatchUploadResponse(BaseModel):
    success: bool
    total_invoices: int
    invoices: List[Dict[str, Any]]
    errors: List[Dict[str, Any]]
    warnings: List[str]


class PDFUploadResponse(BaseModel):
    success: bool
    invoice: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    warnings: List[str]
    used_ocr: bool
    confidence: float = 0.0


@router.post("/batch", response_model=BatchUploadResponse)
async def upload_batch_file(
    file: UploadFile = File(..., description="Excel (.xlsx, .xls) or CSV file")
):
    """
    Upload an Excel or CSV file containing multiple invoices.
    
    The file should have these columns (case-insensitive):
    - customer_name: Customer/company name
    - customer_vat: VAT/TRN number (15 digits)
    - issue_date: Invoice date (YYYY-MM-DD or DD/MM/YYYY)
    - due_date: Payment due date (optional)
    - item_description: Product or service description
    - quantity: Quantity
    - unit_price: Price per unit
    - tax_rate: VAT rate (15 for 15%, 0 for exempt)
    
    Multiple rows with the same customer+date are grouped into a single invoice
    with multiple line items.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded"
        )
    
    # Validate file extension
    ext = file.filename.lower().split(".")[-1]
    if ext not in ["xlsx", "xls", "csv"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {ext}. Must be .xlsx, .xls, or .csv"
        )
    
    # Read file content
    content = await file.read()
    
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file uploaded"
        )
    
    # Parse the file
    result = parse_excel_csv(content, file.filename)
    
    # Convert invoices to response format
    invoices = [invoice_to_dict(inv) for inv in result.invoices]
    
    return BatchUploadResponse(
        success=result.success,
        total_invoices=len(invoices),
        invoices=invoices,
        errors=result.errors,
        warnings=result.warnings
    )


@router.post("/pdf", response_model=PDFUploadResponse)
async def upload_pdf_invoice(
    file: UploadFile = File(..., description="PDF invoice file")
):
    """
    Upload a PDF invoice for automatic data extraction.
    
    The system will attempt to extract:
    - Invoice number
    - Invoice date and due date
    - Customer name and VAT number
    - Line items (from tables)
    - Totals (subtotal, VAT, grand total)
    
    For scanned PDFs, OCR will be used if tesseract is installed.
    
    The extracted data should be reviewed before submission as
    accuracy may vary depending on the PDF format.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded"
        )
    
    # Validate file extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a PDF"
        )
    
    # Read file content
    content = await file.read()
    
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file uploaded"
        )
    
    # Parse the PDF
    result = parse_pdf(content)
    
    if not result.success:
        return PDFUploadResponse(
            success=False,
            invoice=None,
            error=result.error,
            warnings=result.warnings,
            used_ocr=result.used_ocr,
            confidence=0.0
        )
    
    # Convert to response format
    invoice_data = extracted_invoice_to_dict(result.invoice) if result.invoice else None
    
    return PDFUploadResponse(
        success=True,
        invoice=invoice_data,
        error=None,
        warnings=result.warnings,
        used_ocr=result.used_ocr,
        confidence=result.invoice.confidence if result.invoice else 0.0
    )


@router.get("/template/csv")
async def get_csv_template():
    """
    Get a sample CSV template for batch invoice upload.
    Returns the template content as plain text.
    """
    template = """customer_name,customer_vat,issue_date,due_date,item_description,quantity,unit_price,tax_rate
Acme Corporation,300000000000001,2026-01-30,2026-02-28,Consulting Services,10,500.00,15
Acme Corporation,300000000000001,2026-01-30,2026-02-28,Project Management,1,2000.00,15
Tech Solutions Ltd,300000000000002,2026-01-30,2026-03-01,Software License,5,1000.00,15
Tech Solutions Ltd,300000000000002,2026-01-30,2026-03-01,Support Package,1,500.00,15
Global Trading Co,300000000000003,2026-01-30,2026-02-15,Product A,100,25.00,15
Global Trading Co,300000000000003,2026-01-30,2026-02-15,Product B,50,40.00,0"""
    
    return {"template": template, "filename": "invoice_template.csv"}


@router.get("/template/info")
async def get_template_info():
    """
    Get information about the expected file format.
    """
    return {
        "formats_supported": ["xlsx", "xls", "csv", "pdf"],
        "required_columns": [
            "customer_name",
            "customer_vat", 
            "issue_date",
            "item_description",
            "quantity",
            "unit_price"
        ],
        "optional_columns": [
            "due_date",
            "tax_rate",
            "reference",
            "invoice_type",
            "customer_address",
            "customer_city"
        ],
        "column_aliases": {
            "customer_name": ["customer", "company", "buyer"],
            "customer_vat": ["vat", "trn", "tax_id"],
            "issue_date": ["date", "invoice_date"],
            "item_description": ["description", "product", "service"],
            "quantity": ["qty", "amount"],
            "unit_price": ["price", "rate"],
            "tax_rate": ["vat_rate", "tax"]
        },
        "date_formats": ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"],
        "notes": [
            "Multiple rows with same customer+date are grouped into one invoice",
            "VAT number should be 15 digits",
            "Tax rate is 15 for standard rate, 0 for exempt"
        ]
    }
