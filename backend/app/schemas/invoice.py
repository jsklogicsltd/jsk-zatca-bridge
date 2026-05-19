from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from .validation import InvoiceCreate

class InvoiceBase(BaseModel):
    invoice_number: str
    status: str

class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    zatca_response: Optional[Dict[str, Any]] = None

class InvoiceResponse(BaseModel):
    id: int
    uuid: str
    invoice_number: str
    status: str
    hash: Optional[str] = None
    previous_hash: Optional[str] = None
    xml_content: Optional[str] = None
    qr_code: Optional[str] = None
    signature: Optional[str] = None
    zatca_response: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InvoiceListResponse(BaseModel):
    total: int
    invoices: List[InvoiceResponse]
