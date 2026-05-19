"""
ZATCA SDK Validator Wrapper.
Provides Python interface to the official ZATCA CLI validator (Java-based).
"""

import subprocess
import os
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import json
import re


class ZATCAValidatorError(Exception):
    """Exception raised for ZATCA validator errors."""
    pass


class ZATCAValidator:
    """
    Wrapper for ZATCA SDK CLI validator (Java-based).
    
    The ZATCA SDK provides official validation for e-invoices to ensure
    compliance with Saudi Arabia's ZATCA requirements.
    """
    
    def __init__(self, jar_path: Optional[str] = None):
        """
        Initialize ZATCA validator.
        
        Args:
            jar_path: Path to the ZATCA CLI jar file.
                     Defaults to cli-3.0.8-jar-with-dependencies.jar in backend directory.
        """
        if jar_path is None:
            # Default to jar file in backend directory
            # Get the backend directory (3 levels up from services)
            current_file = Path(__file__)  # app/services/zatca_validator.py
            backend_dir = current_file.parent.parent.parent  # Go up to backend/
            jar_path = backend_dir / "cli-3.0.8-jar-with-dependencies.jar"
        
        self.jar_path = Path(jar_path)
        
        # Verify jar file exists
        if not self.jar_path.exists():
            raise FileNotFoundError(
                f"ZATCA CLI jar file not found at: {self.jar_path}"
            )
        
        # Verify Java is installed
        self._verify_java()
    
    def _verify_java(self):
        """Verify Java is installed and accessible."""
        try:
            result = subprocess.run(
                ["java", "-version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode != 0:
                raise ZATCAValidatorError("Java is not properly installed")
        except FileNotFoundError:
            raise ZATCAValidatorError(
                "Java is not installed. Please install Java 8 or higher."
            )
        except subprocess.TimeoutExpired:
            raise ZATCAValidatorError("Java command timed out")
    
    def validate_xml_file(self, xml_file_path: str) -> Dict[str, Any]:
        """
        Validate an invoice XML file using ZATCA SDK.
        
        Args:
            xml_file_path: Path to the XML file to validate
            
        Returns:
            Dictionary containing validation results:
            {
                "valid": bool,
                "stdout": str,
                "stderr": str,
                "errors": List[str],
                "warnings": List[str],
                "return_code": int
            }
            
        Raises:
            ZATCAValidatorError: If validation process fails
        """
        xml_path = Path(xml_file_path)
        
        if not xml_path.exists():
            raise FileNotFoundError(f"XML file not found: {xml_file_path}")
        
        # Build command
        command = [
            "java",
            "-jar",
            str(self.jar_path),
            "-invoice",
            str(xml_path)
        ]
        
        try:
            # Run ZATCA validator
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=self.jar_path.parent
            )
            
            # Parse output
            return self._parse_validation_output(
                result.stdout,
                result.stderr,
                result.returncode
            )
            
        except subprocess.TimeoutExpired:
            raise ZATCAValidatorError("ZATCA validation timed out (30s)")
        except Exception as e:
            raise ZATCAValidatorError(f"Validation failed: {str(e)}")
    
    def validate_xml_string(self, xml_content: str) -> Dict[str, Any]:
        """
        Validate an invoice XML string using ZATCA SDK.
        
        Creates a temporary file for the XML content, validates it,
        and cleans up the temporary file.
        
        Args:
            xml_content: XML content as string
            
        Returns:
            Dictionary containing validation results (same as validate_xml_file)
        """
        # Create temporary file for XML content
        with tempfile.NamedTemporaryFile(
            mode='w',
            suffix='.xml',
            delete=False,
            encoding='utf-8'
        ) as temp_file:
            temp_file.write(xml_content)
            temp_path = temp_file.name
        
        try:
            # Validate the temporary file
            result = self.validate_xml_file(temp_path)
            return result
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_path)
            except:
                pass
    
    def _parse_validation_output(
        self,
        stdout: str,
        stderr: str,
        return_code: int
    ) -> Dict[str, Any]:
        """
        Parse ZATCA validator output.
        
        Args:
            stdout: Standard output from validator
            stderr: Standard error from validator
            return_code: Process return code
            
        Returns:
            Parsed validation results
        """
        # Initialize result structure
        result = {
            "valid": return_code == 0,
            "stdout": stdout,
            "stderr": stderr,
            "return_code": return_code,
            "errors": [],
            "warnings": [],
            "info": []
        }
        
        # Parse stdout for validation messages
        if stdout:
            result["errors"].extend(self._extract_messages(stdout, "ERROR"))
            result["warnings"].extend(self._extract_messages(stdout, "WARNING"))
            result["info"].extend(self._extract_messages(stdout, "INFO"))
        
        # Parse stderr for any error messages
        if stderr:
            result["errors"].extend(self._extract_messages(stderr, "ERROR"))
        
        # Determine overall validity
        # Valid if return code is 0 and no errors found
        result["valid"] = return_code == 0 and len(result["errors"]) == 0
        
        return result
    
    def _extract_messages(self, text: str, level: str) -> list:
        """
        Extract validation messages by level from output text.
        
        Args:
            text: Output text to parse
            level: Message level (ERROR, WARNING, INFO)
            
        Returns:
            List of extracted messages
        """
        messages = []
        
        # Patterns to skip (SDK banner text, not real errors)
        skip_patterns = [
            "Welcome to ZATCA",
            "E-Invoice Java SDK",
            "This SDK uses Java",
            "It can take a Standard",
            "It returns if the validation",
            "shows errors where the XML validation fails",
            "s where the XML validation fails",  # Partial match
            "It checks for syntax",
            "MainApp -",  # Empty MainApp lines
            "MainApp",  # Any MainApp reference
            "********",
            "jar)",
            "passing it an invoice",
            "successful or shows errors",
        ]
        
        # Look for common patterns in ZATCA validator output
        patterns = [
            rf"{level}:?\s*(.+?)(?:\n|$)",
            rf"\[{level}\]\s*(.+?)(?:\n|$)",
            rf"{level}\s*-\s*(.+?)(?:\n|$)"
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                message = match.group(1).strip()
                
                # Skip empty or banner messages
                if not message or len(message) < 5:
                    continue
                    
                # Skip SDK banner messages
                should_skip = False
                for skip in skip_patterns:
                    if skip in message:
                        should_skip = True
                        break
                
                if should_skip:
                    continue
                    
                if message not in messages:
                    messages.append(message)
        
        return messages
    
    def get_validator_version(self) -> str:
        """
        Get ZATCA SDK validator version.
        
        Returns:
            Version string
        """
        try:
            result = subprocess.run(
                ["java", "-jar", str(self.jar_path), "-version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            # Try to extract version from output
            if "3.0.8" in result.stdout or "3.0.8" in result.stderr:
                return "3.0.8"
            
            return result.stdout.strip() or "Unknown"
            
        except Exception:
            return "Unknown"


# Test function
def test_zatca_validator():
    """
    Test function to verify ZATCA SDK validator works.
    
    Creates a minimal UBL 2.1 XML invoice and validates it.
    """
    print("=" * 60)
    print("ZATCA Validator Test")
    print("=" * 60)
    
    # Create a minimal test XML (may not pass ZATCA validation, but tests the wrapper)
    test_xml = """<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:ID>TEST-001</cbc:ID>
    <cbc:IssueDate>2026-01-29</cbc:IssueDate>
    <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="CRN">310122393500003</cbc:ID>
            </cac:PartyIdentification>
        </cac:Party>
    </cac:AccountingSupplierParty>
    <cac:LegalMonetaryTotal>
        <cbc:PayableAmount currencyID="SAR">1000.00</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
</Invoice>"""
    
    try:
        # Initialize validator
        print("\n1. Initializing ZATCA validator...")
        validator = ZATCAValidator()
        print(f"   ✓ Validator initialized")
        print(f"   JAR path: {validator.jar_path}")
        
        # Get version
        print("\n2. Getting validator version...")
        version = validator.get_validator_version()
        print(f"   ✓ Version: {version}")
        
        # Validate test XML
        print("\n3. Validating test XML...")
        result = validator.validate_xml_string(test_xml)
        
        print(f"\n4. Validation Results:")
        print(f"   Valid: {result['valid']}")
        print(f"   Return Code: {result['return_code']}")
        print(f"   Errors: {len(result['errors'])}")
        print(f"   Warnings: {len(result['warnings'])}")
        print(f"   Info: {len(result['info'])}")
        
        if result['errors']:
            print(f"\n   Error Messages:")
            for error in result['errors'][:5]:  # Show first 5 errors
                print(f"   - {error}")
        
        if result['warnings']:
            print(f"\n   Warning Messages:")
            for warning in result['warnings'][:5]:  # Show first 5 warnings
                print(f"   - {warning}")
        
        print(f"\n5. Raw Output:")
        if result['stdout']:
            print(f"\n   STDOUT:")
            print("   " + "\n   ".join(result['stdout'].split('\n')[:10]))
        
        if result['stderr']:
            print(f"\n   STDERR:")
            print("   " + "\n   ".join(result['stderr'].split('\n')[:10]))
        
        print("\n" + "=" * 60)
        print("✓ Test completed successfully!")
        print("  ZATCA SDK validator wrapper is working.")
        print("=" * 60)
        
        return result
        
    except ZATCAValidatorError as e:
        print(f"\n✗ ZATCA Validator Error: {e}")
        print("=" * 60)
        return None
    except Exception as e:
        print(f"\n✗ Unexpected Error: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return None


if __name__ == "__main__":
    # Run test when script is executed directly
    test_zatca_validator()
