// Mock invoice data for the invoice management system

export type InvoiceStatus = "cleared" | "pending" | "failed" | "rejected";

export interface Customer {
    id: string;
    name: string;
    vatNumber: string;
    address: string;
    city: string;
    country: string;
    type: "B2B" | "B2C";
}

export interface LineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
}

export interface ValidationStep {
    id: string;
    step: string;
    status: "success" | "error" | "pending";
    timestamp: Date;
    message?: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    customer: Customer;
    issueDate: Date;
    dueDate: Date;
    status: InvoiceStatus;
    lineItems: LineItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    currency: string;
    reference?: string;
    clearanceUuid?: string;
    invoiceHash?: string;
    qrCode?: string;
    submittedAt?: Date;
    validationLog: ValidationStep[];
}

export const mockCustomers: Customer[] = [
    {
        id: "cust-001",
        name: "Al Rajhi Corporation",
        vatNumber: "300123456789003",
        address: "King Fahd Road, Building 45",
        city: "Riyadh",
        country: "Saudi Arabia",
        type: "B2B",
    },
    {
        id: "cust-002",
        name: "Saudi Telecom Company",
        vatNumber: "300987654321003",
        address: "Olaya Street, Tower 12",
        city: "Riyadh",
        country: "Saudi Arabia",
        type: "B2B",
    },
    {
        id: "cust-003",
        name: "ACWA Power",
        vatNumber: "300456789123003",
        address: "Industrial City, Zone B",
        city: "Jeddah",
        country: "Saudi Arabia",
        type: "B2B",
    },
    {
        id: "cust-004",
        name: "Aramco Services",
        vatNumber: "300111222333003",
        address: "Dhahran Boulevard",
        city: "Dhahran",
        country: "Saudi Arabia",
        type: "B2B",
    },
    {
        id: "cust-005",
        name: "Sabic Industries",
        vatNumber: "300555666777003",
        address: "Jubail Industrial City",
        city: "Jubail",
        country: "Saudi Arabia",
        type: "B2B",
    },
];

export const mockInvoices: Invoice[] = [
    {
        id: "inv-001",
        invoiceNumber: "INV-2026-001247",
        customer: mockCustomers[0],
        issueDate: new Date("2026-01-23"),
        dueDate: new Date("2026-02-22"),
        status: "cleared",
        lineItems: [
            { id: "li-1", description: "Software License - Annual", quantity: 1, unitPrice: 15000, taxRate: 15, total: 17250 },
            { id: "li-2", description: "Implementation Services", quantity: 40, unitPrice: 500, taxRate: 15, total: 23000 },
            { id: "li-3", description: "Training Sessions", quantity: 5, unitPrice: 2000, taxRate: 15, total: 11500 },
        ],
        subtotal: 45000,
        taxAmount: 6750,
        total: 51750,
        currency: "SAR",
        reference: "PO-2026-0089",
        clearanceUuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        invoiceHash: "vNDZs5TkVkQ0r8hGsxbhP7GqVns6TJyYz",
        qrCode: "base64encodedqrcode",
        submittedAt: new Date("2026-01-23T14:15:00"),
        validationLog: [
            { id: "v1", step: "Schema Validation", status: "success", timestamp: new Date("2026-01-23T14:15:01") },
            { id: "v2", step: "Digital Signature", status: "success", timestamp: new Date("2026-01-23T14:15:02") },
            { id: "v3", step: "ZATCA Submission", status: "success", timestamp: new Date("2026-01-23T14:15:05") },
            { id: "v4", step: "Clearance Received", status: "success", timestamp: new Date("2026-01-23T14:15:07") },
        ],
    },
    {
        id: "inv-002",
        invoiceNumber: "INV-2026-001246",
        customer: mockCustomers[1],
        issueDate: new Date("2026-01-22"),
        dueDate: new Date("2026-02-21"),
        status: "cleared",
        lineItems: [
            { id: "li-4", description: "API Integration Package", quantity: 1, unitPrice: 25000, taxRate: 15, total: 28750 },
            { id: "li-5", description: "Monthly Support", quantity: 12, unitPrice: 1500, taxRate: 15, total: 20700 },
        ],
        subtotal: 43000,
        taxAmount: 6450,
        total: 49450,
        currency: "SAR",
        clearanceUuid: "4gb96g75-6828-5673-c4gd-3d074g77bgb7",
        invoiceHash: "xMEAt6UlWlR1s9iHtyciq8HrWot7UKzZa",
        submittedAt: new Date("2026-01-22T16:30:00"),
        validationLog: [
            { id: "v5", step: "Schema Validation", status: "success", timestamp: new Date("2026-01-22T16:30:01") },
            { id: "v6", step: "Digital Signature", status: "success", timestamp: new Date("2026-01-22T16:30:02") },
            { id: "v7", step: "ZATCA Submission", status: "success", timestamp: new Date("2026-01-22T16:30:04") },
            { id: "v8", step: "Clearance Received", status: "success", timestamp: new Date("2026-01-22T16:30:06") },
        ],
    },
    {
        id: "inv-003",
        invoiceNumber: "INV-2026-001245",
        customer: mockCustomers[2],
        issueDate: new Date("2026-01-21"),
        dueDate: new Date("2026-02-20"),
        status: "pending",
        lineItems: [
            { id: "li-6", description: "Consulting Services", quantity: 20, unitPrice: 800, taxRate: 15, total: 18400 },
        ],
        subtotal: 16000,
        taxAmount: 2400,
        total: 18400,
        currency: "SAR",
        submittedAt: new Date("2026-01-21T10:00:00"),
        validationLog: [
            { id: "v9", step: "Schema Validation", status: "success", timestamp: new Date("2026-01-21T10:00:01") },
            { id: "v10", step: "Digital Signature", status: "success", timestamp: new Date("2026-01-21T10:00:02") },
            { id: "v11", step: "ZATCA Submission", status: "pending", timestamp: new Date("2026-01-21T10:00:03") },
        ],
    },
    {
        id: "inv-004",
        invoiceNumber: "INV-2026-001244",
        customer: mockCustomers[3],
        issueDate: new Date("2026-01-20"),
        dueDate: new Date("2026-02-19"),
        status: "cleared",
        lineItems: [
            { id: "li-7", description: "Data Migration", quantity: 1, unitPrice: 35000, taxRate: 15, total: 40250 },
            { id: "li-8", description: "System Configuration", quantity: 1, unitPrice: 12000, taxRate: 15, total: 13800 },
        ],
        subtotal: 47000,
        taxAmount: 7050,
        total: 54050,
        currency: "SAR",
        reference: "PO-2026-0075",
        clearanceUuid: "5hc07h86-7939-6784-d5he-4e185h88chc8",
        invoiceHash: "yNFBu7VmXmS2t0jIuzdjs9IsXpu8VLaAb",
        submittedAt: new Date("2026-01-20T09:15:00"),
        validationLog: [
            { id: "v12", step: "Schema Validation", status: "success", timestamp: new Date("2026-01-20T09:15:01") },
            { id: "v13", step: "Digital Signature", status: "success", timestamp: new Date("2026-01-20T09:15:02") },
            { id: "v14", step: "ZATCA Submission", status: "success", timestamp: new Date("2026-01-20T09:15:04") },
            { id: "v15", step: "Clearance Received", status: "success", timestamp: new Date("2026-01-20T09:15:06") },
        ],
    },
    {
        id: "inv-005",
        invoiceNumber: "INV-2026-001243",
        customer: mockCustomers[4],
        issueDate: new Date("2026-01-19"),
        dueDate: new Date("2026-02-18"),
        status: "failed",
        lineItems: [
            { id: "li-9", description: "Hardware Procurement", quantity: 10, unitPrice: 5000, taxRate: 15, total: 57500 },
        ],
        subtotal: 50000,
        taxAmount: 7500,
        total: 57500,
        currency: "SAR",
        submittedAt: new Date("2026-01-19T14:00:00"),
        validationLog: [
            { id: "v16", step: "Schema Validation", status: "success", timestamp: new Date("2026-01-19T14:00:01") },
            { id: "v17", step: "Digital Signature", status: "error", timestamp: new Date("2026-01-19T14:00:02"), message: "Certificate expired" },
        ],
    },
    {
        id: "inv-006",
        invoiceNumber: "INV-2026-001242",
        customer: mockCustomers[0],
        issueDate: new Date("2026-01-18"),
        dueDate: new Date("2026-02-17"),
        status: "rejected",
        lineItems: [
            { id: "li-10", description: "Monthly Maintenance", quantity: 1, unitPrice: 8000, taxRate: 15, total: 9200 },
        ],
        subtotal: 8000,
        taxAmount: 1200,
        total: 9200,
        currency: "SAR",
        submittedAt: new Date("2026-01-18T11:30:00"),
        validationLog: [
            { id: "v18", step: "Schema Validation", status: "success", timestamp: new Date("2026-01-18T11:30:01") },
            { id: "v19", step: "Digital Signature", status: "success", timestamp: new Date("2026-01-18T11:30:02") },
            { id: "v20", step: "ZATCA Submission", status: "success", timestamp: new Date("2026-01-18T11:30:04") },
            { id: "v21", step: "Clearance Rejected", status: "error", timestamp: new Date("2026-01-18T11:30:10"), message: "Invalid VAT calculation" },
        ],
    },
    {
        id: "inv-007",
        invoiceNumber: "INV-2026-001241",
        customer: mockCustomers[1],
        issueDate: new Date("2026-01-17"),
        dueDate: new Date("2026-02-16"),
        status: "cleared",
        lineItems: [
            { id: "li-11", description: "Cloud Hosting - Q1", quantity: 1, unitPrice: 45000, taxRate: 15, total: 51750 },
        ],
        subtotal: 45000,
        taxAmount: 6750,
        total: 51750,
        currency: "SAR",
        reference: "PO-2026-0068",
        clearanceUuid: "6id18i97-8040-7895-e6if-5f296i99did9",
        invoiceHash: "zOGCv8WnYnT3u1kJvaekk0JtYqv9WMbBc",
        submittedAt: new Date("2026-01-17T08:45:00"),
        validationLog: [
            { id: "v22", step: "Schema Validation", status: "success", timestamp: new Date("2026-01-17T08:45:01") },
            { id: "v23", step: "Digital Signature", status: "success", timestamp: new Date("2026-01-17T08:45:02") },
            { id: "v24", step: "ZATCA Submission", status: "success", timestamp: new Date("2026-01-17T08:45:04") },
            { id: "v25", step: "Clearance Received", status: "success", timestamp: new Date("2026-01-17T08:45:06") },
        ],
    },
    {
        id: "inv-008",
        invoiceNumber: "INV-2026-001240",
        customer: mockCustomers[2],
        issueDate: new Date("2026-01-16"),
        dueDate: new Date("2026-02-15"),
        status: "cleared",
        lineItems: [
            { id: "li-12", description: "Security Audit", quantity: 1, unitPrice: 22000, taxRate: 15, total: 25300 },
            { id: "li-13", description: "Penetration Testing", quantity: 1, unitPrice: 18000, taxRate: 15, total: 20700 },
        ],
        subtotal: 40000,
        taxAmount: 6000,
        total: 46000,
        currency: "SAR",
        clearanceUuid: "7je29j08-9151-8906-f7jg-6g307j00eje0",
        invoiceHash: "aPHDw9XoZoU4v2lKwbfll1KuZrw0XNcCd",
        submittedAt: new Date("2026-01-16T15:20:00"),
        validationLog: [
            { id: "v26", step: "Schema Validation", status: "success", timestamp: new Date("2026-01-16T15:20:01") },
            { id: "v27", step: "Digital Signature", status: "success", timestamp: new Date("2026-01-16T15:20:02") },
            { id: "v28", step: "ZATCA Submission", status: "success", timestamp: new Date("2026-01-16T15:20:04") },
            { id: "v29", step: "Clearance Received", status: "success", timestamp: new Date("2026-01-16T15:20:06") },
        ],
    },
];

// Helper function to get invoice by ID
export function getInvoiceById(id: string): Invoice | undefined {
    return mockInvoices.find(inv => inv.id === id);
}

// Helper function to filter invoices
export function filterInvoices(
    search?: string,
    status?: InvoiceStatus | "all",
    startDate?: Date,
    endDate?: Date
): Invoice[] {
    return mockInvoices.filter(inv => {
        if (search) {
            const term = search.toLowerCase();
            const matchNumber = inv.invoiceNumber.toLowerCase().includes(term);
            const matchCustomer = inv.customer.name.toLowerCase().includes(term);
            if (!matchNumber && !matchCustomer) return false;
        }
        if (status && status !== "all" && inv.status !== status) return false;
        if (startDate && inv.issueDate < startDate) return false;
        if (endDate && inv.issueDate > endDate) return false;
        return true;
    });
}
