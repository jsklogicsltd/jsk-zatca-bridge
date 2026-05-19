// Mock data for reports and analytics

// Helper to generate date range
function generateDateRange(days: number): Date[] {
    const dates: Date[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dates.push(date);
    }
    return dates;
}

// Revenue data for trend chart
export const revenueData = generateDateRange(90).map((date, index) => ({
    date: date.toISOString().split("T")[0],
    revenue: Math.round(15000 + Math.random() * 10000 + Math.sin(index / 7) * 5000),
    invoices: Math.round(5 + Math.random() * 10),
}));

// Monthly summary
export const monthlyMetrics = {
    totalRevenue: 487500,
    previousMonthRevenue: 432000,
    revenueChange: 12.8,
    invoicesProcessed: 247,
    invoicesCleared: 238,
    invoicesPending: 6,
    invoicesFailed: 3,
    clearanceRate: 98.7,
    targetClearanceRate: 95,
    avgProcessingTime: 4.2,
    previousAvgTime: 5.1,
};

// Invoice status distribution
export const statusDistribution = [
    { name: "Cleared", value: 238, color: "#22c55e" },
    { name: "Pending", value: 6, color: "#f59e0b" },
    { name: "Failed", value: 3, color: "#ef4444" },
    { name: "Rejected", value: 0, color: "#f97316" },
];

// Processing time distribution
export const processingTimeData = [
    { range: "0-1s", count: 45 },
    { range: "1-2s", count: 82 },
    { range: "2-3s", count: 68 },
    { range: "3-4s", count: 32 },
    { range: "4-5s", count: 15 },
    { range: "5-10s", count: 4 },
    { range: "10s+", count: 1 },
];

// Top customers
export const topCustomers = [
    { name: "Al Rajhi Corporation", invoices: 42, totalAmount: 98500, avgValue: 2345, lastInvoice: new Date("2026-01-23") },
    { name: "Saudi Telecom Company", invoices: 38, totalAmount: 87200, avgValue: 2295, lastInvoice: new Date("2026-01-22") },
    { name: "ACWA Power", invoices: 31, totalAmount: 72100, avgValue: 2326, lastInvoice: new Date("2026-01-21") },
    { name: "Aramco Services", invoices: 28, totalAmount: 65400, avgValue: 2336, lastInvoice: new Date("2026-01-20") },
    { name: "Sabic Industries", invoices: 24, totalAmount: 56800, avgValue: 2367, lastInvoice: new Date("2026-01-23") },
    { name: "Ma'aden Mining", invoices: 19, totalAmount: 44100, avgValue: 2321, lastInvoice: new Date("2026-01-19") },
    { name: "NEOM Development", invoices: 16, totalAmount: 38500, avgValue: 2406, lastInvoice: new Date("2026-01-18") },
    { name: "Red Sea Global", invoices: 14, totalAmount: 32200, avgValue: 2300, lastInvoice: new Date("2026-01-17") },
    { name: "Lucid Motors KSA", invoices: 12, totalAmount: 28900, avgValue: 2408, lastInvoice: new Date("2026-01-16") },
    { name: "Diriyah Gate", invoices: 10, totalAmount: 24500, avgValue: 2450, lastInvoice: new Date("2026-01-15") },
];

// VAT report data
export const vatReportData = {
    totalSales: 487500,
    outputVAT: 73125,
    totalPurchases: 125000,
    inputVAT: 18750,
    netVATPayable: 54375,
};

// VAT transactions for the period
export const vatTransactions = [
    { date: new Date("2026-01-23"), invoiceNumber: "INV-2026-001247", customer: "Al Rajhi Corporation", taxableAmount: 45000, vatRate: 15, vatAmount: 6750, total: 51750 },
    { date: new Date("2026-01-22"), invoiceNumber: "INV-2026-001246", customer: "Saudi Telecom Company", taxableAmount: 43000, vatRate: 15, vatAmount: 6450, total: 49450 },
    { date: new Date("2026-01-21"), invoiceNumber: "INV-2026-001245", customer: "ACWA Power", taxableAmount: 16000, vatRate: 15, vatAmount: 2400, total: 18400 },
    { date: new Date("2026-01-20"), invoiceNumber: "INV-2026-001244", customer: "Aramco Services", taxableAmount: 47000, vatRate: 15, vatAmount: 7050, total: 54050 },
    { date: new Date("2026-01-19"), invoiceNumber: "INV-2026-001243", customer: "Sabic Industries", taxableAmount: 50000, vatRate: 15, vatAmount: 7500, total: 57500 },
    { date: new Date("2026-01-18"), invoiceNumber: "INV-2026-001242", customer: "Al Rajhi Corporation", taxableAmount: 8000, vatRate: 15, vatAmount: 1200, total: 9200 },
    { date: new Date("2026-01-17"), invoiceNumber: "INV-2026-001241", customer: "Saudi Telecom Company", taxableAmount: 45000, vatRate: 15, vatAmount: 6750, total: 51750 },
    { date: new Date("2026-01-16"), invoiceNumber: "INV-2026-001240", customer: "ACWA Power", taxableAmount: 40000, vatRate: 15, vatAmount: 6000, total: 46000 },
];

// Daily invoice volume heatmap data
export const dailyVolumeHeatmap = generateDateRange(365).map((date) => ({
    date: date.toISOString().split("T")[0],
    count: Math.max(0, Math.round(Math.random() * 15 - 2)),
}));

// Compliance analytics
export const complianceAnalytics = {
    successRateTrend: generateDateRange(30).map((date) => ({
        date: date.toISOString().split("T")[0],
        rate: Math.min(100, Math.max(90, 95 + Math.random() * 8)),
    })),
    failureReasons: [
        { reason: "Invalid VAT Calculation", count: 12 },
        { reason: "Missing Required Field", count: 8 },
        { reason: "Certificate Expired", count: 5 },
        { reason: "Invalid XML Schema", count: 4 },
        { reason: "Duplicate Invoice", count: 2 },
        { reason: "Network Timeout", count: 1 },
    ],
    avgRetryCount: 1.3,
};

// Report templates
export const savedReports = [
    { id: "1", name: "Monthly Invoice Summary", createdAt: new Date("2026-01-15"), format: "pdf" },
    { id: "2", name: "Q4 2025 VAT Report", createdAt: new Date("2025-12-31"), format: "excel" },
    { id: "3", name: "Customer Activity Report", createdAt: new Date("2026-01-10"), format: "csv" },
];
