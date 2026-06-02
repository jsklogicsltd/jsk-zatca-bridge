from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional, List
from datetime import date, datetime
from app.db.session import get_db
from app.models.invoice import Invoice, InvoiceStatus
from app.schemas.invoice import InvoiceResponse, InvoiceListResponse
from pydantic import BaseModel

router = APIRouter()


class DashboardStats(BaseModel):
    """Dashboard statistics model."""
    total_invoices: int
    total_revenue: float
    total_vat: float
    cleared_count: int
    reported_count: int
    rejected_count: int
    draft_count: int
    signed_count: int


@router.get("/invoices", response_model=InvoiceListResponse)
async def list_invoices(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of records to return"),
    status: Optional[InvoiceStatus] = Query(None, description="Filter by status"),
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    db: AsyncSession = Depends(get_db)
):
    """
    List invoices with pagination and filtering.
    
    Args:
        skip: Offset for pagination
        limit: Maximum number of results
        status: Filter by invoice status
        start_date: Filter invoices from this date
        end_date: Filter invoices to this date
        db: Database session
        
    Returns:
        Paginated list of invoices
    """
    # Build query
    query = select(Invoice)
    
    # Apply filters
    filters = []
    if status:
        filters.append(Invoice.status == status)
    if start_date:
        filters.append(Invoice.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        filters.append(Invoice.created_at <= datetime.combine(end_date, datetime.max.time()))
    
    if filters:
        query = query.where(and_(*filters))
    
    # Get total count
    count_query = select(func.count()).select_from(Invoice)
    if filters:
        count_query = count_query.where(and_(*filters))
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    query = query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    invoices = result.scalars().all()
    
    # Convert to response models
    invoice_responses = [InvoiceResponse.model_validate(inv) for inv in invoices]
    
    return InvoiceListResponse(
        total=total,
        invoices=invoice_responses,
        page=skip // limit + 1 if limit > 0 else 1,
        page_size=limit
    )


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed invoice information by ID or UUID.
    
    Args:
        invoice_id: Invoice ID (numeric) or UUID (string)
        db: Database session
        
    Returns:
        Complete invoice details including QR code
    """
    from fastapi import HTTPException
    
    # Try to find by numeric ID first, then by UUID
    invoice = None
    
    if invoice_id.isdigit():
        result = await db.execute(
            select(Invoice).where(Invoice.id == int(invoice_id))
        )
        invoice = result.scalar_one_or_none()
    
    if not invoice:
        # Try by UUID
        result = await db.execute(
            select(Invoice).where(Invoice.uuid == invoice_id)
        )
        invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return InvoiceResponse.model_validate(invoice)


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    start_date: Optional[date] = Query(None, description="Stats from date"),
    end_date: Optional[date] = Query(None, description="Stats to date"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get aggregated statistics for dashboard.
    
    Args:
        start_date: Filter from date
        end_date: Filter to date
        db: Database session
        
    Returns:
        Dashboard statistics
    """
    # Build base query filters
    filters = []
    if start_date:
        filters.append(Invoice.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        filters.append(Invoice.created_at <= datetime.combine(end_date, datetime.max.time()))
    
    # Total invoices count + revenue/VAT sums in a single aggregate query.
    # Rows with NULL totals (pre-rewrite history) contribute 0 to the sums.
    agg_query = select(
        func.count(Invoice.id),
        func.coalesce(func.sum(Invoice.total), 0),
        func.coalesce(func.sum(Invoice.tax_amount), 0),
    )
    if filters:
        agg_query = agg_query.where(and_(*filters))

    total_invoices, total_revenue, total_vat = (await db.execute(agg_query)).one()

    # Status counts
    status_counts = {}
    for status in InvoiceStatus:
        status_query = select(func.count()).select_from(Invoice).where(Invoice.status == status)
        if filters:
            status_query = status_query.where(and_(*filters))

        result = await db.execute(status_query)
        status_counts[status.value] = result.scalar() or 0

    return DashboardStats(
        total_invoices=total_invoices or 0,
        total_revenue=float(total_revenue or 0),
        total_vat=float(total_vat or 0),
        cleared_count=status_counts.get("CLEARED", 0),
        reported_count=status_counts.get("REPORTED", 0),
        rejected_count=status_counts.get("REJECTED", 0),
        draft_count=status_counts.get("DRAFT", 0),
        signed_count=status_counts.get("SIGNED", 0)
    )
