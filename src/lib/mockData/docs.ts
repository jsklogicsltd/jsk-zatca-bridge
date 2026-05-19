// Mock data for documentation and help center

export interface DocCategory {
    id: string;
    title: string;
    description: string;
    articleCount: number;
    icon: string;
}

export interface DocArticle {
    id: string;
    categoryId: string;
    title: string;
    description: string;
    content: string;
    lastUpdated: Date;
    readingTime: number;
}

export interface FAQItem {
    id: string;
    category: string;
    question: string;
    answer: string;
}

export interface APIEndpoint {
    id: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    title: string;
    description: string;
    category: string;
    parameters: { name: string; type: string; required: boolean; description: string }[];
    requestBody?: string;
    responseExample: string;
}

export interface VideoTutorial {
    id: string;
    title: string;
    description: string;
    duration: string;
    thumbnail: string;
    category: string;
    views: number;
}

export const docCategories: DocCategory[] = [
    { id: "getting-started", title: "Account Setup", description: "Creating account, company verification, CSID registration", articleCount: 10, icon: "UserPlus" },
    { id: "invoices", title: "Invoice Management", description: "Creating invoices, bulk uploads, status tracking", articleCount: 15, icon: "FileText" },
    { id: "compliance", title: "ZATCA Compliance", description: "UBL XML format, signature requirements, validation rules", articleCount: 12, icon: "ShieldCheck" },
    { id: "api", title: "API Reference", description: "Authentication, endpoints, webhooks, SDKs", articleCount: 20, icon: "Code" },
    { id: "integrations", title: "Integrations", description: "Tally, Quickbooks, SAP, custom ERPs", articleCount: 8, icon: "Puzzle" },
    { id: "reports", title: "Reports & Analytics", description: "VAT reports, custom reports, data export", articleCount: 6, icon: "BarChart2" },
    { id: "billing", title: "Billing", description: "Plans, payments, invoicing", articleCount: 5, icon: "CreditCard" },
    { id: "security", title: "Security", description: "2FA, API keys, data protection", articleCount: 7, icon: "Lock" },
];

export const docArticles: DocArticle[] = [
    {
        id: "create-account",
        categoryId: "getting-started",
        title: "Creating Your Account",
        description: "Step-by-step guide to setting up your ZATCA Bridge account",
        lastUpdated: new Date("2026-01-15"),
        readingTime: 5,
        content: `
# Creating Your Account

Welcome to ZATCA Bridge! This guide will walk you through creating your account and getting started with e-invoicing compliance.

## Prerequisites

Before you begin, make sure you have:

- A valid Saudi Commercial Registration
- Your VAT registration number
- Company contact information

## Step 1: Sign Up

Navigate to the [signup page](/auth/signup) and enter your details:

1. Enter your email address
2. Create a strong password
3. Provide your company name
4. Accept the terms of service

\`\`\`javascript
// Example API call for registration
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  body: JSON.stringify({
    email: 'your@email.com',
    password: 'securePassword123',
    companyName: 'Your Company Ltd'
  })
});
\`\`\`

> **Note:** Make sure to use a valid business email address for verification.

## Step 2: Verify Your Email

After signing up, check your inbox for a verification email. Click the link to verify your account.

> **Warning:** The verification link expires after 24 hours.

## Step 3: Complete Company Profile

Once verified, you'll be prompted to complete your company profile with VAT details.

## Next Steps

After account creation, proceed to [CSID Registration](/docs/getting-started/csid-registration) to obtain your cryptographic credentials.
    `,
    },
    {
        id: "csid-registration",
        categoryId: "getting-started",
        title: "CSID Registration",
        description: "How to obtain your Cryptographic Stamp Identifier from ZATCA",
        lastUpdated: new Date("2026-01-18"),
        readingTime: 8,
        content: `
# CSID Registration

Learn how to register for and manage your Cryptographic Stamp Identifier (CSID) with ZATCA.

## What is CSID?

The Cryptographic Stamp Identifier (CSID) is a digital certificate issued by ZATCA that allows you to cryptographically sign your e-invoices.

## Registration Process

1. Navigate to CSID Management in your dashboard
2. Click "Request New CSID"
3. Complete the OTP verification
4. Download your certificate

> **Important:** Keep your CSID certificate secure and never share it publicly.
    `,
    },
    {
        id: "first-invoice",
        categoryId: "invoices",
        title: "Creating Your First Invoice",
        description: "Simple guide to create and submit your first e-invoice",
        lastUpdated: new Date("2026-01-20"),
        readingTime: 6,
        content: `
# Creating Your First Invoice

This guide walks you through creating and submitting your first ZATCA-compliant e-invoice.

## Quick Steps

1. Go to Invoices → New Invoice
2. Select or add a customer
3. Add line items
4. Review and submit

\`\`\`json
{
  "invoiceNumber": "INV-2026-001",
  "customer": {
    "name": "Customer Corp",
    "vatNumber": "300123456789003"
  },
  "lineItems": [
    {
      "description": "Professional Services",
      "quantity": 1,
      "unitPrice": 10000,
      "taxRate": 15
    }
  ]
}
\`\`\`
    `,
    },
];

export const faqItems: FAQItem[] = [
    { id: "faq-1", category: "General", question: "What is ZATCA Bridge?", answer: "ZATCA Bridge is a complete e-invoicing solution that helps Saudi businesses comply with ZATCA's Fatoorah requirements. We handle invoice generation, validation, and submission to ZATCA on your behalf." },
    { id: "faq-2", category: "General", question: "Is ZATCA Bridge officially certified?", answer: "Yes, ZATCA Bridge is fully certified and compliant with all ZATCA e-invoicing requirements including Phase 2 integration." },
    { id: "faq-3", category: "Technical", question: "How do I generate a CSID?", answer: "Navigate to Dashboard → CSID Management → Request New CSID. You'll need to complete OTP verification to receive your certificate." },
    { id: "faq-4", category: "Technical", question: "What invoice formats are supported?", answer: "We support UBL 2.1 XML format as required by ZATCA, plus human-readable PDF generation for your records." },
    { id: "faq-5", category: "Technical", question: "Can I integrate with my existing ERP?", answer: "Yes! We offer REST APIs, webhooks, and pre-built integrations for popular systems like Tally, SAP, and QuickBooks." },
    { id: "faq-6", category: "Billing", question: "What are the pricing plans?", answer: "We offer Starter (SAR 299/mo), Professional (SAR 799/mo), and Enterprise (custom pricing) plans based on invoice volume." },
    { id: "faq-7", category: "Billing", question: "Is there a free trial?", answer: "Yes, we offer a 14-day free trial with full access to all features. No credit card required." },
    { id: "faq-8", category: "Compliance", question: "What happens if an invoice is rejected?", answer: "You'll receive a notification with the rejection reason. You can fix the issues and resubmit the invoice through our dashboard." },
    { id: "faq-9", category: "Compliance", question: "How long are invoices stored?", answer: "We securely store all invoices for 7 years as required by ZATCA regulations, with encrypted backups." },
    { id: "faq-10", category: "Compliance", question: "What is the QR code on invoices?", answer: "The QR code contains encoded invoice data including seller info, VAT details, and a digital signature for verification." },
];

export const apiEndpoints: APIEndpoint[] = [
    {
        id: "auth-token",
        method: "POST",
        path: "/api/v1/auth/token",
        title: "Get Access Token",
        description: "Authenticate and receive a JWT access token",
        category: "Authentication",
        parameters: [],
        requestBody: `{
  "api_key": "sk_live_xxxx",
  "api_secret": "your_secret"
}`,
        responseExample: `{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "token_type": "Bearer"
}`,
    },
    {
        id: "create-invoice",
        method: "POST",
        path: "/api/v1/invoices",
        title: "Create Invoice",
        description: "Create and submit a new invoice to ZATCA",
        category: "Invoices",
        parameters: [],
        requestBody: `{
  "invoice_number": "INV-2026-001",
  "issue_date": "2026-01-23",
  "customer": {
    "name": "Customer Corp",
    "vat_number": "300123456789003"
  },
  "line_items": [...]
}`,
        responseExample: `{
  "id": "inv_abc123",
  "status": "pending",
  "clearance_uuid": null
}`,
    },
    {
        id: "get-invoices",
        method: "GET",
        path: "/api/v1/invoices",
        title: "List Invoices",
        description: "Retrieve a paginated list of invoices",
        category: "Invoices",
        parameters: [
            { name: "page", type: "integer", required: false, description: "Page number (default: 1)" },
            { name: "limit", type: "integer", required: false, description: "Items per page (default: 20)" },
            { name: "status", type: "string", required: false, description: "Filter by status" },
        ],
        responseExample: `{
  "data": [...],
  "meta": { "total": 247, "page": 1 }
}`,
    },
    {
        id: "get-invoice",
        method: "GET",
        path: "/api/v1/invoices/{id}",
        title: "Get Invoice",
        description: "Retrieve a single invoice by ID",
        category: "Invoices",
        parameters: [
            { name: "id", type: "string", required: true, description: "Invoice ID" },
        ],
        responseExample: `{
  "id": "inv_abc123",
  "invoice_number": "INV-2026-001",
  "status": "cleared",
  "clearance_uuid": "3fa85f64-..."
}`,
    },
    {
        id: "delete-invoice",
        method: "DELETE",
        path: "/api/v1/invoices/{id}",
        title: "Delete Invoice",
        description: "Delete a draft invoice (cleared invoices cannot be deleted)",
        category: "Invoices",
        parameters: [
            { name: "id", type: "string", required: true, description: "Invoice ID" },
        ],
        responseExample: `{
  "success": true
}`,
    },
];

export const videoTutorials: VideoTutorial[] = [
    { id: "v1", title: "Getting Started with ZATCA Bridge", description: "Complete walkthrough of account setup", duration: "8:32", thumbnail: "/placeholder.jpg", category: "Getting Started", views: 12450 },
    { id: "v2", title: "Creating Your First Invoice", description: "Step-by-step invoice creation guide", duration: "5:15", thumbnail: "/placeholder.jpg", category: "Getting Started", views: 9800 },
    { id: "v3", title: "CSID Registration Explained", description: "Understanding cryptographic certificates", duration: "6:45", thumbnail: "/placeholder.jpg", category: "Getting Started", views: 7200 },
    { id: "v4", title: "API Integration Guide", description: "Connect your systems via REST API", duration: "12:20", thumbnail: "/placeholder.jpg", category: "Integration", views: 5600 },
    { id: "v5", title: "Tally Integration Setup", description: "Integrate with Tally ERP", duration: "10:45", thumbnail: "/placeholder.jpg", category: "Integration", views: 4300 },
];

export const systemStatus = {
    api: { status: "operational" as const, uptime: 99.98 },
    zatca: { status: "operational" as const, latency: 145 },
    dashboard: { status: "operational" as const },
};

// Helper for search
export function searchDocs(query: string): DocArticle[] {
    const lower = query.toLowerCase();
    return docArticles.filter(
        (a) =>
            a.title.toLowerCase().includes(lower) ||
            a.description.toLowerCase().includes(lower) ||
            a.content.toLowerCase().includes(lower)
    );
}
