"""ZATCA Phase-2 onboarding endpoints.

This module used to contain only mock endpoints. The /onboard route has now
been re-wired to generate a real CSR (cryptography library, secp256k1) and
hit ZATCA's `/compliance` endpoint to obtain a Compliance CSID (CCSID).

The other endpoints in this file (compliance-check, csid-status, renew-csid,
health) remain mocks for now — they are kept as fallbacks for the demo. A
`?mock=true` query parameter on /onboard re-enables the old fake flow.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import base64
import logging
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.encryption import decrypt, encrypt
from app.core.security import decode_access_token, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.crypto_signer import CryptoSigner
from app.services.zatca_client import ZatcaAPIError, ZatcaClient


router = APIRouter()
logger = logging.getLogger("zatca.onboard")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _maybe_user(request: Request, db: AsyncSession) -> Optional[User]:
    """Return the authenticated user if the request carries a valid Bearer
    token; otherwise return None. Used for endpoints where persistence is
    desirable when auth is present but not strictly required."""
    auth = request.headers.get("Authorization") or request.headers.get("authorization")
    if not auth or not auth.lower().startswith("bearer "):
        return None
    payload = decode_access_token(auth.split(" ", 1)[1])
    if not payload or not payload.get("sub"):
        return None
    result = await db.execute(select(User).where(User.id == int(payload["sub"])))
    return result.scalar_one_or_none()


def _validate_tax_id(tax_id: str) -> str:
    cleaned = tax_id.replace("-", "").replace(" ", "")
    if not cleaned.isdigit() or len(cleaned) != 15:
        raise HTTPException(status_code=400, detail="Invalid tax ID — must be 15 digits.")
    return cleaned


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class OnboardRequest(BaseModel):
    organization_name: str
    tax_id: str
    business_category: Optional[str] = "General"
    otp_code: str
    common_name: Optional[str] = None
    organization_unit_name: Optional[str] = "Finance"
    invoice_type: Optional[str] = "1100"
    registered_address: Optional[str] = "Riyadh, Saudi Arabia"
    environment: Optional[str] = "sandbox"  # sandbox | simulation | production
    egs_solution_name: Optional[str] = "ZATCA-Bridge"
    egs_model: Optional[str] = "EGS-1.0"
    egs_serial: Optional[str] = None


class OnboardResponse(BaseModel):
    success: bool
    status: str  # issued | credentials_missing | mock
    csid: Optional[str] = None        # binarySecurityToken (CCSID)
    secret: Optional[str] = None
    compliance_request_id: Optional[str] = None
    disposition_message: Optional[str] = None
    issued_at: str
    expires_at: str
    organization_name: str
    tax_id: str
    environment: str
    attempted_url: Optional[str] = None
    csr_preview: Optional[str] = None
    message: str


class CredentialsUpdateRequest(BaseModel):
    csid: str
    secret: str
    environment: Optional[str] = "sandbox"


class CredentialsStatusResponse(BaseModel):
    has_csid: bool
    has_secret: bool
    environment: Optional[str] = None
    csid_preview: Optional[str] = None


class UpgradeToProductionRequest(BaseModel):
    compliance_request_id: Optional[str] = None


class CSRPreviewRequest(BaseModel):
    organization_name: str
    tax_id: str
    common_name: Optional[str] = None
    business_category: Optional[str] = "General"
    invoice_type: Optional[str] = "1100"
    registered_address: Optional[str] = "Riyadh, Saudi Arabia"
    environment: Optional[str] = "sandbox"


# ---------------------------------------------------------------------------
# Real onboarding (CSR + compliance CSID)
# ---------------------------------------------------------------------------

@router.post("/onboard", response_model=OnboardResponse)
async def zatca_onboard(
    body: OnboardRequest,
    request: Request,
    mock: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """
    ZATCA Phase-2 onboarding (real).

    Workflow:
      1. Validate the 15-digit VAT registration number.
      2. Generate a fresh secp256k1 keypair and a ZATCA-compliant CSR with
         the directoryName SAN (SN/UID/title/registeredAddress/businessCategory)
         and the Microsoft cert-template extension.
      3. Call ZATCA's `/compliance` endpoint with `{ csr: <base64> }` and the
         OTP from the taxpayer's Fatoora portal in an `OTP` header.
      4. If the request carried a valid Bearer token, encrypt the returned
         binarySecurityToken/secret with Fernet and persist them onto the user
         (along with the private key, so subsequent submissions can sign).
      5. Return the CSID, request id, and a preview of the CSR.

    Pass `?mock=true` to fall back to the legacy random-bytes "fake" flow
    that the demo previously relied on.
    """
    tax_id = _validate_tax_id(body.tax_id)
    issued_at = datetime.now(timezone.utc)

    # ------------------------------------------------------------------
    # Legacy mock fallback
    # ------------------------------------------------------------------
    if mock:
        csid = base64.b64encode(secrets.token_bytes(32)).decode("utf-8")
        secret = base64.b64encode(secrets.token_bytes(32)).decode("utf-8")
        return OnboardResponse(
            success=True,
            status="mock",
            csid=csid,
            secret=secret,
            issued_at=issued_at.isoformat(),
            expires_at=(issued_at + timedelta(days=365)).isoformat(),
            organization_name=body.organization_name,
            tax_id=tax_id,
            environment=body.environment or "sandbox",
            message="Mock CSID issued — pass mock=false to call ZATCA for real.",
        )

    # ------------------------------------------------------------------
    # Real CSR + ZATCA /compliance call
    # ------------------------------------------------------------------
    signer = CryptoSigner()
    private_key_pem, csr_pem, csr_b64 = signer.generate_csr(
        common_name=body.common_name or body.organization_name,
        organization_name=body.organization_name,
        organization_unit_name=body.organization_unit_name or "Finance",
        organization_identifier=tax_id,
        invoice_type=body.invoice_type or "1100",
        registered_address=body.registered_address or "Riyadh",
        business_category=body.business_category or "General",
        environment=body.environment or "sandbox",
        egs_solution_name=body.egs_solution_name or "ZATCA-Bridge",
        egs_model=body.egs_model or "EGS-1.0",
        egs_serial=body.egs_serial,
    )
    logger.info(
        "zatca_onboard tax_id=%s env=%s csr_preview=%s",
        tax_id, body.environment, csr_pem[:60].replace("\n", " "),
    )

    try:
        async with ZatcaClient(environment=body.environment or "sandbox") as zatca:
            attempted_url = zatca.build_url("/compliance")
            zatca_resp = await zatca.request_compliance_csid(
                csr_base64=csr_b64, otp=body.otp_code,
            )
    except ZatcaAPIError as e:
        # Surface the failure but still return the CSR so the operator can
        # retry manually via curl / Postman.
        raise HTTPException(
            status_code=502,
            detail={
                "success": False,
                "status": "zatca_error",
                "message": str(e),
                "attempted_url": attempted_url if "attempted_url" in dir() else None,
                "csr_preview": csr_pem[:120],
            },
        )

    csid = zatca_resp.get("binarySecurityToken")
    secret = zatca_resp.get("secret")
    compliance_request_id = zatca_resp.get("requestID")

    # ------------------------------------------------------------------
    # Persist if we have an authenticated user
    # ------------------------------------------------------------------
    persisted_for_user: Optional[User] = await _maybe_user(request, db)
    if persisted_for_user and csid and secret:
        persisted_for_user.zatca_csid = encrypt(csid)
        persisted_for_user.zatca_secret = encrypt(secret)
        persisted_for_user.zatca_private_key = encrypt(private_key_pem)
        persisted_for_user.zatca_compliance_request_id = compliance_request_id
        persisted_for_user.zatca_environment = body.environment or "sandbox"
        await db.commit()
        logger.info("zatca_onboard persisted CSID for user_id=%s", persisted_for_user.id)

    return OnboardResponse(
        success=bool(csid and secret),
        status="issued" if (csid and secret) else "zatca_error",
        csid=csid,
        secret=secret,
        compliance_request_id=compliance_request_id,
        disposition_message=zatca_resp.get("dispositionMessage"),
        issued_at=issued_at.isoformat(),
        expires_at=(issued_at + timedelta(days=365)).isoformat(),
        organization_name=body.organization_name,
        tax_id=tax_id,
        environment=body.environment or "sandbox",
        attempted_url=zatca_resp.get("_attempted_url"),
        csr_preview=csr_pem[:120] + "…",
        message=(
            "Compliance CSID issued by ZATCA." if csid
            else "ZATCA responded but no binarySecurityToken was returned."
        ),
    )


# ---------------------------------------------------------------------------
# CSR preview (no ZATCA call) — useful for inspecting what we'd send
# ---------------------------------------------------------------------------

@router.post("/csr/preview")
async def preview_csr(body: CSRPreviewRequest):
    """Generate a CSR locally and return it without contacting ZATCA. Handy
    for verifying that the SAN/OID structure matches what ZATCA expects."""
    tax_id = _validate_tax_id(body.tax_id)
    signer = CryptoSigner()
    _, csr_pem, csr_b64 = signer.generate_csr(
        common_name=body.common_name or body.organization_name,
        organization_name=body.organization_name,
        organization_unit_name="Finance",
        organization_identifier=tax_id,
        invoice_type=body.invoice_type or "1100",
        registered_address=body.registered_address or "Riyadh",
        business_category=body.business_category or "General",
        environment=body.environment or "sandbox",
    )
    return {
        "csr_pem": csr_pem,
        "csr_base64": csr_b64,
        "tax_id": tax_id,
        "environment": body.environment or "sandbox",
    }


# ---------------------------------------------------------------------------
# Manual credentials management
# ---------------------------------------------------------------------------

@router.put("/credentials", response_model=CredentialsStatusResponse)
async def set_credentials(
    body: CredentialsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually paste in a CSID + secret obtained out-of-band (e.g. from the
    ZATCA sandbox web UI). Stored encrypted on the user record."""
    current_user.zatca_csid = encrypt(body.csid)
    current_user.zatca_secret = encrypt(body.secret)
    current_user.zatca_environment = body.environment or "sandbox"
    await db.commit()
    return CredentialsStatusResponse(
        has_csid=True,
        has_secret=True,
        environment=current_user.zatca_environment,
        csid_preview=(body.csid[:8] + "…" + body.csid[-4:]) if len(body.csid) > 16 else body.csid,
    )


@router.get("/credentials/status", response_model=CredentialsStatusResponse)
async def credentials_status(current_user: User = Depends(get_current_user)):
    csid = decrypt(current_user.zatca_csid) if current_user.zatca_csid else None
    return CredentialsStatusResponse(
        has_csid=bool(csid),
        has_secret=bool(current_user.zatca_secret),
        environment=current_user.zatca_environment,
        csid_preview=(csid[:8] + "…" + csid[-4:]) if csid and len(csid) > 16 else csid,
    )


@router.delete("/credentials")
async def clear_credentials(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.zatca_csid = None
    current_user.zatca_secret = None
    current_user.zatca_private_key = None
    current_user.zatca_compliance_request_id = None
    await db.commit()
    return {"success": True, "message": "ZATCA credentials cleared."}


# ---------------------------------------------------------------------------
# Upgrade CCSID → PCSID (Phase-2 step 2)
# ---------------------------------------------------------------------------

@router.post("/upgrade-to-production")
async def upgrade_to_production(
    body: UpgradeToProductionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Use the previously issued CCSID to request a Production CSID."""
    compliance_csid = decrypt(current_user.zatca_csid) if current_user.zatca_csid else None
    compliance_secret = decrypt(current_user.zatca_secret) if current_user.zatca_secret else None
    request_id = body.compliance_request_id or current_user.zatca_compliance_request_id

    if not compliance_csid or not compliance_secret:
        raise HTTPException(status_code=400, detail="No compliance CSID stored for this user.")
    if not request_id:
        raise HTTPException(status_code=400, detail="No compliance_request_id available; pass one explicitly.")

    try:
        async with ZatcaClient(environment=current_user.zatca_environment or "sandbox") as zatca:
            result = await zatca.request_production_csid(
                compliance_request_id=request_id,
                compliance_csid=compliance_csid,
                compliance_secret=compliance_secret,
            )
    except ZatcaAPIError as e:
        raise HTTPException(status_code=502, detail=str(e))

    new_csid = result.get("binarySecurityToken")
    new_secret = result.get("secret")
    if new_csid and new_secret:
        current_user.zatca_csid = encrypt(new_csid)
        current_user.zatca_secret = encrypt(new_secret)
        current_user.zatca_environment = "production"
        await db.commit()

    return {
        "success": bool(new_csid and new_secret),
        "attempted_url": result.get("_attempted_url"),
        "request_id": result.get("requestID"),
        "disposition_message": result.get("dispositionMessage"),
        "message": "Production CSID issued and stored." if new_csid else "ZATCA did not return a production CSID.",
    }


# ---------------------------------------------------------------------------
# Legacy mock endpoints retained as fallback
# ---------------------------------------------------------------------------

class ComplianceCheckRequest(BaseModel):
    csid: str
    invoice_hash: str
    invoice_uuid: str


class ComplianceCheckResponse(BaseModel):
    success: bool
    status: str
    validation_results: dict
    message: str


@router.post("/compliance-check", response_model=ComplianceCheckResponse)
async def mock_compliance_check(request: ComplianceCheckRequest):
    """Mock ZATCA compliance check (kept as fallback)."""
    return ComplianceCheckResponse(
        success=True,
        status="COMPLIANT",
        validation_results={
            "error_count": 0,
            "warning_count": 0,
            "info_count": 1,
            "errors": [],
            "warnings": [],
            "info": ["Mock compliance check passed"],
        },
        message="Mock compliance check successful (call /api/v1/invoices/submit-to-zatca for the real path).",
    )


class CSIDStatusResponse(BaseModel):
    csid: str
    status: str
    issued_at: str
    expires_at: str
    days_until_expiry: int
    is_valid: bool


@router.get("/csid-status", response_model=CSIDStatusResponse)
async def get_csid_status(csid: str):
    """Mock CSID status — kept for the demo dashboard."""
    issued_at = datetime.utcnow() - timedelta(days=30)
    expires_at = datetime.utcnow() + timedelta(days=335)
    return CSIDStatusResponse(
        csid=csid,
        status="ACTIVE",
        issued_at=issued_at.isoformat() + "Z",
        expires_at=expires_at.isoformat() + "Z",
        days_until_expiry=(expires_at - datetime.utcnow()).days,
        is_valid=True,
    )


@router.post("/renew-csid")
async def renew_csid(csid: str):
    """Mock CSID renewal — kept for the demo dashboard."""
    new_csid = base64.b64encode(secrets.token_bytes(32)).decode("utf-8")
    new_secret = base64.b64encode(secrets.token_bytes(32)).decode("utf-8")
    issued_at = datetime.utcnow()
    return {
        "success": True,
        "csid": new_csid,
        "secret": new_secret,
        "issued_at": issued_at.isoformat() + "Z",
        "expires_at": (issued_at + timedelta(days=365)).isoformat() + "Z",
        "message": "Mock CSID renewed (replace with /onboard for real CSR-based issuance).",
    }


@router.get("/health")
async def zatca_health():
    return {
        "status": "healthy",
        "service": "ZATCA API",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "environment": settings.ZATCA_API_URL,
    }
