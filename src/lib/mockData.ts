// Mock data for dashboard components

export const dashboardStats = {
    totalInvoices: {
        value: 1247,
        trend: 12.5,
        trendDirection: "up" as const,
        label: "Total Invoices",
    },
    clearedRate: {
        value: 98.7,
        trend: 2.1,
        trendDirection: "up" as const,
        label: "Cleared Rate",
    },
    pendingReview: {
        value: 3,
        trend: -5,
        trendDirection: "down" as const,
        label: "Pending Review",
    },
    csidStatus: {
        status: "active" as "active" | "expiring" | "expired",
        expiryDate: new Date("2026-02-15"),
        label: "CSID Status",
    },
};

export const recentActivities = [
    {
        id: "1",
        invoiceNumber: "INV-2026-001247",
        customerName: "Al Rajhi Corporation",
        status: "success" as const,
        timestamp: new Date("2026-01-23T14:15:00"),
        type: "clearance",
    },
    {
        id: "2",
        invoiceNumber: "INV-2026-001246",
        customerName: "Saudi Telecom Company",
        status: "success" as const,
        timestamp: new Date("2026-01-23T13:45:00"),
        type: "clearance",
    },
    {
        id: "3",
        invoiceNumber: "INV-2026-001245",
        customerName: "ACWA Power",
        status: "pending" as const,
        timestamp: new Date("2026-01-23T12:30:00"),
        type: "validation",
    },
    {
        id: "4",
        invoiceNumber: "INV-2026-001244",
        customerName: "Aramco Services",
        status: "success" as const,
        timestamp: new Date("2026-01-23T11:20:00"),
        type: "clearance",
    },
    {
        id: "5",
        invoiceNumber: "INV-2026-001243",
        customerName: "Sabic Industries",
        status: "failed" as const,
        timestamp: new Date("2026-01-23T10:00:00"),
        type: "clearance",
    },
];

export const systemStatus = {
    zatcaConnection: "connected" as "connected" | "degraded" | "down",
    lastSyncTime: new Date("2026-01-23T14:18:00"),
    csidInfo: {
        status: "active" as "active" | "expiring" | "expired",
        expiryDate: new Date("2026-02-15"),
        daysUntilExpiry: 23,
    },
    apiHealth: {
        uptime: 99.98,
        latency: 145, // ms
    },
};

export const quickActions = [
    {
        id: "submit-invoice",
        label: "Submit Invoice",
        description: "Upload and submit",
        icon: "Upload",
        href: "/dashboard/invoices/new",
    },
    {
        id: "validate-xml",
        label: "Validate XML",
        description: "Check compliance",
        icon: "CheckCircle",
        href: "/dashboard/validation",
    },
    {
        id: "download-report",
        label: "Download Report",
        description: "Export data",
        icon: "Download",
        href: "/dashboard/reports",
    },
    {
        id: "view-docs",
        label: "Documentation",
        description: "API reference",
        icon: "BookOpen",
        href: "/dashboard/docs",
    },
];

export const navigationItems = {
    main: [
        { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        { name: "Invoices", href: "/dashboard/invoices", icon: "FileText" },
        { name: "Reports", href: "/dashboard/reports", icon: "BarChart3" },
    ],
    compliance: [
        { name: "CSID Management", href: "/dashboard/csid", icon: "ShieldCheck" },
        { name: "Validation Logs", href: "/dashboard/logs", icon: "ScrollText" },
        { name: "Settings", href: "/dashboard/settings", icon: "Settings" },
    ],
    support: [
        { name: "Documentation", href: "/dashboard/docs", icon: "BookOpen" },
        { name: "API Reference", href: "/dashboard/api", icon: "Code2" },
        { name: "Help Center", href: "/dashboard/help", icon: "HelpCircle" },
    ],
};

export const currentUser = {
    name: "Ahmed Al-Rashid",
    email: "ahmed@company.sa",
    role: "Admin",
    avatar: null,
    company: "JSK Logics Ltd.",
    complianceStatus: "compliant" as "compliant" | "warning" | "critical",
};
