"""
PDF Parser Service

Extracts invoice data from PDF files using text extraction and OCR.
"""

import io
import re
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
from datetime import datetime

try:
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

try:
    from PIL import Image
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


@dataclass
class ExtractedItem:
    """Extracted line item from PDF."""
    description: str
    quantity: float
    unit_price: float
    tax_rate: float = 15.0


@dataclass
class ExtractedInvoice:
    """Extracted invoice data from PDF."""
    invoice_number: Optional[str]
    invoice_date: Optional[str]
    due_date: Optional[str]
    customer_name: Optional[str]
    customer_vat: Optional[str]
    customer_address: Optional[str]
    subtotal: Optional[float]
    vat_amount: Optional[float]
    total: Optional[float]
    line_items: List[ExtractedItem]
    raw_text: str
    confidence: float  # 0-1 confidence score


@dataclass
class PDFParseResult:
    """Result of PDF parsing operation."""
    success: bool
    invoice: Optional[ExtractedInvoice]
    error: Optional[str]
    warnings: List[str]
    used_ocr: bool


# Regex patterns for common invoice fields
PATTERNS = {
    "invoice_number": [
        r"Invoice\s*(?:No\.?|Number|#)?\s*[:]*\s*([A-Z0-9\-/]+)",
        r"INV[\-/]?\s*([A-Z0-9\-/]+)",
        r"Bill\s*(?:No\.?|Number)?\s*[:]*\s*([A-Z0-9\-/]+)",
    ],
    "date": [
        r"(?:Invoice\s*)?Date\s*[:]*\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})",
        r"(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})",
        r"(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})",
    ],
    "due_date": [
        r"Due\s*(?:Date)?\s*[:]*\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})",
        r"Payment\s*(?:Due)?\s*[:]*\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})",
    ],
    "vat_number": [
        r"(?:VAT|TRN|Tax\s*ID)\s*(?:No\.?|Number)?\s*[:]*\s*(\d{15})",
        r"(?:VAT|TRN|Tax\s*ID)\s*(?:No\.?|Number)?\s*[:]*\s*(\d{9,15})",
    ],
    "total": [
        r"(?:Grand\s*)?Total\s*[:]*\s*(?:SAR|SR|ر\.س)?\s*([\d,]+\.?\d*)",
        r"(?:Amount\s*Due|Total\s*Due)\s*[:]*\s*(?:SAR|SR)?\s*([\d,]+\.?\d*)",
    ],
    "subtotal": [
        r"Sub\s*[-]?Total\s*[:]*\s*(?:SAR|SR)?\s*([\d,]+\.?\d*)",
        r"Taxable\s*Amount\s*[:]*\s*(?:SAR|SR)?\s*([\d,]+\.?\d*)",
    ],
    "vat_amount": [
        r"(?:VAT|Tax)\s*(?:\(\d+%\))?\s*[:]*\s*(?:SAR|SR)?\s*([\d,]+\.?\d*)",
        r"(?:VAT|Tax)\s*Amount\s*[:]*\s*(?:SAR|SR)?\s*([\d,]+\.?\d*)",
    ],
}


def extract_text_from_pdf(file_content: bytes) -> Tuple[str, bool]:
    """
    Extract text from PDF, using OCR as fallback for scanned documents.
    
    Returns:
        Tuple of (extracted_text, used_ocr)
    """
    if not PDF_AVAILABLE:
        raise ImportError("pdfplumber is not installed")
    
    text = ""
    used_ocr = False
    
    with pdfplumber.open(io.BytesIO(file_content)) as pdf:
        for page in pdf.pages:
            # Try text extraction first
            page_text = page.extract_text() or ""
            text += page_text + "\n"
        
        # If very little text extracted, try OCR
        if len(text.strip()) < 100 and OCR_AVAILABLE:
            text = ""
            used_ocr = True
            for page in pdf.pages:
                # Convert page to image for OCR
                image = page.to_image(resolution=300)
                pil_image = image.original
                
                # Run OCR
                ocr_text = pytesseract.image_to_string(pil_image, lang="eng+ara")
                text += ocr_text + "\n"
    
    return text.strip(), used_ocr


def find_pattern(text: str, patterns: List[str]) -> Optional[str]:
    """Find first matching pattern in text."""
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            return match.group(1).strip()
    return None


def parse_amount(amount_str: Optional[str]) -> Optional[float]:
    """Parse amount string to float."""
    if not amount_str:
        return None
    try:
        # Remove commas and parse
        clean = amount_str.replace(",", "").strip()
        return float(clean)
    except ValueError:
        return None


def parse_date_str(date_str: Optional[str]) -> Optional[str]:
    """Parse date string to YYYY-MM-DD format."""
    if not date_str:
        return None
    
    formats = [
        "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y",
        "%m/%d/%Y", "%m-%d-%Y",
        "%Y/%m/%d", "%Y-%m-%d", "%Y.%m.%d",
        "%d/%m/%y", "%m/%d/%y",
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    
    return date_str


def extract_line_items_from_table(pdf_content: bytes) -> List[ExtractedItem]:
    """Try to extract line items from PDF tables."""
    items = []
    
    if not PDF_AVAILABLE:
        return items
    
    try:
        with pdfplumber.open(io.BytesIO(pdf_content)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                
                for table in tables:
                    if not table or len(table) < 2:
                        continue
                    
                    # Try to identify header row
                    header = [str(cell).lower() if cell else "" for cell in table[0]]
                    
                    # Look for description/qty/price columns
                    desc_col = next((i for i, h in enumerate(header) if any(k in h for k in ["description", "item", "product", "service"])), None)
                    qty_col = next((i for i, h in enumerate(header) if any(k in h for k in ["qty", "quantity", "units"])), None)
                    price_col = next((i for i, h in enumerate(header) if any(k in h for k in ["price", "rate", "unit"])), None)
                    
                    if desc_col is not None:
                        for row in table[1:]:
                            try:
                                if not row[desc_col]:
                                    continue
                                    
                                item = ExtractedItem(
                                    description=str(row[desc_col] or "").strip(),
                                    quantity=float(row[qty_col] or 1) if qty_col is not None else 1.0,
                                    unit_price=float(str(row[price_col] or 0).replace(",", "")) if price_col is not None else 0.0,
                                    tax_rate=15.0
                                )
                                if item.description and item.unit_price > 0:
                                    items.append(item)
                            except (ValueError, IndexError):
                                continue
    except Exception:
        pass
    
    return items


def parse_pdf(file_content: bytes) -> PDFParseResult:
    """
    Parse PDF file to extract invoice data.
    
    Args:
        file_content: Raw PDF file bytes
        
    Returns:
        PDFParseResult with extracted data or error
    """
    if not PDF_AVAILABLE:
        return PDFParseResult(
            success=False,
            invoice=None,
            error="PDF processing is not available. Install pdfplumber.",
            warnings=[],
            used_ocr=False
        )
    
    warnings = []
    confidence = 1.0
    
    try:
        # Extract text
        text, used_ocr = extract_text_from_pdf(file_content)
        
        if used_ocr:
            warnings.append("Used OCR for text extraction (scanned document)")
            confidence *= 0.7
        
        if not text:
            return PDFParseResult(
                success=False,
                invoice=None,
                error="Could not extract text from PDF",
                warnings=warnings,
                used_ocr=used_ocr
            )
        
        # Extract fields
        invoice_number = find_pattern(text, PATTERNS["invoice_number"])
        invoice_date = parse_date_str(find_pattern(text, PATTERNS["date"]))
        due_date = parse_date_str(find_pattern(text, PATTERNS["due_date"]))
        
        # Extract VAT numbers - there might be multiple (seller and buyer)
        vat_numbers = re.findall(r'(?:VAT|TRN|Tax\s*ID)?\s*(?:No\.?|Number)?\s*:?\s*(\d{15})', text, re.IGNORECASE)
        
        # Try to extract customer name with specific patterns
        customer_name = None
        customer_vat = None
        customer_address = None
        
        # Pattern for "Customer Name: X" or "Bill To: X"
        customer_patterns = [
            r'Customer\s*Name\s*[:]\s*([A-Za-z0-9\s&\.,\-]+?)(?=\n|VAT|TRN|Building|Address)',
            r'Bill\s*To\s*[:]\s*([A-Za-z0-9\s&\.,\-]+?)(?=\n|VAT|TRN|Building|Address)',
            r'Buyer\s*[:]\s*([A-Za-z0-9\s&\.,\-]+?)(?=\n|VAT|TRN)',
            r'Customer\s*[:]\s*([A-Za-z0-9\s&\.,\-]+?)(?=\n|VAT|TRN)',
        ]
        
        for pattern in customer_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                customer_name = match.group(1).strip()
                break
        
        # Extract customer VAT from "Bill To" section if multiple VATs found
        if vat_numbers:
            if len(vat_numbers) >= 2:
                # Usually second VAT is customer's (first is seller's)
                customer_vat = vat_numbers[1]
            else:
                # Try to determine if the single VAT is customer's
                # Check if it's in the "Bill To" section
                bill_to_section = re.search(r'Bill\s*To.*?(?=From|$)', text, re.IGNORECASE | re.DOTALL)
                if bill_to_section:
                    bill_to_text = bill_to_section.group()
                    if vat_numbers[0] in bill_to_text:
                        customer_vat = vat_numbers[0]
                else:
                    customer_vat = vat_numbers[0]
        
        # Extract address if present
        address_match = re.search(r'(?:Building\s*\d+[,\s]+)?([A-Za-z\s]+Street|[A-Za-z\s]+Road)', text, re.IGNORECASE)
        if address_match:
            customer_address = address_match.group().strip()
        
        # Fallback: If still no customer name, look for patterns near VAT
        if not customer_name and customer_vat:
            lines = text.split("\n")
            for i, line in enumerate(lines):
                if customer_vat in line and i > 0:
                    # Customer name might be a few lines before VAT
                    for j in range(max(0, i-3), i):
                        potential_name = lines[j].strip()
                        # Skip lines that are clearly not names
                        if (len(potential_name) > 3 and 
                            not potential_name.startswith(('VAT', 'TRN', 'Building', 'FROM', 'INVOICE')) and
                            not re.match(r'^[\d\s\-\/\.]+$', potential_name)):
                            customer_name = potential_name
                            break
                    break
        
        subtotal = parse_amount(find_pattern(text, PATTERNS["subtotal"]))
        vat_amount = parse_amount(find_pattern(text, PATTERNS["vat_amount"]))
        total = parse_amount(find_pattern(text, PATTERNS["total"]))
        
        # Extract line items from tables
        line_items = extract_line_items_from_table(file_content)
        
        if not line_items:
            warnings.append("Could not extract line items from tables")
            confidence *= 0.6
            # Create a single estimated line item from totals
            if subtotal and subtotal > 0:
                line_items = [ExtractedItem(
                    description="Extracted invoice item",
                    quantity=1,
                    unit_price=subtotal,
                    tax_rate=15.0
                )]
        
        # Validate what we found
        if not invoice_date:
            invoice_date = datetime.now().strftime("%Y-%m-%d")
            warnings.append("Could not extract invoice date, using today")
            confidence *= 0.8
        
        if not customer_vat:
            warnings.append("Could not extract customer VAT number")
            confidence *= 0.8
        
        invoice = ExtractedInvoice(
            invoice_number=invoice_number,
            invoice_date=invoice_date,
            due_date=due_date,
            customer_name=customer_name,
            customer_vat=customer_vat,
            customer_address=customer_address,
            subtotal=subtotal,
            vat_amount=vat_amount,
            total=total,
            line_items=line_items,
            raw_text=text[:5000],  # Limit text size
            confidence=confidence
        )
        
        return PDFParseResult(
            success=True,
            invoice=invoice,
            error=None,
            warnings=warnings,
            used_ocr=used_ocr
        )
        
    except Exception as e:
        return PDFParseResult(
            success=False,
            invoice=None,
            error=f"Failed to parse PDF: {str(e)}",
            warnings=warnings,
            used_ocr=False
        )


def extracted_invoice_to_dict(invoice: ExtractedInvoice) -> Dict[str, Any]:
    """Convert extracted invoice to API-compatible dictionary."""
    return {
        "invoice_number": invoice.invoice_number,
        "invoice_date": invoice.invoice_date,
        "due_date": invoice.due_date,
        "customer": {
            "name": invoice.customer_name or "Unknown Customer",
            "vat": invoice.customer_vat or "",
            "address": invoice.customer_address or ""
        },
        "subtotal": invoice.subtotal,
        "vat_amount": invoice.vat_amount,
        "total": invoice.total,
        "line_items": [
            {
                "description": item.description,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "tax_rate": item.tax_rate
            }
            for item in invoice.line_items
        ],
        "confidence": invoice.confidence,
        "raw_text_preview": invoice.raw_text[:500] if invoice.raw_text else ""
    }
