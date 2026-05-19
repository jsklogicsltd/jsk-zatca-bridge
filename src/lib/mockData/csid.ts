// Mock data for CSID management, validation logs, and settings

export type CSIDStatus = "active" | "expiring" | "expired" | "revoked";

export interface CSIDRecord {
    id: string;
    serialNumber: string;
    issueDate: Date;
    expiryDate: Date;
    status: CSIDStatus;
    environment: "sandbox" | "production";
    issuedBy: string;
}

export interface ValidationLog {
    id: string;
    timestamp: Date;
    level: "info" | "warning" | "error" | "success";
    eventType: string;
    message: string;
    invoiceId?: string;
    details?: {
        request?: object;
        response?: object;
        stackTrace?: string;
    };
}

export interface ActiveSession {
    id: string;
    device: string;
    browser: string;
    location: string;
    ip: string;
    lastActive: Date;
    isCurrent: boolean;
}

export interface WebhookLog {
    id: string;
    timestamp: Date;
    event: string;
    status: "success" | "failed";
    responseCode: number;
}

// Current CSID
export const currentCSID: CSIDRecord = {
    id: "csid-001",
    serialNumber: "ZATCA-2026-01-PROD-7A8B9C",
    issueDate: new Date("2026-01-01"),
    expiryDate: new Date("2026-02-15"),
    status: "active",
    environment: "production",
    issuedBy: "ZATCA - Zakat, Tax and Customs Authority",
};

// CSID history
export const csidHistory: CSIDRecord[] = [
    currentCSID,
    {
        id: "csid-002",
        serialNumber: "ZATCA-2025-12-PROD-4D5E6F",
        issueDate: new Date("2025-12-01"),
        expiryDate: new Date("2026-01-01"),
        status: "expired",
        environment: "production",
        issuedBy: "ZATCA - Zakat, Tax and Customs Authority",
    },
    {
        id: "csid-003",
        serialNumber: "ZATCA-2025-11-SAND-1A2B3C",
        issueDate: new Date("2025-11-15"),
        expiryDate: new Date("2025-12-15"),
        status: "expired",
        environment: "sandbox",
        issuedBy: "ZATCA - Zakat, Tax and Customs Authority",
    },
    {
        id: "csid-004",
        serialNumber: "ZATCA-2025-10-SAND-9X8Y7Z",
        issueDate: new Date("2025-10-01"),
        expiryDate: new Date("2025-11-01"),
        status: "revoked",
        environment: "sandbox",
        issuedBy: "ZATCA - Zakat, Tax and Customs Authority",
    },
];

// Validation logs
export const validationLogs: ValidationLog[] = [
    {
        id: "log-001",
        timestamp: new Date("2026-01-23T14:15:07"),
        level: "success",
        eventType: "Invoice Clearance",
        message: "Invoice INV-2026-001247 cleared successfully by ZATCA",
        invoiceId: "inv-001",
        details: {
            response: { clearanceStatus: "CLEARED", clearanceId: "3fa85f64-5717-4562-b3fc-2c963f66afa6" },
        },
    },
    {
        id: "log-002",
        timestamp: new Date("2026-01-23T14:15:05"),
        level: "info",
        eventType: "API Call",
        message: "Submitted invoice to ZATCA clearance endpoint",
        invoiceId: "inv-001",
    },
    {
        id: "log-003",
        timestamp: new Date("2026-01-23T14:15:02"),
        level: "info",
        eventType: "Digital Signature",
        message: "Invoice signed with ECDSA-SHA256 algorithm",
        invoiceId: "inv-001",
    },
    {
        id: "log-004",
        timestamp: new Date("2026-01-23T13:00:00"),
        level: "warning",
        eventType: "CSID Expiry",
        message: "CSID certificate expires in 23 days. Consider renewal.",
    },
    {
        id: "log-005",
        timestamp: new Date("2026-01-22T16:30:10"),
        level: "error",
        eventType: "Invoice Validation",
        message: "Invoice validation failed: Invalid VAT calculation detected",
        invoiceId: "inv-006",
        details: {
            stackTrace: "ValidationError: VAT amount mismatch\n  at validateInvoice (validator.ts:45)\n  at submitInvoice (api.ts:120)",
        },
    },
    {
        id: "log-006",
        timestamp: new Date("2026-01-22T11:20:00"),
        level: "success",
        eventType: "Invoice Clearance",
        message: "Invoice INV-2026-001244 cleared successfully",
        invoiceId: "inv-004",
    },
    {
        id: "log-007",
        timestamp: new Date("2026-01-21T10:00:03"),
        level: "warning",
        eventType: "API Call",
        message: "ZATCA API response delayed: 3500ms latency detected",
    },
    {
        id: "log-008",
        timestamp: new Date("2026-01-20T09:00:00"),
        level: "info",
        eventType: "System",
        message: "System started successfully. All services operational.",
    },
    {
        id: "log-009",
        timestamp: new Date("2026-01-19T14:00:02"),
        level: "error",
        eventType: "Digital Signature",
        message: "Failed to sign invoice: Certificate expired",
        invoiceId: "inv-005",
        details: {
            stackTrace: "CertificateError: Certificate has expired\n  at signInvoice (signer.ts:78)",
        },
    },
    {
        id: "log-010",
        timestamp: new Date("2026-01-18T12:00:00"),
        level: "success",
        eventType: "CSID Renewal",
        message: "CSID certificate renewed successfully. New expiry: 2026-02-15",
    },
];

// Active sessions
export const activeSessions: ActiveSession[] = [
    {
        id: "sess-001",
        device: "MacBook Pro",
        browser: "Chrome 120",
        location: "Riyadh, SA",
        ip: "192.168.1.***",
        lastActive: new Date("2026-01-23T14:20:00"),
        isCurrent: true,
    },
    {
        id: "sess-002",
        device: "iPhone 15",
        browser: "Safari Mobile",
        location: "Riyadh, SA",
        ip: "10.0.0.***",
        lastActive: new Date("2026-01-23T10:30:00"),
        isCurrent: false,
    },
    {
        id: "sess-003",
        device: "Windows PC",
        browser: "Edge 120",
        location: "Jeddah, SA",
        ip: "172.16.0.***",
        lastActive: new Date("2026-01-22T16:45:00"),
        isCurrent: false,
    },
];

// Webhook logs
export const webhookLogs: WebhookLog[] = [
    { id: "wh-001", timestamp: new Date("2026-01-23T14:15:08"), event: "invoice.cleared", status: "success", responseCode: 200 },
    { id: "wh-002", timestamp: new Date("2026-01-22T16:30:12"), event: "invoice.failed", status: "success", responseCode: 200 },
    { id: "wh-003", timestamp: new Date("2026-01-21T10:00:05"), event: "invoice.cleared", status: "failed", responseCode: 500 },
    { id: "wh-004", timestamp: new Date("2026-01-20T09:15:07"), event: "invoice.cleared", status: "success", responseCode: 200 },
    { id: "wh-005", timestamp: new Date("2026-01-18T12:00:02"), event: "csid.renewed", status: "success", responseCode: 200 },
];

// Company settings
export const companySettings = {
    legalName: "JSK Logics Ltd.",
    commercialRegNumber: "1010123456",
    vatNumber: "300123456789003",
    address: {
        street: "King Fahd Road, Building 45",
        city: "Riyadh",
        postalCode: "11564",
        country: "Saudi Arabia",
    },
    email: "finance@jsklogics.com",
    phone: "+966 11 234 5678",
};

// Invoice defaults
export const invoiceDefaults = {
    paymentTerms: "net30",
    currency: "SAR",
    defaultTaxRate: 15,
    invoicePrefix: "INV",
    invoicePattern: "INV-{YYYY}-{######}",
    startingNumber: 1248,
};

// Notification preferences
export const notificationPrefs = {
    invoiceCleared: true,
    invoiceFailed: true,
    csidExpiring: true,
    weeklySummary: false,
    maintenanceAlerts: true,
    timing: "realtime" as "realtime" | "digest",
    notificationEmail: "alerts@jsklogics.com",
};

// API settings
export const apiSettings = {
    apiKey: "sk_live_************************mock",
    webhookUrl: "https://api.jsklogics.com/webhooks/zatca",
    webhookEvents: ["invoice.cleared", "invoice.failed", "csid.expiring"],
};

// Helper: calculate days until expiry
export function getDaysUntilExpiry(expiryDate: Date): number {
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Helper: get CSID status based on expiry
export function getCSIDStatusFromExpiry(expiryDate: Date): CSIDStatus {
    const days = getDaysUntilExpiry(expiryDate);
    if (days <= 0) return "expired";
    if (days <= 7) return "expiring";
    return "active";
}
