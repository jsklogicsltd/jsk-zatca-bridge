"""Mock ZATCA endpoints for frontend testing."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import secrets
import base64
from datetime import datetime, timedelta


router = APIRouter()


class OnboardRequest(BaseModel):
    """Request model for ZATCA onboarding."""
    organization_name: str
    tax_id: str
    business_category: Optional[str] = None
    otp_code: Optional[str] = None


class OnboardResponse(BaseModel):
    """Response model for ZATCA onboarding."""
    success: bool
    csid: str
    secret: str
    issued_at: str
    expires_at: str
    organization_name: str
    tax_id: str
    message: str


@router.post("/onboard", response_model=OnboardResponse)
async def mock_zatca_onboard(request: OnboardRequest):
    """
    Mock ZATCA onboarding endpoint for frontend testing.
    
    This endpoint simulates the ZATCA onboarding process and returns
    a fake CSID (Cryptographic Stamp Identifier) and secret for testing
    the frontend onboarding wizard.
    
    Args:
        request: Onboarding request with organization details
        
    Returns:
        Mock CSID and secret with expiration details
    """
    # Validate tax ID format (15 digits for Saudi Arabia)
    if not request.tax_id or len(request.tax_id.replace("-", "").replace(" ", "")) != 15:
        raise HTTPException(
            status_code=400,
            detail="Invalid tax ID format. Must be 15 digits."
        )
    
    # Generate mock CSID (base64 encoded random string)
    csid_bytes = secrets.token_bytes(32)
    csid = base64.b64encode(csid_bytes).decode('utf-8')
    
    # Generate mock secret
    secret_bytes = secrets.token_bytes(32)
    secret = base64.b64encode(secret_bytes).decode('utf-8')
    
    # Set expiration (typically 1 year for production CSID)
    issued_at = datetime.utcnow()
    expires_at = issued_at + timedelta(days=365)
    
    return OnboardResponse(
        success=True,
        csid=csid,
        secret=secret,
        issued_at=issued_at.isoformat() + "Z",
        expires_at=expires_at.isoformat() + "Z",
        organization_name=request.organization_name,
        tax_id=request.tax_id,
        message="Mock CSID generated successfully. This is for testing only."
    )


class ComplianceCheckRequest(BaseModel):
    """Request model for compliance check."""
    csid: str
    invoice_hash: str
    invoice_uuid: str


class ComplianceCheckResponse(BaseModel):
    """Response model for compliance check."""
    success: bool
    status: str
    validation_results: dict
    message: str


@router.post("/compliance-check", response_model=ComplianceCheckResponse)
async def mock_compliance_check(request: ComplianceCheckRequest):
    """
    Mock ZATCA compliance check endpoint.
    
    Simulates the ZATCA compliance validation process.
    
    Args:
        request: Compliance check request
        
    Returns:
        Mock compliance check results
    """
    return ComplianceCheckResponse(
        success=True,
        status="COMPLIANT",
        validation_results={
            "error_count": 0,
            "warning_count": 0,
            "info_count": 1,
            "errors": [],
            "warnings": [],
            "info": ["Mock compliance check passed"]
        },
        message="Mock compliance check successful. Invoice is compliant."
    )


class CSIDStatusResponse(BaseModel):
    """Response model for CSID status."""
    csid: str
    status: str
    issued_at: str
    expires_at: str
    days_until_expiry: int
    is_valid: bool


@router.get("/csid-status", response_model=CSIDStatusResponse)
async def get_csid_status(csid: str):
    """
    Mock endpoint to check CSID status.
    
    Args:
        csid: CSID to check
        
    Returns:
        Mock CSID status information
    """
    issued_at = datetime.utcnow() - timedelta(days=30)
    expires_at = datetime.utcnow() + timedelta(days=335)
    days_until_expiry = (expires_at - datetime.utcnow()).days
    
    return CSIDStatusResponse(
        csid=csid,
        status="ACTIVE",
        issued_at=issued_at.isoformat() + "Z",
        expires_at=expires_at.isoformat() + "Z",
        days_until_expiry=days_until_expiry,
        is_valid=True
    )


@router.post("/renew-csid")
async def renew_csid(csid: str):
    """
    Mock endpoint to renew CSID.
    
    Args:
        csid: Current CSID to renew
        
    Returns:
        New CSID details
    """
    # Generate new mock CSID
    new_csid_bytes = secrets.token_bytes(32)
    new_csid = base64.b64encode(new_csid_bytes).decode('utf-8')
    
    new_secret_bytes = secrets.token_bytes(32)
    new_secret = base64.b64encode(new_secret_bytes).decode('utf-8')
    
    issued_at = datetime.utcnow()
    expires_at = issued_at + timedelta(days=365)
    
    return {
        "success": True,
        "csid": new_csid,
        "secret": new_secret,
        "issued_at": issued_at.isoformat() + "Z",
        "expires_at": expires_at.isoformat() + "Z",
        "message": "Mock CSID renewed successfully"
    }


@router.get("/health")
async def zatca_health():
    """Mock ZATCA service health check."""
    return {
        "status": "healthy",
        "service": "ZATCA Mock API",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "environment": "sandbox",
        "message": "Mock ZATCA service is operational"
    }
