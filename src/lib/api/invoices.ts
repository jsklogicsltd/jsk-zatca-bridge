/**
 * Invoice API Types and Services
 */

import { apiClient, ApiResponse, DEMO_MODE, demoDelay } from './client';
import { resolveDemo } from './demoData';

// ============ Types ============

export interface Address {
    trn: string;
    name: string;
    street: string;
    building_number: string;
    city: string;
    district: string;
    postal_code: string;
    country_code: string;
}

export interface LineItem {
    name: string;
    quantity: number;
    price: number;
    vat_rate: number;
    tax_code: string;
    discount?: number;
}

export interface InvoiceCreate {
    invoice_type: 'Tax' | 'Simplified';
    invoice_number: string;
    issue_date: string;
    supplier: Address;
    customer: Address;
    line_items: LineItem[];
    currency_code: string;
    total_excluding_vat?: number;
    total_vat?: number;
    total_including_vat?: number;
}

export interface InvoiceValidationResult {
    valid: boolean;
    invoice_number: string;
    calculated_totals: {
        total_excluding_vat: number;
        total_vat: number;
        total_including_vat: number;
    };
    errors?: Array<{ field: string; message: string }>;
}

export interface InvoiceCalculateResult {
    invoice_number: string;
    total_excluding_vat: number;
    total_vat: number;
    total_including_vat: number;
    line_items: Array<{
        name: string;
        line_extension_amount: number;
        tax_amount: number;
        line_total: number;
    }>;
}

export interface SignedInvoice {
    success: boolean;
    invoice_number: string;
    invoice_uuid: string;
    hash: string;
    signature: string;
    qr_code: string;
    signed_xml: string;
}

export type ZatcaAction = 'compliance' | 'report' | 'clear';

export interface ZatcaSubmissionResult {
    success: boolean;
    /** REPORTED | CLEARED | REJECTED | CREDENTIALS_MISSING | SIGNED */
    status: string;
    invoice_number?: string;
    invoice_uuid?: string;
    hash?: string;
    signature?: string;
    qr_code?: string;
    signed_xml?: string;
    /** Server-generated id for audit log correlation */
    request_id?: string;
    /** Alias for request_id (UI label preference) */
    audit_id?: string;
    /** ISO8601 timestamp the backend captured before the outbound call */
    timestamp?: string;
    /** Actual ZATCA URL the backend tried (or would have tried) */
    attempted_url?: string;
    /** Alias for attempted_url emitted by the backend for clarity */
    would_submit_to?: string;
    /** Exact JSON body the backend would have POSTed to ZATCA */
    would_send_payload?: Record<string, unknown>;
    /** Serialised payload size in bytes */
    payload_size_bytes?: number;
    /** Canonical happy-path response shape for the action */
    expected_response_format?: Record<string, unknown>;
    /** Which ZATCA action was invoked */
    action?: ZatcaAction;
    /** Sandbox / simulation / production */
    environment?: string;
    /** Raw JSON returned by ZATCA (or by the credentials_missing shim) */
    zatca_response?: Record<string, unknown>;
    /** Response headers from ZATCA (when reachable) */
    zatca_response_headers?: Record<string, string>;
    /** Clearance UUID surfaced by ZATCA for B2B invoices */
    clearance_uuid?: string;
    message?: string;
}

export interface InvoiceListResponse {
    total: number;
    invoices: InvoiceResponse[];
    page: number;
    page_size: number;
}

export interface InvoiceResponse {
    id: number;
    uuid: string;
    invoice_number: string;
    status: 'DRAFT' | 'SIGNED' | 'REPORTED' | 'CLEARED' | 'REJECTED';
    hash?: string;
    previous_hash?: string;
    xml_content?: string;
    qr_code?: string;
    zatca_response?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

// ============ API Functions ============

/**
 * Validate an invoice without persisting
 */
export async function validateInvoice(
    invoice: InvoiceCreate
): Promise<ApiResponse<InvoiceValidationResult>> {
    return apiClient.post<InvoiceValidationResult>('/invoices/validate', invoice);
}

/**
 * Calculate invoice totals
 */
export async function calculateInvoice(
    invoice: InvoiceCreate
): Promise<ApiResponse<InvoiceCalculateResult>> {
    return apiClient.post<InvoiceCalculateResult>('/invoices/calculate', invoice);
}

/**
 * Generate UBL 2.1 XML for an invoice
 */
export async function generateInvoiceXml(
    invoice: InvoiceCreate
): Promise<ApiResponse<string>> {
    if (DEMO_MODE) {
        await demoDelay();
        return {
            data: resolveDemo('POST', '/invoices/generate-xml', invoice) as string,
            error: null,
            success: true,
        };
    }
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/invoices/generate-xml`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoice),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        return { data: null, error: { detail: error.detail, status: response.status }, success: false };
    }

    const xml = await response.text();
    return { data: xml, error: null, success: true };
}

/**
 * Sign an invoice (generates XML, hashes, signs, creates QR code)
 */
export async function signInvoice(
    invoice: InvoiceCreate
): Promise<ApiResponse<SignedInvoice>> {
    return apiClient.post<SignedInvoice>('/invoices/sign-invoice', invoice);
}

/**
 * Submit invoice to ZATCA. With REAL_ZATCA_SUBMISSION = true (client.ts),
 * this bypasses DEMO_MODE and hits the FastAPI backend, which proxies to
 * https://gw-fatoora.zatca.gov.sa/... server-side via httpx.
 */
export async function submitToZatca(
    invoice: InvoiceCreate,
    action: ZatcaAction = 'compliance'
): Promise<ApiResponse<ZatcaSubmissionResult>> {
    return apiClient.post<ZatcaSubmissionResult>(
        `/invoices/submit-to-zatca?action=${action}`,
        invoice
    );
}

/**
 * List invoices with pagination and filtering
 */
export async function listInvoices(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
}): Promise<ApiResponse<InvoiceListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const query = queryParams.toString();
    return apiClient.get<InvoiceListResponse>(`/invoices${query ? `?${query}` : ''}`);
}

/**
 * Get invoice by ID
 */
export async function getInvoice(id: number): Promise<ApiResponse<InvoiceResponse>> {
    return apiClient.get<InvoiceResponse>(`/invoices/${id}`);
}
