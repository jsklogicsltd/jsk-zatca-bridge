/**
 * API exports
 * Centralized exports for all API services
 */

// Client
export {
    apiClient,
    ApiClient,
    DEMO_MODE,
    REAL_ZATCA_SUBMISSION,
    type ApiResponse,
    type ApiError,
} from './client';

// Invoice APIs
export {
    validateInvoice,
    calculateInvoice,
    generateInvoiceXml,
    signInvoice,
    submitToZatca,
    listInvoices,
    getInvoice,
    type InvoiceCreate,
    type Address,
    type LineItem,
    type InvoiceValidationResult,
    type InvoiceCalculateResult,
    type SignedInvoice,
    type ZatcaAction,
    type ZatcaSubmissionResult,
    type InvoiceListResponse,
    type InvoiceResponse,
} from './invoices';

// ZATCA APIs
export {
    zatcaOnboard,
    previewCSR,
    setZatcaCredentials,
    getZatcaCredentialsStatus,
    clearZatcaCredentials,
    upgradeToProduction,
    getCSIDStatus,
    renewCSID,
    complianceCheck,
    getZatcaHealth,
    validateXmlWithSdk,
    getValidatorInfo,
    type OnboardRequest,
    type OnboardResponse,
    type CSRPreviewRequest,
    type CSRPreviewResponse,
    type ZatcaCredentials,
    type CredentialsStatus,
    type UpgradeToProductionResponse,
    type ComplianceCheckRequest,
    type ComplianceCheckResponse,
    type CSIDStatusResponse,
    type ValidatorInfo,
    type XMLValidationResult,
} from './zatca';

// Dashboard APIs
export {
    getDashboardStats,
    getHealthStatus,
    type DashboardStats,
    type HealthStatus,
} from './dashboard';

// Authentication APIs
export {
    signup,
    login,
    logout,
    getCurrentUser,
    updateProfile,
    changePassword,
    getStoredToken,
    getStoredUser,
    clearAuth,
    isAuthenticated,
    type SignupRequest,
    type LoginRequest,
    type User,
    type AuthResponse,
    type UpdateProfileRequest,
    type ChangePasswordRequest,
} from './auth';
