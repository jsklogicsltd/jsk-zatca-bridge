/**
 * ZATCA API Types and Services
 */

import { apiClient, ApiResponse } from './client';

// ============ Types ============

export interface OnboardRequest {
    organization_name: string;
    tax_id: string;
    business_category?: string;
    otp_code?: string;
}

export interface OnboardResponse {
    success: boolean;
    csid: string;
    secret: string;
    issued_at: string;
    expires_at: string;
    organization_name: string;
    tax_id: string;
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
 * Onboard with ZATCA (get CSID)
 */
export async function zatcaOnboard(
    request: OnboardRequest
): Promise<ApiResponse<OnboardResponse>> {
    return apiClient.post<OnboardResponse>('/zatca/onboard', request);
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
