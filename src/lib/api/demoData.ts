/**
 * Demo data resolver — DEMO MODE ONLY
 *
 * When DEMO_MODE is enabled (see client.ts), every API call is answered from
 * here instead of hitting the FastAPI backend. This lets the full app flow
 * (auth → onboarding → ZATCA CSID → invoice signing → dashboard) run end to
 * end with realistic dummy data and no backend/Firebase required.
 *
 * To restore real backend integration: set DEMO_MODE = false in client.ts.
 */

function uuid(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
}

const now = () => new Date().toISOString();
const plusDays = (d: number) =>
    new Date(Date.now() + d * 86400000).toISOString();

function b64(len: number): string {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let s = "";
    for (let i = 0; i < len; i++)
        s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

const demoUser = (email?: string) => ({
    id: 1,
    email: email || "demo@jsklogics.com",
    full_name: "Ahmed Al-Rashid",
    company_name: "JSK Logics Trading Est.",
    tax_id: "300000000000003",
    phone: "+966512345678",
    is_active: true,
    is_verified: true,
    zatca_environment: "sandbox",
    has_zatca_csid: true,
    created_at: "2025-11-02T09:14:00Z",
});

const authResponse = (email?: string) => ({
    access_token: "demo." + b64(64),
    token_type: "bearer",
    expires_in: 3600,
    user: demoUser(email),
});

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>INV-2026-000124</cbc:ID>
  <cbc:UUID>${uuid()}</cbc:UUID>
  <cbc:IssueDate>2026-05-19</cbc:IssueDate>
  <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
  <cac:AccountingSupplierParty>JSK Logics Trading Est. (VAT 300000000000003)</cac:AccountingSupplierParty>
  <cac:LegalMonetaryTotal><cbc:PayableAmount currencyID="SAR">1725.00</cbc:PayableAmount></cac:LegalMonetaryTotal>
</Invoice>`;

const signedInvoice = (invoiceNumber: string) => ({
    success: true,
    invoice_number: invoiceNumber || "INV-2026-000124",
    invoice_uuid: uuid(),
    hash: b64(43) + "=",
    signature: b64(96),
    qr_code: b64(180),
    signed_xml: SAMPLE_XML,
});

function calcTotals(body: unknown) {
    const items =
        (body as { line_items?: Array<Record<string, number>> })?.line_items ||
        [];
    let net = 0;
    let vat = 0;
    for (const it of items) {
        const q = Number(it.quantity ?? 1);
        const p = Number(it.price ?? 0);
        const rate = Number(it.vat_rate ?? 15);
        const line = q * p - Number(it.discount ?? 0);
        net += line;
        vat += (line * rate) / 100;
    }
    if (net === 0) {
        net = 1500;
        vat = 225;
    }
    return {
        total_excluding_vat: Number(net.toFixed(2)),
        total_vat: Number(vat.toFixed(2)),
        total_including_vat: Number((net + vat).toFixed(2)),
    };
}

const demoInvoice = (id: number, status: string) => ({
    id,
    uuid: uuid(),
    invoice_number: `INV-2026-${String(id).padStart(6, "0")}`,
    status,
    hash: b64(43) + "=",
    previous_hash: b64(43) + "=",
    xml_content: SAMPLE_XML,
    qr_code: b64(180),
    zatca_response: { reportingStatus: status, validationResults: { status: "PASS" } },
    created_at: plusDays(-id),
    updated_at: plusDays(-id + 1),
});

/**
 * Resolve a demo response for a given method + endpoint.
 * Returns the raw payload the backend would have returned (already unwrapped).
 */
export function resolveDemo(
    method: string,
    endpoint: string,
    body?: unknown
): unknown {
    const e = endpoint.split("?")[0];
    const m = method.toUpperCase();
    const reqBody = (body as Record<string, unknown>) || {};

    // ---- Auth ----
    if (e === "/auth/login" || e === "/auth/signup")
        return authResponse(reqBody.email as string);
    if (e === "/auth/me")
        return m === "PUT"
            ? { ...demoUser(), ...reqBody }
            : demoUser();
    if (e === "/auth/change-password")
        return { message: "Password changed successfully" };
    if (e === "/auth/logout") return { message: "Logged out" };

    // ---- ZATCA onboarding / CSID ----
    if (e === "/zatca/onboard" || e === "/zatca/renew-csid")
        return {
            success: true,
            csid: "TUlJQ0V6Q0NBYm1nQXdJQkFnS" + b64(40),
            secret: b64(44),
            issued_at: now(),
            expires_at: plusDays(365),
            organization_name:
                (reqBody.organization_name as string) ||
                "JSK Logics Trading Est.",
            tax_id: (reqBody.tax_id as string) || "300000000000003",
            message: "CSID issued successfully (ZATCA sandbox)",
        };
    if (e === "/zatca/csid-status")
        return {
            csid: "TUlJQ0V6Q0NBYm1nQXdJQkFnSQ==",
            status: "active",
            issued_at: plusDays(-45),
            expires_at: plusDays(320),
            days_until_expiry: 320,
            is_valid: true,
        };
    if (e === "/zatca/compliance-check")
        return {
            success: true,
            status: "PASS",
            validation_results: {
                error_count: 0,
                warning_count: 1,
                info_count: 2,
                errors: [],
                warnings: ["QR code present but not scanned in sandbox"],
                info: [
                    "Invoice hash chain verified",
                    "UBL 2.1 schema valid",
                ],
            },
            message: "Invoice is ZATCA compliant (sandbox)",
        };
    if (e === "/zatca/health")
        return { status: "healthy", message: "ZATCA sandbox reachable (demo)" };

    // ---- Debug / SDK validator ----
    if (e === "/debug/validate-xml")
        return {
            valid: true,
            return_code: 0,
            errors: [],
            warnings: [],
            info: ["XSD validation passed", "EN16931 rules passed"],
            stdout: "GLOBAL VALIDATION RESULT: PASSED",
            stderr: "",
            summary: "PASSED — Invoice is ZATCA Phase-2 compliant",
        };
    if (e === "/debug/validator-info")
        return {
            validator_version: "3.0.8",
            jar_path: "backend/cli-3.0.8-jar-with-dependencies.jar",
            jar_exists: true,
            jar_size_mb: 21.0,
            java_available: true,
            status: "ready",
        };

    // ---- Invoices ----
    if (e === "/invoices/validate") {
        const t = calcTotals(body);
        return {
            valid: true,
            invoice_number:
                (reqBody.invoice_number as string) || "INV-2026-000124",
            calculated_totals: t,
            errors: [],
        };
    }
    if (e === "/invoices/calculate") {
        const t = calcTotals(body);
        const items =
            (reqBody.line_items as Array<Record<string, number>>) || [];
        return {
            invoice_number:
                (reqBody.invoice_number as string) || "INV-2026-000124",
            ...t,
            line_items: items.map((it) => ({
                name: (it as unknown as { name: string }).name || "Item",
                line_extension_amount: Number(
                    ((it.quantity ?? 1) * (it.price ?? 0)).toFixed(2)
                ),
                tax_amount: Number(
                    (
                        ((it.quantity ?? 1) * (it.price ?? 0) *
                            (it.vat_rate ?? 15)) /
                        100
                    ).toFixed(2)
                ),
                line_total: Number(
                    (
                        (it.quantity ?? 1) *
                        (it.price ?? 0) *
                        (1 + (it.vat_rate ?? 15) / 100)
                    ).toFixed(2)
                ),
            })),
        };
    }
    if (e === "/invoices/generate-xml") return SAMPLE_XML;
    if (e === "/invoices/sign-invoice")
        return signedInvoice(reqBody.invoice_number as string);
    if (e === "/invoices/submit-to-zatca")
        return {
            success: true,
            status: endpoint.includes("clear") ? "CLEARED" : "REPORTED",
            invoice_uuid: uuid(),
            zatca_response: {
                clearanceStatus: "CLEARED",
                validationResults: { status: "PASS", warnings: [] },
            },
            message: "Invoice accepted by ZATCA (sandbox)",
        };
    if (/^\/invoices\/\d+$/.test(e)) {
        const id = Number(e.split("/")[2]);
        return demoInvoice(id, "CLEARED");
    }
    if (e === "/invoices")
        return {
            total: 5,
            page: 1,
            page_size: 20,
            invoices: [
                demoInvoice(124, "CLEARED"),
                demoInvoice(123, "REPORTED"),
                demoInvoice(122, "CLEARED"),
                demoInvoice(121, "SIGNED"),
                demoInvoice(120, "REJECTED"),
            ],
        };

    // ---- Upload ----
    if (e === "/upload/batch")
        return {
            success: true,
            total_invoices: 3,
            invoices: [1, 2, 3].map((n) => ({
                invoice_type: "Simplified",
                customer: {
                    name: `Customer ${n}`,
                    vat: "3000000000000" + n + "3",
                    city: "Riyadh",
                },
                issue_date: "2026-05-19",
                line_items: [
                    {
                        description: "Consulting services",
                        quantity: n,
                        unit_price: 500,
                        tax_rate: 15,
                    },
                ],
            })),
            errors: [],
            warnings: [],
        };
    if (e === "/upload/pdf")
        return {
            success: true,
            invoice: {
                invoice_number: "INV-2026-000130",
                invoice_date: "2026-05-18",
                customer: {
                    name: "Al Faisaliah Group",
                    vat: "300055500000003",
                    city: "Jeddah",
                },
                subtotal: 2000,
                vat_amount: 300,
                total: 2300,
                line_items: [
                    {
                        description: "Logistics services",
                        quantity: 1,
                        unit_price: 2000,
                        tax_rate: 15,
                    },
                ],
                confidence: 0.94,
                raw_text_preview: "TAX INVOICE — Al Faisaliah Group ...",
            },
            error: null,
            warnings: [],
            used_ocr: false,
            confidence: 0.94,
        };
    if (e === "/upload/template/csv")
        return {
            template:
                "invoice_type,customer_name,customer_vat,issue_date,description,quantity,unit_price,tax_rate\nSimplified,Acme Co,300000000000003,2026-05-19,Item A,2,500,15\n",
            filename: "invoice_template.csv",
        };
    if (e === "/upload/template/info")
        return {
            formats_supported: ["CSV", "XLSX"],
            required_columns: [
                "customer_name",
                "customer_vat",
                "issue_date",
                "description",
                "quantity",
                "unit_price",
            ],
            optional_columns: ["tax_rate", "invoice_type", "reference"],
            column_aliases: { customer_vat: ["vat", "trn", "tax_id"] },
            date_formats: ["YYYY-MM-DD", "DD/MM/YYYY"],
            notes: ["Max 500 rows per upload", "tax_rate defaults to 15%"],
        };

    // ---- Dashboard / health ----
    if (e === "/stats")
        return {
            total_invoices: 1284,
            total_revenue: 4875200.5,
            total_vat: 731280.08,
            cleared_count: 902,
            reported_count: 318,
            rejected_count: 12,
            draft_count: 28,
            signed_count: 24,
        };
    if (e === "/health")
        return {
            status: "healthy",
            database: "connected (demo)",
            version: "1.0.0",
            timestamp: now(),
        };

    // Fallback: generic success
    return { success: true, message: "OK (demo)" };
}
