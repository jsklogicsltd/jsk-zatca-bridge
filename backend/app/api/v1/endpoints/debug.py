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
        
        summary = "\n".join(summary_lines)
        
        return ValidateXMLResponse(
            valid=result['valid'],
            return_code=result['return_code'],
            errors=result['errors'],
            warnings=result['warnings'],
            info=result['info'],
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
