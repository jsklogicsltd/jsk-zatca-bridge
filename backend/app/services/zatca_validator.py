"""
ZATCA SDK Validator Wrapper.
Provides a Python interface to the official ZATCA CLI validator (Java-based).

The ZATCA SDK (cli-3.0.8-jar-with-dependencies.jar) does NOT validate when
simply invoked as `java -jar cli.jar -invoice <file>` — that only prints the
usage banner and exits 0. Real validation requires:

  1. The `-validate` flag.
  2. An `SDK_CONFIG` environment variable pointing at a JSON config file that
     maps the SDK's resource paths (XSD, schematrons, certificate, PIH, …) to
     real files on disk. Without it the SDK does `Paths.get(System.getenv(
     "SDK_CONFIG"))`, which throws an NPE surfaced as "failed to validate
     invoice - null".
  3. Parsing the verdict from the SDK's "GLOBAL VALIDATION RESULT = PASSED/
     FAILED" log line — the process exit code is always 0 regardless of outcome.

The required resources (xsds/, schematrons/, cert/, PrivateKey.pem) are bundled
inside the jar. On first use we extract them into a stable SDK "home" directory
next to the jar and generate the config there.
"""

import base64
import hashlib
import os
import re
import subprocess
import tempfile
import json
import zipfile
from pathlib import Path
from typing import Any, Dict, Optional


class ZATCAValidatorError(Exception):
    """Exception raised for ZATCA validator errors."""
    pass


# Resource entries (prefixes / exact names) to extract from the jar into the
# SDK home so the validator's filesystem paths resolve.
_JAR_RESOURCE_PREFIXES = ("xsds/", "schematrons/", "cert/")
_JAR_RESOURCE_FILES = ("PrivateKey.pem",)


# Known defects in the bundled 20210718 schematron that fire against otherwise
# fully-compliant invoices. We report them faithfully (the SDK still FAILS the
# invoice) but annotate the cause so consumers aren't misled. The transaction
# code is intentionally left honest rather than tweaked to silence these.
_KNOWN_SCHEMATRON_FALSE_POSITIVES = {
    "BR-KSA-31": (
        "Known false-positive in the bundled 20210718 schematron: the rule's "
        "own message says only third-party/nominal/summary flags are *allowed* "
        "for simplified invoices, but the XSL erroneously *requires* "
        "InvoiceTypeCode @name positions 3, 4 and 6 to all equal '1'. A correct "
        "plain simplified invoice (name='0200000') cannot satisfy it. ZATCA "
        "corrected this in later schematron releases."
    ),
}


class ZATCAValidator:
    """Wrapper for the official ZATCA SDK CLI validator (Java-based)."""

    def __init__(self, jar_path: Optional[str] = None, sdk_home: Optional[str] = None):
        """
        Args:
            jar_path: Path to the ZATCA CLI jar. Defaults to
                cli-3.0.8-jar-with-dependencies.jar in the backend directory.
            sdk_home: Directory to hold the extracted SDK resources + config.
                Defaults to ``.zatca_sdk_home`` next to the jar.
        """
        if jar_path is None:
            backend_dir = Path(__file__).parent.parent.parent  # backend/
            jar_path = backend_dir / "cli-3.0.8-jar-with-dependencies.jar"

        self.jar_path = Path(jar_path)
        if not self.jar_path.exists():
            raise FileNotFoundError(f"ZATCA CLI jar file not found at: {self.jar_path}")

        self.sdk_home = Path(sdk_home) if sdk_home else self.jar_path.parent / ".zatca_sdk_home"
        self.config_path = self.sdk_home / "config.json"

        self._verify_java()
        self._ensure_sdk_home()

    # ------------------------------------------------------------------ setup

    def _verify_java(self) -> None:
        """Verify Java is installed and accessible."""
        try:
            result = subprocess.run(
                ["java", "-version"], capture_output=True, text=True, timeout=10
            )
            if result.returncode != 0:
                raise ZATCAValidatorError("Java is not properly installed")
        except FileNotFoundError:
            raise ZATCAValidatorError(
                "Java is not installed. Please install Java 8 or higher."
            )
        except subprocess.TimeoutExpired:
            raise ZATCAValidatorError("Java command timed out")

    def _ensure_sdk_home(self) -> None:
        """
        Extract bundled SDK resources and write the config file. Idempotent:
        rebuilds only when the config is missing or older than the jar.
        """
        fresh = (
            self.config_path.exists()
            and self.config_path.stat().st_mtime >= self.jar_path.stat().st_mtime
        )
        if fresh:
            return

        self.sdk_home.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(self.jar_path) as jar:
            for name in jar.namelist():
                if name.endswith("/"):
                    continue
                if name.startswith(_JAR_RESOURCE_PREFIXES) or name in _JAR_RESOURCE_FILES:
                    target = self.sdk_home / name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with jar.open(name) as src, open(target, "wb") as dst:
                        dst.write(src.read())

        # Working dirs + the previous-invoice-hash file. For a standalone
        # validation the default first-invoice PIH is base64(SHA256("0")).
        (self.sdk_home / "input").mkdir(exist_ok=True)
        (self.sdk_home / "output").mkdir(exist_ok=True)
        pih_path = self.sdk_home / "input" / "pih.txt"
        # First-invoice PIH: base64 of the SHA-256 *hex digest string* of "0"
        # (matches InvoiceXMLBuilder.DEFAULT_PIH and the schematron's pinned
        # value). Using the raw 32 digest bytes here makes the SDK's PIH stage
        # report "KSA-13 PIH is inValid" against a schematron-valid invoice.
        default_pih = base64.b64encode(
            hashlib.sha256(b"0").hexdigest().encode("ascii")
        ).decode("ascii")
        pih_path.write_text(default_pih)

        config = {
            "xsdPath": str(self.sdk_home / "xsds/UBL2.1/xsd/maindoc/UBL-Invoice-2.1.xsd"),
            "enSchematron": str(self.sdk_home / "schematrons/CEN-EN16931-UBL.xsl"),
            "zatcaSchematron": str(
                self.sdk_home / "schematrons/20210718_ZATCA_E-invoice_Validation_Rules.xsl"
            ),
            "certPath": str(self.sdk_home / "cert/certificate.cer"),
            "pihPath": str(pih_path),
            "certPassword": "123456",
            "privateKeyPath": str(self.sdk_home / "PrivateKey.pem"),
            "inputPath": str(self.sdk_home / "input"),
            "outputPath": str(self.sdk_home / "output"),
            "usagePathFile": str(self.sdk_home / "usage.json"),
        }
        self.config_path.write_text(json.dumps(config, indent=2))

    # -------------------------------------------------------------- validate

    def validate_xml_file(self, xml_file_path: str) -> Dict[str, Any]:
        """Validate an invoice XML file using the ZATCA SDK."""
        xml_path = Path(xml_file_path)
        if not xml_path.exists():
            raise FileNotFoundError(f"XML file not found: {xml_file_path}")

        command = [
            "java", "-jar", str(self.jar_path),
            "-validate",
            "-invoice", str(xml_path),
        ]
        env = {**os.environ, "SDK_CONFIG": str(self.config_path)}

        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=60,
                cwd=str(self.sdk_home),
                env=env,
            )
        except subprocess.TimeoutExpired:
            raise ZATCAValidatorError("ZATCA validation timed out (60s)")
        except Exception as e:
            raise ZATCAValidatorError(f"Validation failed: {str(e)}")

        return self._parse_validation_output(result.stdout, result.stderr, result.returncode)

    def validate_xml_string(self, xml_content: str) -> Dict[str, Any]:
        """Validate an invoice XML string (written to a temp file first)."""
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".xml", delete=False, encoding="utf-8"
        ) as temp_file:
            temp_file.write(xml_content)
            temp_path = temp_file.name
        try:
            return self.validate_xml_file(temp_path)
        finally:
            try:
                os.unlink(temp_path)
            except OSError:
                pass

    # ---------------------------------------------------------------- parse

    def _parse_validation_output(
        self, stdout: str, stderr: str, return_code: int
    ) -> Dict[str, Any]:
        """
        Parse the SDK output. Validity comes from the SDK's own verdict line
        (``GLOBAL VALIDATION RESULT = PASSED``), never the exit code, which is
        always 0. If the SDK never emitted a verdict (e.g. it crashed before
        validating), we treat that as invalid and surface the failure.
        """
        text = f"{stdout}\n{stderr}"

        global_match = re.search(
            r"GLOBAL VALIDATION RESULT\s*=\s*(PASSED|FAILED)", text, re.IGNORECASE
        )
        produced_verdict = global_match is not None
        valid = bool(global_match) and global_match.group(1).upper() == "PASSED"

        # Per-stage outcomes, e.g. "[XSD] validation result : FAILED".
        stages = {
            stage.upper(): outcome.upper()
            for stage, outcome in re.findall(
                r"\[(\w+)\]\s*validation result\s*:\s*(PASSED|FAILED)", text, re.IGNORECASE
            )
        }

        errors = self._extract_errors(text)
        warnings = self._extract_warnings(text)
        info = [f"{k}: {v}" for k, v in stages.items()]

        # Flag any reported errors that are known schematron-version defects so
        # the verdict can be read in context (the SDK still fails the invoice).
        known_issues = [
            {"code": code, "explanation": note}
            for code, note in _KNOWN_SCHEMATRON_FALSE_POSITIVES.items()
            if any(f"[{code}]" in e for e in errors)
        ]

        if not produced_verdict:
            # The SDK exited without validating — almost always a setup/NPE
            # problem ("failed to validate invoice - null"). Make it loud
            # rather than silently reporting PASS.
            crash = re.search(r"failed to validate invoice\s*-\s*(.+)", text, re.IGNORECASE)
            errors.append(
                "ZATCA SDK did not produce a validation verdict"
                + (f" ({crash.group(1).strip()})" if crash else "")
                + ". The validator may be misconfigured."
            )

        summary = self._build_summary(
            valid, produced_verdict, stages, errors, warnings, known_issues
        )

        return {
            "valid": valid,
            "return_code": return_code,
            "errors": errors,
            "warnings": warnings,
            "info": info,
            "stages": stages,
            "known_issues": known_issues,
            "stdout": stdout,
            "stderr": stderr,
            "summary": summary,
        }

    def _extract_errors(self, text: str) -> list:
        """Pull the SDK's structured 'CODE : X, MESSAGE : Y' validation errors."""
        errors = []
        for code, message in re.findall(
            r"CODE\s*:\s*([^,\n]+?)\s*,\s*MESSAGE\s*:\s*(.+?)(?:\n|$)", text
        ):
            entry = f"[{code.strip()}] {message.strip()}"
            if entry not in errors:
                errors.append(entry)
        return errors

    def _extract_warnings(self, text: str) -> list:
        warnings = []
        for message in re.findall(r"WARNING\s*:\s*(.+?)(?:\n|$)", text):
            msg = message.strip()
            if len(msg) >= 5 and msg not in warnings:
                warnings.append(msg)
        return warnings

    def _build_summary(self, valid, produced_verdict, stages, errors, warnings, known_issues=None) -> str:
        lines = []
        if produced_verdict:
            lines.append(f"Validation Result: {'✓ PASS' if valid else '✗ FAIL'}")
        else:
            lines.append("Validation Result: ✗ ERROR (no verdict produced)")
        if stages:
            lines.append("Stages: " + ", ".join(f"{k}={v}" for k, v in stages.items()))
        if errors:
            lines.append(f"\nErrors ({len(errors)}):")
            for i, e in enumerate(errors[:10], 1):
                lines.append(f"  {i}. {e}")
            if len(errors) > 10:
                lines.append(f"  ... and {len(errors) - 10} more")
        if known_issues:
            lines.append(f"\nKnown schematron-version false-positives ({len(known_issues)}):")
            for issue in known_issues:
                lines.append(f"  [{issue['code']}] {issue['explanation']}")
        if warnings:
            lines.append(f"\nWarnings ({len(warnings)}):")
            for i, w in enumerate(warnings[:10], 1):
                lines.append(f"  {i}. {w}")
        return "\n".join(lines)

    # ----------------------------------------------------------------- meta

    def get_validator_version(self) -> str:
        """Best-effort SDK version string."""
        try:
            result = subprocess.run(
                ["java", "-jar", str(self.jar_path), "-help"],
                capture_output=True, text=True, timeout=10,
            )
            blob = f"{result.stdout}{result.stderr}"
            m = re.search(r"Java SDK\s+([\d.]+)", blob)
            if m:
                return m.group(1)
            return "3.0.8"
        except Exception:
            return "Unknown"
