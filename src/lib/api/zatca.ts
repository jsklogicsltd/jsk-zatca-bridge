/**
 * ZATCA API Types and Services
 */

import { apiClient, ApiResponse } from './client';

// ============ Types ============

export interface OnboardRequest {
    organization_name: string;
    tax_id: string;
    business_category?: string;
    otp_code: string;
    common_name?: string;
    organization_unit_name?: string;
    invoice_type?: string;
    registered_address?: string;
    environment?: 'sandbox' | 'simulation' | 'production';
    egs_solution_name?: string;
    egs_model?: string;
    egs_serial?: string;
}

export interface OnboardResponse {
    success: boolean;
    /** issued | credentials_missing | zatca_error | mock */
    status?: string;
    csid?: string;
    secret?: string;
    compliance_request_id?: string;
    disposition_message?: string;
    issued_at: string;
    expires_at: string;
    organization_name: string;
    tax_id: string;
    environment?: string;
    attempted_url?: string;
    csr_preview?: string;
    message: string;
}

export interface CSRPreviewRequest {
    organization_name: string;
    tax_id: string;
    common_name?: string;
    business_category?: string;
    invoice_type?: string;
    registered_address?: string;
    environment?: 'sandbox' | 'simulation' | 'production';
}

export interface CSRPreviewResponse {
    csr_pem: string;
    csr_base64: string;
    tax_id: string;
    environment: string;
}

export interface ZatcaCredentials {
    csid: string;
    secret: string;
    environment?: 'sandbox' | 'simulation' | 'production';
}

export interface CredentialsStatus {
    has_csid: boolean;
    has_secret: boolean;
    environment?: string;
    csid_preview?: string;
}

export interface UpgradeToProductionResponse {
    success: boolean;
    attempted_url?: string;
    request_id?: string;
    disposition_message?: string;
    message: string;
}

export interface ComplianceCheckRequest {
    csid: string;
    invoice_hash: string;
    invoice_uuid: string;
}

export interface ComplianceCheckResponse {
    success: boolean;
    status: string;
    validation_results: {
        error_count: number;
        warning_count: number;
        info_count: number;
        errors: string[];
        warnings: string[];
        info: string[];
    };
    message: string;
}

export interface CSIDStatusResponse {
    csid: string;
    status: string;
    issued_at: string;
    expires_at: string;
    days_until_expiry: number;
    is_valid: boolean;
}

export interface ValidatorInfo {
    validator_version: string;
    jar_path: string;
    jar_exists: boolean;
    jar_size_mb: number;
    java_available: boolean;
    status: string;
}

export interface XMLValidationResult {
    valid: boolean;
    return_code: number;
    errors: string[];
    warnings: string[];
    info: string[];
    stdout: string;
    stderr: string;
    summary: string;
}

// ============ API Functions ============

/**
 * Onboard with ZATCA — performs real CSR generation server-side and posts
 * to the ZATCA `/compliance` endpoint. Pass `?mock=true` via the optional
 * `mock` flag to fall back to the legacy random-bytes behaviour.
 */
export async function zatcaOnboard(
    request: OnboardRequest,
    options?: { mock?: boolean }
): Promise<ApiResponse<OnboardResponse>> {
    const suffix = options?.mock ? '?mock=true' : '';
    return apiClient.post<OnboardResponse>(`/zatca/onboard${suffix}`, request);
}

/**
 * Generate (and return) a CSR locally without contacting ZATCA — useful for
 * verifying SAN/OID structure before committing an OTP.
 */
export async function previewCSR(
    request: CSRPreviewRequest
): Promise<ApiResponse<CSRPreviewResponse>> {
    return apiClient.post<CSRPreviewResponse>('/zatca/csr/preview', request);
}

/**
 * Manually paste in a CSID + secret obtained out-of-band (e.g. directly from
 * the ZATCA sandbox UI). Stored encrypted on the user record.
 */
export async function setZatcaCredentials(
    body: ZatcaCredentials
): Promise<ApiResponse<CredentialsStatus>> {
    return apiClient.put<CredentialsStatus>('/zatca/credentials', body);
}

export async function getZatcaCredentialsStatus(): Promise<ApiResponse<CredentialsStatus>> {
    return apiClient.get<CredentialsStatus>('/zatca/credentials/status');
}

export async function clearZatcaCredentials(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>('/zatca/credentials');
}

/**
 * Phase-2 step 2: upgrade a stored compliance CSID to a production CSID.
 */
export async function upgradeToProduction(
    compliance_request_id?: string
): Promise<ApiResponse<UpgradeToProductionResponse>> {
    return apiClient.post<UpgradeToProductionResponse>(
        '/zatca/upgrade-to-production',
        compliance_request_id ? { compliance_request_id } : {}
    );
}

/**
 * Check CSID status
 */
export async function getCSIDStatus(
    csid: string
): Promise<ApiResponse<CSIDStatusResponse>> {
    return apiClient.get<CSIDStatusResponse>(`/zatca/csid-status?csid=${encodeURIComponent(csid)}`);
}

/**
 * Renew CSID
 */
export async function renewCSID(
    csid: string
): Promise<ApiResponse<OnboardResponse>> {
    return apiClient.post<OnboardResponse>(`/zatca/renew-csid?csid=${encodeURIComponent(csid)}`, {});
}

/**
 * Run compliance check
 */
export async function complianceCheck(
    request: ComplianceCheckRequest
): Promise<ApiResponse<ComplianceCheckResponse>> {
    return apiClient.post<ComplianceCheckResponse>('/zatca/compliance-check', request);
}

/**
 * Get ZATCA service health
 */
export async function getZatcaHealth(): Promise<ApiResponse<{ status: string; message: string }>> {
    return apiClient.get<{ status: string; message: string }>('/zatca/health');
}

/**
 * Validate XML with ZATCA SDK
 */
export async function validateXmlWithSdk(
    xmlContent: string
): Promise<ApiResponse<XMLValidationResult>> {
    return apiClient.post<XMLValidationResult>('/debug/validate-xml', { xml_content: xmlContent });
}

/**
 * Get ZATCA SDK validator info
 */
export async function getValidatorInfo(): Promise<ApiResponse<ValidatorInfo>> {
    return apiClient.get<ValidatorInfo>('/debug/validator-info');
}
