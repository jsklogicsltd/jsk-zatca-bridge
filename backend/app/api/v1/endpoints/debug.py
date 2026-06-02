"""Debug endpoints for ZATCA validation testing."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import os

# Add the backend directory to the path to import the validator
import sys
from pathlib import Path
backend_path = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(backend_path))

from app.services.zatca_validator import ZATCAValidator, ZATCAValidatorError


router = APIRouter()


class ValidateXMLRequest(BaseModel):
    """Request model for XML validation."""
    xml_content: str


class ValidateXMLResponse(BaseModel):
    """Response model for XML validation."""
    valid: bool
    return_code: int
    errors: list
    warnings: list
    info: list
    # Reported errors that are known defects of the bundled schematron version
    # (e.g. BR-KSA-31), each as {"code", "explanation"}.
    known_issues: list = []
    stdout: str
    stderr: str
    summary: str


@router.post("/validate-xml", response_model=ValidateXMLResponse)
async def validate_xml_with_sdk(request: ValidateXMLRequest):
    """
    Validate XML invoice using ZATCA SDK.
    
    This endpoint accepts an XML string, validates it using the official
    ZATCA SDK (Java-based), and returns the complete validation report.
    
    Args:
        request: Request containing XML content
        
    Returns:
        Validation results including errors, warnings, and raw output
        
    Raises:
        HTTPException: If validation process fails
    """
    try:
        # Set Java path for subprocess
        java_path = "/opt/homebrew/opt/openjdk/bin"
        if java_path not in os.environ.get("PATH", ""):
            os.environ["PATH"] = f"{java_path}:{os.environ.get('PATH', '')}"
        
        # Initialize validator
        validator = ZATCAValidator()
        
        # Validate XML string
        result = validator.validate_xml_string(request.xml_content)
        
        # Create summary
        summary_lines = []
        summary_lines.append(f"Validation Result: {'✓ PASS' if result['valid'] else '✗ FAIL'}")
        summary_lines.append(f"Return Code: {result['return_code']}")
        
        if result['errors']:
            summary_lines.append(f"\nErrors ({len(result['errors'])}):")
            for i, error in enumerate(result['errors'][:10], 1):
                summary_lines.append(f"  {i}. {error}")
            if len(result['errors']) > 10:
                summary_lines.append(f"  ... and {len(result['errors']) - 10} more errors")
        
        if result['warnings']:
            summary_lines.append(f"\nWarnings ({len(result['warnings'])}):")
            for i, warning in enumerate(result['warnings'][:10], 1):
                summary_lines.append(f"  {i}. {warning}")
            if len(result['warnings']) > 10:
                summary_lines.append(f"  ... and {len(result['warnings']) - 10} more warnings")
        
        if result['info']:
            summary_lines.append(f"\nInfo ({len(result['info'])}):")
            for i, info in enumerate(result['info'][:5], 1):
                summary_lines.append(f"  {i}. {info}")

        known_issues = result.get('known_issues', [])
        if known_issues:
            summary_lines.append(
                f"\nKnown schematron-version false-positives ({len(known_issues)}):"
            )
            for issue in known_issues:
                summary_lines.append(f"  [{issue['code']}] {issue['explanation']}")

        summary = "\n".join(summary_lines)

        return ValidateXMLResponse(
            valid=result['valid'],
            return_code=result['return_code'],
            errors=result['errors'],
            warnings=result['warnings'],
            info=result['info'],
            known_issues=known_issues,
            stdout=result['stdout'],
            stderr=result['stderr'],
            summary=summary
        )
        
    except ZATCAValidatorError as e:
        raise HTTPException(
            status_code=500,
            detail=f"ZATCA validator error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during validation: {str(e)}"
        )


@router.get("/sample-invoice")
async def sample_invoice():
    """
    Return a freshly generated, fully ZATCA-compliant SIGNED standard tax
    invoice as an XML string. No database required — handy for demoing the
    validator end-to-end (passes XSD, EN16931, KSA business rules and PIH).
    """
    import datetime
    from decimal import Decimal
    from app.schemas.validation import InvoiceCreate
    from app.services.xml_builder import InvoiceXMLBuilder
    from app.services.crypto_signer import CryptoSigner

    invoice = InvoiceCreate(
        invoice_type="Tax",
        invoice_number="INV-SAMPLE-001",
        issue_date=datetime.date.today(),
        supplier=dict(
            trn="300000000000003", name="JSK Logics Trading Est.",
            street="King Fahd Road", building_number="1234", additional_number="5678",
            city="Riyadh", district="Al Olaya", postal_code="12211", country_code="SA",
        ),
        customer=dict(
            trn="300000000000003", name="Acme Buyer Co.",
            street="Olaya Street", building_number="4321", additional_number="8765",
            city="Riyadh", district="Al Malaz", postal_code="12222", country_code="SA",
        ),
        line_items=[dict(
            name="Consulting Services", quantity=Decimal("2"), price=Decimal("100"),
            vat_rate=Decimal("15"), tax_code="S",
        )],
        currency_code="SAR",
    )

    builder = InvoiceXMLBuilder(invoice)
    xml_bytes = builder.build()
    signer = CryptoSigner()
    _, public_key_pem = signer.generate_key_pair()
    hash_b64, signature_b64, signed_xml = signer.sign_invoice_xml(xml_bytes)
    timestamp = f"{invoice.issue_date.isoformat()}T00:00:00Z"
    qr = signer.generate_tlv_qr(
        seller_name=invoice.supplier.name, vat_number=invoice.supplier.trn,
        timestamp=timestamp, invoice_total=str(invoice.calculated_total_including_vat),
        vat_total=str(invoice.calculated_total_vat), xml_hash=hash_b64,
        signature=signature_b64, public_key=public_key_pem,
    )
    final_xml = signer.insert_qr_code_into_xml(signed_xml, qr)

    return {
        "invoice_number": invoice.invoice_number,
        "invoice_type": "Tax",
        "xml": final_xml.decode("utf-8"),
    }


@router.get("/validator-info")
async def get_validator_info():
    """
    Get information about the ZATCA SDK validator.
    
    Returns:
        Validator version and configuration info
    """
    try:
        # Set Java path
        java_path = "/opt/homebrew/opt/openjdk/bin"
        if java_path not in os.environ.get("PATH", ""):
            os.environ["PATH"] = f"{java_path}:{os.environ.get('PATH', '')}"
        
        validator = ZATCAValidator()
        version = validator.get_validator_version()
        
        return {
            "validator_version": version,
            "jar_path": str(validator.jar_path),
            "jar_exists": validator.jar_path.exists(),
            "jar_size_mb": round(validator.jar_path.stat().st_size / (1024 * 1024), 2) if validator.jar_path.exists() else 0,
            "java_available": True,
            "status": "ready"
        }
    except ZATCAValidatorError as e:
        return {
            "validator_version": "unknown",
            "jar_path": "not found",
            "jar_exists": False,
            "jar_size_mb": 0,
            "java_available": False,
            "status": "error",
            "error": str(e)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting validator info: {str(e)}"
        )
