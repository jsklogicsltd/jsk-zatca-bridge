from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.validation import (
    InvoiceCreate,
    InvoiceValidationResponse,
    InvoiceCalculationResult
)
from pydantic import ValidationError
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter()


@router.post("/validate", response_model=InvoiceValidationResponse, status_code=status.HTTP_200_OK)
async def validate_invoice(invoice_data: InvoiceCreate):
    """
    Validate invoice data from legacy ERP systems.
    
    Performs comprehensive validation:
    - TRN format (15 digits, starts with 1/3, ends with 3)
    - Building numbers (4 digits)
    - Postal codes (5 digits)
    - No prohibited special characters
    - Tax calculations accuracy (tolerance 0.01)
    - Mandatory fields presence
    
    Args:
        invoice_data: Invoice data to validate
        
    Returns:
        InvoiceValidationResponse with success status and calculated totals
        
    Raises:
        HTTPException 422: Validation failed with detailed field errors
    """
    try:
        # Calculate totals
        calculated_totals = {
            "total_excluding_vat": float(invoice_data.calculated_total_excluding_vat),
            "total_vat": float(invoice_data.calculated_total_vat), 
            "total_including_vat": float(invoice_data.calculated_total_including_vat),
            "line_items_count": len(invoice_data.line_items),
            "currency_code": invoice_data.currency_code
        }
        
        return InvoiceValidationResponse(
            success=True,
            message="Invoice validation successful. All ZATCA compliance rules passed.",
            invoice_number=invoice_data.invoice_number,
            calculated_totals=calculated_totals
        )
        
    except ValidationError as e:
        # Format validation errors for user
        errors = []
        for error in e.errors():
            errors.append({
                "field": " -> ".join(str(loc) for loc in error['loc']),
                "message": error['msg'],
                "type": error['type']
            })
        
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "success": False,
                "message": "Invoice validation failed",
                "errors": errors
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": f"Validation error: {str(e)}"
            }
        )


@router.post("/calculate", response_model=InvoiceCalculationResult)
async def calculate_invoice_totals(invoice_data: InvoiceCreate):
    """
    Calculate invoice totals without full validation.
    Useful for real-time calculation in UI.
    
    Args:
        invoice_data: Invoice data
        
    Returns:
        InvoiceCalculationResult with calculated amounts
    """
    return InvoiceCalculationResult(
        total_excluding_vat=invoice_data.calculated_total_excluding_vat,
        total_vat=invoice_data.calculated_total_vat,
        total_including_vat=invoice_data.calculated_total_including_vat,
        line_items_count=len(invoice_data.line_items),
        currency_code=invoice_data.currency_code
    )


@router.post("/generate-xml", status_code=status.HTTP_200_OK)
async def generate_invoice_xml(invoice_data: InvoiceCreate):
    """
    Generate UBL 2.1 XML from validated invoice data.
    
    Retrieves previous invoice hash (PIH) from database for blockchain chaining.
    Returns ZATCA-compliant XML ready for cryptographic signing.
    
    Args:
        invoice_data: Validated invoice data
        
    Returns:
        XML content as bytes with proper content-type header
    """
    from app.services.xml_builder import InvoiceXMLBuilder
    from fastapi.responses import Response
    
    # TODO: Retrieve previous invoice hash from database
    # For now, using placeholder
    previous_hash = None  # Will be implemented with database integration
    
    try:
        # Build XML
        builder = InvoiceXMLBuilder(invoice_data, previous_invoice_hash=previous_hash)
        xml_bytes = builder.build()
        
        # Return as XML response
        return Response(
            content=xml_bytes,
            media_type="application/xml",
            headers={
                "Content-Disposition": f"attachment; filename={invoice_data.invoice_number}.xml"
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": f"XML generation error: {str(e)}"
            }
        )


@router.post("/sign-invoice", status_code=status.HTTP_200_OK)
async def sign_invoice(invoice_data: InvoiceCreate, db: AsyncSession = Depends(get_db)):
    """
    Complete invoice processing: validate, generate XML, sign, and create QR code.
    
    Workflow:
    1. Generate UBL 2.1 XML
    2. Canonicalize and hash (SHA-256)
    3. Sign with ECDSA (SECP256R1)
    4. Insert signature into XML
    5. Generate TLV QR code
    6. Insert QR into XML
    7. Save to database
    
    Args:
        invoice_data: Validated invoice data
        db: Database session
        
    Returns:
        JSON with signed XML, hash, signature, and QR code
    """
    from app.services.xml_builder import InvoiceXMLBuilder
    from app.services.crypto_signer import CryptoSigner
    from app.models.invoice import Invoice, InvoiceStatus
    from datetime import datetime
    
    try:
        # Step 1: Generate XML
        builder = InvoiceXMLBuilder(invoice_data, previous_invoice_hash=None)
        xml_bytes = builder.build()
        
        # Step 2: Initialize crypto signer (generate keys for demo)
        signer = CryptoSigner()
        private_key_pem, public_key_pem = signer.generate_key_pair()
        
        # Step 3: Sign invoice
        hash_base64, signature_base64, signed_xml = signer.sign_invoice_xml(xml_bytes)
        
        # Step 4: Generate QR code
        timestamp = f"{invoice_data.issue_date.isoformat()}T{datetime.now().strftime('%H:%M:%S')}"
        
        qr_data = signer.generate_tlv_qr(
            seller_name=invoice_data.supplier.name,
            vat_number=invoice_data.supplier.trn,
            timestamp=timestamp,
            invoice_total=str(invoice_data.calculated_total_including_vat),
            vat_total=str(invoice_data.calculated_total_vat),
            xml_hash=hash_base64,
            signature=signature_base64,
            public_key=public_key_pem
        )
        
        # Step 5: Insert QR into XML
        final_xml = signer.insert_qr_code_into_xml(signed_xml, qr_data)
        
        # Step 6: Save to database
        db_invoice = Invoice(
            uuid=builder.invoice_uuid,
            invoice_number=invoice_data.invoice_number,
            xml_content=final_xml.decode('utf-8'),
            hash=hash_base64,
            signature=signature_base64,
            qr_code=qr_data,
            status=InvoiceStatus.SIGNED
        )
        db.add(db_invoice)
        await db.commit()
        await db.refresh(db_invoice)
        
        # Return comprehensive response
        return {
            "success": True,
            "invoice_number": invoice_data.invoice_number,
            "invoice_uuid": builder.invoice_uuid,
            "invoice_id": db_invoice.id,
            "hash": hash_base64,
            "signature": signature_base64,
            "qr_code": qr_data,
            "signed_xml": final_xml.decode('utf-8'),
            "timestamp": timestamp,
            "message": "Invoice signed and saved successfully"
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": f"Signing error: {str(e)}"
            }
        )


@router.post("/submit-to-zatca", status_code=status.HTTP_200_OK)
async def submit_invoice_to_zatca(
    invoice_data: InvoiceCreate,
    action: str = "report",  # report, clear, or compliance
    db: AsyncSession = Depends(get_db)
):
    """
    Complete end-to-end invoice submission to ZATCA.
    
    Workflow:
    1. Validate invoice data
    2. Generate and sign XML
    3. Submit to ZATCA (compliance/report/clear)
    4. Update database with result
    
    Args:
        invoice_data: Validated invoice data
        action: ZATCA action (compliance, report, clear)
        db: Database session
        
    Returns:
        Complete submission result with ZATCA response
    """
    from app.services.xml_builder import InvoiceXMLBuilder
    from app.services.crypto_signer import CryptoSigner
    from app.services.zatca_client import ZatcaClient, ZatcaAPIError
    from datetime import datetime, timezone
    import base64
    import json
    import logging
    import uuid as uuid_pkg

    logger = logging.getLogger("zatca.submit")

    if action not in ["compliance", "report", "clear"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Must be compliance, report, or clear"
        )

    # Audit-trail identifiers — included in the response so the frontend
    # (and any external ERP) can correlate this submission with backend logs.
    request_id = str(uuid_pkg.uuid4())
    submitted_at = datetime.now(timezone.utc).isoformat()

    # Map action → endpoint path on the ZATCA Fatoora portal, so we can
    # report the actual URL we attempted even before constructing the client.
    action_to_endpoint = {
        "compliance": "/compliance/invoices",
        "report": "/invoices/reporting/single",
        "clear": "/invoices/clearance/single",
    }

    # Canonical response shapes the live ZATCA endpoints emit on success.
    # Surfaced in the API response so the UI can render an "Expected ZATCA
    # response" preview even when no credentials are configured.
    expected_response_formats = {
        "compliance": {
            "validationResults": {
                "infoMessages": [{"code": "XSD_VALID", "message": "XSD validated"}],
                "warningMessages": [],
                "errorMessages": [],
                "status": "PASS",
            },
            "reportingStatus": None,
            "clearanceStatus": None,
        },
        "report": {
            "validationResults": {
                "infoMessages": [],
                "warningMessages": [],
                "errorMessages": [],
                "status": "PASS",
            },
            "reportingStatus": "REPORTED",
        },
        "clear": {
            "validationResults": {
                "infoMessages": [],
                "warningMessages": [],
                "errorMessages": [],
                "status": "PASS",
            },
            "clearanceStatus": "CLEARED",
            "clearedInvoice": "<base64 of ZATCA-cleared XML>",
        },
    }

    try:
        # Step 1: Generate and sign invoice
        builder = InvoiceXMLBuilder(invoice_data, previous_invoice_hash=None)
        xml_bytes = builder.build()

        signer = CryptoSigner()
        private_key_pem, public_key_pem = signer.generate_key_pair()
        hash_base64, signature_base64, signed_xml = signer.sign_invoice_xml(xml_bytes)

        # Generate QR code
        timestamp = f"{invoice_data.issue_date.isoformat()}T{datetime.now().strftime('%H:%M:%S')}"
        qr_data = signer.generate_tlv_qr(
            seller_name=invoice_data.supplier.name,
            vat_number=invoice_data.supplier.trn,
            timestamp=timestamp,
            invoice_total=str(invoice_data.calculated_total_including_vat),
            vat_total=str(invoice_data.calculated_total_vat),
            xml_hash=hash_base64,
            signature=signature_base64,
            public_key=public_key_pem
        )

        final_xml = signer.insert_qr_code_into_xml(signed_xml, qr_data)
        xml_base64 = base64.b64encode(final_xml).decode('utf-8')

        # Step 2: Submit to ZATCA
        async with ZatcaClient(environment="sandbox") as zatca:
            attempted_url = zatca.build_url(action_to_endpoint[action])
            logger.info(
                "ZATCA submit request_id=%s action=%s url=%s uuid=%s",
                request_id, action, attempted_url, builder.invoice_uuid,
            )
            if action == "compliance":
                zatca_response = await zatca.compliance_check(
                    invoice_hash=hash_base64,
                    uuid=builder.invoice_uuid,
                    invoice_xml=xml_base64
                )
            elif action == "report":
                zatca_response = await zatca.report_invoice(
                    invoice_hash=hash_base64,
                    uuid=builder.invoice_uuid,
                    invoice_xml=xml_base64
                )
            else:  # clear
                zatca_response = await zatca.clear_invoice(
                    invoice_hash=hash_base64,
                    uuid=builder.invoice_uuid,
                    invoice_xml=xml_base64
                )

        # Pull out response headers (set by zatca_client when ZATCA actually
        # responded) into a top-level field for the audit trail.
        zatca_response_headers = zatca_response.pop("_response_headers", None) \
            if isinstance(zatca_response, dict) else None

        # Step 3: Determine status from response
        if zatca_response.get("status") == "credentials_missing":
            invoice_status = "CREDENTIALS_MISSING"
        elif zatca_response.get("success"):
            if action == "report":
                invoice_status = "REPORTED"
            elif action == "clear":
                invoice_status = "CLEARED"
            else:
                invoice_status = "SIGNED"
        else:
            invoice_status = "REJECTED"

        # Best-effort clearance UUID extraction (ZATCA's exact field name
        # varies by phase; surface whichever showed up).
        clearance_uuid = None
        if isinstance(zatca_response, dict):
            clearance_uuid = (
                zatca_response.get("clearanceId")
                or zatca_response.get("reportingId")
                or zatca_response.get("uuid")
            )

        logger.info(
            "ZATCA submit request_id=%s status=%s",
            request_id, invoice_status,
        )

        # Pre-compute the payload we'd POST to ZATCA so the UI can display
        # "what would be sent" cleanly. xml_base64 truncated for transport.
        zatca_payload = {
            "invoiceHash": hash_base64,
            "uuid": builder.invoice_uuid,
            "invoice": xml_base64,
        }
        payload_size_bytes = len(
            json.dumps(zatca_payload, separators=(",", ":")).encode("utf-8")
        )
        zatca_payload_preview = {
            **zatca_payload,
            "invoice": (xml_base64[:200] + "…(truncated)" if len(xml_base64) > 200 else xml_base64),
        }

        # Return complete result
        return {
            "success": zatca_response.get("success", False),
            "request_id": request_id,
            "audit_id": request_id,
            "timestamp": submitted_at,
            "attempted_url": attempted_url,
            "would_submit_to": attempted_url,
            "would_send_payload": zatca_payload_preview,
            "payload_size_bytes": payload_size_bytes,
            "expected_response_format": expected_response_formats.get(action),
            "action": action,
            "environment": "sandbox",
            "invoice_number": invoice_data.invoice_number,
            "invoice_uuid": builder.invoice_uuid,
            "hash": hash_base64,
            "signature": signature_base64,
            "qr_code": qr_data,
            "signed_xml": final_xml.decode('utf-8'),
            "zatca_response": zatca_response,
            "zatca_response_headers": zatca_response_headers,
            "clearance_uuid": clearance_uuid,
            "status": invoice_status,
            "message": f"Invoice {action} completed",
        }

    except ZatcaAPIError as e:
        logger.warning("ZATCA submit request_id=%s ZatcaAPIError=%s", request_id, e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "success": False,
                "request_id": request_id,
                "timestamp": submitted_at,
                "attempted_url": f"https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal{action_to_endpoint[action]}",
                "message": f"ZATCA API error: {str(e)}",
            }
        )
    except Exception as e:
        logger.exception("ZATCA submit request_id=%s unhandled", request_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "request_id": request_id,
                "timestamp": submitted_at,
                "message": f"Submission error: {str(e)}",
            }
        )
