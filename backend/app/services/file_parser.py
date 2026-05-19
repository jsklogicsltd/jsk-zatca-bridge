"""
File Parser Service

Parses Excel/CSV files containing invoice data into structured format
for ZATCA processing.
"""

import io
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import pandas as pd


@dataclass
class ParsedLineItem:
    """Parsed line item from file."""
    description: str
    quantity: float
    unit_price: float
    tax_rate: float


@dataclass
class ParsedInvoice:
    """Parsed invoice data from file."""
    customer_name: str
    customer_vat: str
    customer_address: Optional[str]
    customer_city: Optional[str]
    issue_date: str
    due_date: str
    line_items: List[ParsedLineItem]
    reference: Optional[str] = None
    invoice_type: str = "Tax"  # Tax or Simplified


@dataclass
class ParseResult:
    """Result of parsing operation."""
    success: bool
    invoices: List[ParsedInvoice]
    errors: List[Dict[str, Any]]
    warnings: List[str]


# Column name mappings (case-insensitive)
COLUMN_MAPPINGS = {
    "customer_name": ["customer_name", "customer", "company", "company_name", "buyer", "buyer_name"],
    "customer_vat": ["customer_vat", "vat", "vat_number", "tax_id", "trn", "buyer_vat"],
    "customer_address": ["customer_address", "address", "street"],
    "customer_city": ["customer_city", "city"],
    "issue_date": ["issue_date", "date", "invoice_date"],
    "due_date": ["due_date", "payment_due", "payment_date"],
    "item_description": ["item_description", "description", "product", "service", "item", "item_name"],
    "quantity": ["quantity", "qty", "amount"],
    "unit_price": ["unit_price", "price", "rate", "unit_cost"],
    "tax_rate": ["tax_rate", "vat_rate", "tax", "vat_percent"],
    "reference": ["reference", "po_number", "po", "ref"],
    "invoice_type": ["invoice_type", "type"],
}


def normalize_column_name(col: str) -> Optional[str]:
    """Map column name to standard field name."""
    col_lower = col.lower().strip().replace(" ", "_")
    for standard_name, aliases in COLUMN_MAPPINGS.items():
        if col_lower in aliases:
            return standard_name
    return None


def parse_date(date_value: Any) -> Optional[str]:
    """Parse date from various formats to YYYY-MM-DD."""
    if pd.isna(date_value):
        return None
    
    if isinstance(date_value, datetime):
        return date_value.strftime("%Y-%m-%d")
    
    if isinstance(date_value, str):
        # Try common date formats
        formats = ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"]
        for fmt in formats:
            try:
                return datetime.strptime(date_value.strip(), fmt).strftime("%Y-%m-%d")
            except ValueError:
                continue
    
    return str(date_value)


def parse_excel_csv(file_content: bytes, filename: str) -> ParseResult:
    """
    Parse Excel or CSV file content into structured invoice data.
    
    Args:
        file_content: Raw file bytes
        filename: Original filename (for type detection)
        
    Returns:
        ParseResult with invoices, errors, and warnings
    """
    invoices: List[ParsedInvoice] = []
    errors: List[Dict[str, Any]] = []
    warnings: List[str] = []
    
    try:
        # Read file based on extension
        file_ext = filename.lower().split(".")[-1]
        
        if file_ext in ["xlsx", "xls"]:
            df = pd.read_excel(io.BytesIO(file_content), engine="openpyxl")
        elif file_ext == "csv":
            df = pd.read_csv(io.BytesIO(file_content))
        else:
            return ParseResult(
                success=False,
                invoices=[],
                errors=[{"row": 0, "message": f"Unsupported file type: {file_ext}"}],
                warnings=[]
            )
        
        if df.empty:
            return ParseResult(
                success=False,
                invoices=[],
                errors=[{"row": 0, "message": "File is empty"}],
                warnings=[]
            )
        
        # Normalize column names
        column_map = {}
        for col in df.columns:
            normalized = normalize_column_name(str(col))
            if normalized:
                column_map[col] = normalized
            else:
                warnings.append(f"Unknown column: '{col}'")
        
        df = df.rename(columns=column_map)
        
        # Check required columns
        required = ["customer_name", "customer_vat", "issue_date", "item_description", "quantity", "unit_price"]
        missing = [col for col in required if col not in df.columns]
        
        if missing:
            return ParseResult(
                success=False,
                invoices=[],
                errors=[{"row": 0, "message": f"Missing required columns: {', '.join(missing)}"}],
                warnings=warnings
            )
        
        # Group by invoice (customer + date combination)
        # Each row is treated as a line item, grouped by customer+date
        grouped = df.groupby(["customer_name", "customer_vat", "issue_date"], dropna=False)
        
        for (customer_name, customer_vat, issue_date), group in grouped:
            try:
                line_items = []
                
                for idx, row in group.iterrows():
                    row_num = idx + 2  # Excel row number (1-indexed + header)
                    
                    try:
                        item = ParsedLineItem(
                            description=str(row.get("item_description", "")) or "Item",
                            quantity=float(row.get("quantity", 1) or 1),
                            unit_price=float(row.get("unit_price", 0) or 0),
                            tax_rate=float(row.get("tax_rate", 15) if not pd.isna(row.get("tax_rate")) else 15)
                        )
                        line_items.append(item)
                    except (ValueError, TypeError) as e:
                        errors.append({
                            "row": row_num,
                            "message": f"Invalid numeric value: {str(e)}"
                        })
                
                if line_items:
                    invoice = ParsedInvoice(
                        customer_name=str(customer_name) if not pd.isna(customer_name) else "Unknown",
                        customer_vat=str(customer_vat) if not pd.isna(customer_vat) else "",
                        customer_address=str(group.iloc[0].get("customer_address", "")) if "customer_address" in group.columns else None,
                        customer_city=str(group.iloc[0].get("customer_city", "")) if "customer_city" in group.columns else None,
                        issue_date=parse_date(issue_date) or datetime.now().strftime("%Y-%m-%d"),
                        due_date=parse_date(group.iloc[0].get("due_date")) if "due_date" in group.columns else None,
                        line_items=line_items,
                        reference=str(group.iloc[0].get("reference", "")) if "reference" in group.columns and not pd.isna(group.iloc[0].get("reference")) else None,
                        invoice_type=str(group.iloc[0].get("invoice_type", "Tax")) if "invoice_type" in group.columns else "Tax"
                    )
                    invoices.append(invoice)
                    
            except Exception as e:
                errors.append({
                    "row": 0,
                    "message": f"Error processing invoice for {customer_name}: {str(e)}"
                })
        
        return ParseResult(
            success=len(invoices) > 0,
            invoices=invoices,
            errors=errors,
            warnings=warnings
        )
        
    except Exception as e:
        return ParseResult(
            success=False,
            invoices=[],
            errors=[{"row": 0, "message": f"Failed to parse file: {str(e)}"}],
            warnings=[]
        )


def invoice_to_dict(invoice: ParsedInvoice) -> Dict[str, Any]:
    """Convert parsed invoice to API-compatible dictionary."""
    return {
        "invoice_type": invoice.invoice_type,
        "customer": {
            "name": invoice.customer_name,
            "vat": invoice.customer_vat,
            "address": invoice.customer_address or "",
            "city": invoice.customer_city or "Riyadh"
        },
        "issue_date": invoice.issue_date,
        "due_date": invoice.due_date,
        "reference": invoice.reference,
        "line_items": [
            {
                "description": item.description,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "tax_rate": item.tax_rate
            }
            for item in invoice.line_items
        ]
    }
