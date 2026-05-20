import httpx
import base64
from typing import Dict, Any, Optional, List
from datetime import datetime
import json
from app.core.config import settings


class ZatcaAPIError(Exception):
    """Exception raised for ZATCA API errors."""
    pass


class ZatcaClient:
    """
    Async client for ZATCA Fatoora Portal API.
    Handles compliance checks, invoice reporting (B2C), and clearance (B2B).
    """
    
    # ZATCA API environments
    SANDBOX_URL = "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal"
    SIMULATION_URL = "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation"
    PRODUCTION_URL = "https://gw-fatoora.zatca.gov.sa/e-invoicing/core"
    
    def __init__(
        self,
        csid: Optional[str] = None,
        secret: Optional[str] = None,
        environment: str = "sandbox"
    ):
        """
        Initialize ZATCA API client.
        
        Args:
            csid: Cryptographic Stamp Identifier (Binary Security Token)
            secret: Secret key for authentication
            environment: API environment (sandbox, simulation, production)
        """
        self.csid = csid or settings.ZATCA_CSID
        self.secret = secret or settings.ZATCA_API_KEY
        self.environment = environment
        
        # Set base URL based on environment
        if environment == "sandbox":
            self.base_url = self.SANDBOX_URL
        elif environment == "simulation":
            self.base_url = self.SIMULATION_URL
        elif environment == "production":
            self.base_url = self.PRODUCTION_URL
        else:
            self.base_url = settings.ZATCA_API_URL
        
        # Create async client
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=30.0,
            headers={
                "Accept": "application/json",
                "Accept-Language": "en",
                "Content-Type": "application/json"
            }
        )
    
    def _create_auth_header(self) -> Dict[str, str]:
        """
        Create Basic Authentication header using CSID and secret.

        Returns:
            Authorization header dict
        """
        if not self.csid or not self.secret:
            raise ValueError("CSID and secret are required for authentication")

        # Encode credentials as Base64
        credentials = f"{self.csid}:{self.secret}"
        encoded = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')

        return {
            "Authorization": f"Basic {encoded}"
        }

    def has_credentials(self) -> bool:
        """Return True if both CSID and secret are configured."""
        return bool(self.csid) and bool(self.secret)

    def build_url(self, endpoint: str) -> str:
        """Compose the full URL the client would POST to for an action."""
        return f"{self.base_url}{endpoint}"

    def _credentials_missing_response(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        action: str,
    ) -> Dict[str, Any]:
        """
        Return a structured "would-have-called" response when CSID/secret
        are not configured. This keeps the demo honest: callers can see the
        exact URL, method, headers, and payload that WOULD have hit ZATCA.
        """
        return {
            "success": False,
            "status": "credentials_missing",
            "action": action,
            "environment": self.environment,
            "message": (
                "ZATCA credentials not configured on the backend. "
                "Set ZATCA_CSID and ZATCA_API_KEY in backend/.env to make "
                "real submissions to the Fatoora portal."
            ),
            "would_be_url": self.build_url(endpoint),
            "would_be_method": "POST",
            "would_be_headers": {
                "Accept": "application/json",
                "Accept-Language": "en",
                "Content-Type": "application/json",
                "Authorization": "Basic <base64(CSID:secret)>",
            },
            "would_be_payload": payload,
        }
    
    async def request_compliance_csid(
        self,
        csr_base64: str,
        otp: str,
    ) -> Dict[str, Any]:
        """
        ZATCA Phase-2 onboarding step 1: request a Compliance CSID (CCSID).

        Posts the base64-encoded CSR to `/compliance` with the OTP supplied
        by the taxpayer's Fatoora portal. ZATCA returns a binarySecurityToken
        (CCSID) and a secret that together form the Basic-auth credential
        used for compliance invoice submissions.

        Args:
            csr_base64: Base64 of the PEM CSR produced by CryptoSigner.generate_csr()
            otp:        6-digit OTP retrieved from the taxpayer's Fatoora portal

        Returns:
            Dict with success/binarySecurityToken/secret/requestID/dispositionMessage,
            plus _attempted_url and _response_headers for audit logging.
        """
        endpoint = "/compliance"
        payload = {"csr": csr_base64}
        headers = {
            "OTP": otp,
            "Accept-Version": "V2",
            "Accept": "application/json",
            "Accept-Language": "en",
            "Content-Type": "application/json",
        }
        try:
            response = await self.client.post(endpoint, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()
            return {
                "success": True,
                "requestID": result.get("requestID"),
                "dispositionMessage": result.get("dispositionMessage"),
                "tokenType": result.get("tokenType"),
                "binarySecurityToken": result.get("binarySecurityToken"),
                "secret": result.get("secret"),
                "_attempted_url": self.build_url(endpoint),
                "_response_headers": dict(response.headers),
                "raw": result,
            }
        except httpx.HTTPStatusError as e:
            error_detail = self._parse_error_response(e.response)
            raise ZatcaAPIError(f"Compliance CSID request failed: {error_detail}")
        except httpx.RequestError as e:
            raise ZatcaAPIError(f"Request failed: {str(e)}")

    async def request_production_csid(
        self,
        compliance_request_id: str,
        compliance_csid: Optional[str] = None,
        compliance_secret: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        ZATCA Phase-2 onboarding step 2: upgrade CCSID → PCSID.

        After the CCSID has successfully reported/cleared the required set of
        compliance invoices, call `/production/csids` with the requestID issued
        by the original `/compliance` response and Basic-auth using the CCSID.

        Args:
            compliance_request_id: requestID returned by request_compliance_csid()
            compliance_csid:       CCSID binarySecurityToken (defaults to self.csid)
            compliance_secret:     CCSID secret (defaults to self.secret)
        """
        endpoint = "/production/csids"
        payload = {"compliance_request_id": compliance_request_id}

        # Temporarily swap in compliance credentials for this request only.
        original_csid, original_secret = self.csid, self.secret
        if compliance_csid:
            self.csid = compliance_csid
        if compliance_secret:
            self.secret = compliance_secret

        if not self.has_credentials():
            self.csid, self.secret = original_csid, original_secret
            return self._credentials_missing_response(endpoint, payload, "production_csid")

        headers = {
            "Accept-Version": "V2",
            "Accept": "application/json",
            "Content-Type": "application/json",
            **self._create_auth_header(),
        }
        try:
            response = await self.client.post(endpoint, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()
            return {
                "success": True,
                "requestID": result.get("requestID"),
                "dispositionMessage": result.get("dispositionMessage"),
                "tokenType": result.get("tokenType"),
                "binarySecurityToken": result.get("binarySecurityToken"),
                "secret": result.get("secret"),
                "_attempted_url": self.build_url(endpoint),
                "_response_headers": dict(response.headers),
                "raw": result,
            }
        except httpx.HTTPStatusError as e:
            error_detail = self._parse_error_response(e.response)
            raise ZatcaAPIError(f"Production CSID request failed: {error_detail}")
        except httpx.RequestError as e:
            raise ZatcaAPIError(f"Request failed: {str(e)}")
        finally:
            self.csid, self.secret = original_csid, original_secret

    async def compliance_check(
        self,
        invoice_hash: str,
        uuid: str,
        invoice_xml: str
    ) -> Dict[str, Any]:
        """
        Perform compliance check on invoice.
        
        Args:
            invoice_hash: SHA-256 hash of invoice
            uuid: Invoice UUID
            invoice_xml: Base64-encoded signed XML
            
        Returns:
            Compliance check result
            
        Raises:
            ZatcaAPIError: If compliance check fails
        """
        endpoint = "/compliance/invoices"

        # Prepare request payload
        payload = {
            "invoiceHash": invoice_hash,
            "uuid": uuid,
            "invoice": invoice_xml
        }

        if not self.has_credentials():
            return self._credentials_missing_response(endpoint, payload, "compliance")

        try:
            response = await self.client.post(
                endpoint,
                json=payload,
                headers=self._create_auth_header()
            )

            response.raise_for_status()
            result = response.json()

            # Check for validation errors
            if "validationResults" in result:
                errors = self._parse_validation_results(result["validationResults"])
                if errors["error_count"] > 0:
                    result["parsed_errors"] = errors

            result["_response_headers"] = dict(response.headers)
            return result

        except httpx.HTTPStatusError as e:
            error_detail = self._parse_error_response(e.response)
            raise ZatcaAPIError(f"Compliance check failed: {error_detail}")
        except httpx.RequestError as e:
            raise ZatcaAPIError(f"Request failed: {str(e)}")

    async def report_invoice(
        self,
        invoice_hash: str,
        uuid: str,
        invoice_xml: str
    ) -> Dict[str, Any]:
        """
        Report simplified (B2C) invoice to ZATCA.
        
        Args:
            invoice_hash: SHA-256 hash of invoice
            uuid: Invoice UUID
            invoice_xml: Base64-encoded signed XML
            
        Returns:
            Reporting result with status
            
        Raises:
            ZatcaAPIError: If reporting fails
        """
        endpoint = "/invoices/reporting/single"

        payload = {
            "invoiceHash": invoice_hash,
            "uuid": uuid,
            "invoice": invoice_xml
        }

        if not self.has_credentials():
            return self._credentials_missing_response(endpoint, payload, "report")

        try:
            response = await self.client.post(
                endpoint,
                json=payload,
                headers=self._create_auth_header()
            )

            response.raise_for_status()
            result = response.json()

            # Parse validation results if present
            if "validationResults" in result:
                errors = self._parse_validation_results(result["validationResults"])
                result["parsed_errors"] = errors

            # Check if reported successfully
            if result.get("reportingStatus") == "REPORTED":
                result["success"] = True
            else:
                result["success"] = False

            result["_response_headers"] = dict(response.headers)
            return result

        except httpx.HTTPStatusError as e:
            error_detail = self._parse_error_response(e.response)
            raise ZatcaAPIError(f"Invoice reporting failed: {error_detail}")
        except httpx.RequestError as e:
            raise ZatcaAPIError(f"Request failed: {str(e)}")

    async def clear_invoice(
        self,
        invoice_hash: str,
        uuid: str,
        invoice_xml: str
    ) -> Dict[str, Any]:
        """
        Clear standard (B2B) invoice with ZATCA.
        
        Args:
            invoice_hash: SHA-256 hash of invoice
            uuid: Invoice UUID
            invoice_xml: Base64-encoded signed XML
            
        Returns:
            Clearance result with cleared invoice XML
            
        Raises:
            ZatcaAPIError: If clearance fails
        """
        endpoint = "/invoices/clearance/single"

        payload = {
            "invoiceHash": invoice_hash,
            "uuid": uuid,
            "invoice": invoice_xml
        }

        if not self.has_credentials():
            return self._credentials_missing_response(endpoint, payload, "clear")

        try:
            response = await self.client.post(
                endpoint,
                json=payload,
                headers=self._create_auth_header()
            )

            response.raise_for_status()
            result = response.json()

            # Parse validation results if present
            if "validationResults" in result:
                errors = self._parse_validation_results(result["validationResults"])
                result["parsed_errors"] = errors

            # Check if cleared successfully
            if result.get("clearanceStatus") == "CLEARED":
                result["success"] = True
                # ZATCA returns cleared invoice with additional elements
                if "clearedInvoice" in result:
                    result["cleared_xml"] = result["clearedInvoice"]
            else:
                result["success"] = False

            result["_response_headers"] = dict(response.headers)
            return result

        except httpx.HTTPStatusError as e:
            error_detail = self._parse_error_response(e.response)
            raise ZatcaAPIError(f"Invoice clearance failed: {error_detail}")
        except httpx.RequestError as e:
            raise ZatcaAPIError(f"Request failed: {str(e)}")
    
    def _parse_validation_results(self, validation_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse ZATCA validation results into readable format.
        
        Args:
            validation_results: Raw validation results from ZATCA
            
        Returns:
            Parsed errors with counts and details
        """
        errors = {
            "error_count": 0,
            "warning_count": 0,
            "info_count": 0,
            "errors": [],
            "warnings": [],
            "info": []
        }
        
        # Parse error messages
        if "errorMessages" in validation_results:
            for error in validation_results["errorMessages"]:
                errors["errors"].append({
                    "code": error.get("code", "UNKNOWN"),
                    "message": error.get("message", ""),
                    "category": error.get("category", ""),
                    "status": error.get("status", "ERROR")
                })
                errors["error_count"] += 1
        
        # Parse warning messages
        if "warningMessages" in validation_results:
            for warning in validation_results["warningMessages"]:
                errors["warnings"].append({
                    "code": warning.get("code", "UNKNOWN"),
                    "message": warning.get("message", ""),
                    "category": warning.get("category", ""),
                    "status": "WARNING"
                })
                errors["warning_count"] += 1
        
        # Parse info messages
        if "infoMessages" in validation_results:
            for info in validation_results["infoMessages"]:
                errors["info"].append({
                    "code": info.get("code", "UNKNOWN"),
                    "message": info.get("message", ""),
                    "category": info.get("category", ""),
                    "status": "INFO"
                })
                errors["info_count"] += 1
        
        return errors
    
    def _parse_error_response(self, response: httpx.Response) -> str:
        """
        Parse HTTP error response.
        
        Args:
            response: HTTP response object
            
        Returns:
            Error message string
        """
        try:
            error_data = response.json()
            if isinstance(error_data, dict):
                return error_data.get("message", str(error_data))
            return str(error_data)
        except:
            return response.text or f"HTTP {response.status_code}"
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    async def __aenter__(self):
        """Async context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()


async def update_invoice_status(
    invoice_id: int,
    status: str,
    zatca_response: Dict[str, Any],
    db_session
) -> None:
    """
    Update invoice status in database after ZATCA interaction.
    
    Args:
        invoice_id: Invoice database ID
        status: New status (REPORTED, CLEARED, REJECTED)
        zatca_response: Complete ZATCA API response
        db_session: Database session
    """
    from app.models.invoice import Invoice
    from sqlalchemy import select
    
    # Get invoice
    result = await db_session.execute(
        select(Invoice).where(Invoice.id == invoice_id)
    )
    invoice = result.scalar_one_or_none()
    
    if invoice:
        # Update status
        invoice.status = status
        invoice.zatca_response = zatca_response
        invoice.updated_at = datetime.utcnow()
        
        await db_session.commit()
