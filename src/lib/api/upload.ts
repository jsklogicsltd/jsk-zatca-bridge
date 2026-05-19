/**
 * File Upload API Functions
 *
 * API client for batch Excel/CSV upload and PDF invoice parsing.
 */

import { apiClient, type ApiResponse, DEMO_MODE, demoDelay } from "./client";
import { resolveDemo } from "./demoData";

// Types
export interface LineItemData {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
}

export interface CustomerData {
    name: string;
    vat: string;
    address?: string;
    city?: string;
}

export interface ParsedInvoice {
    invoice_type: string;
    customer: CustomerData;
    issue_date: string;
    due_date?: string;
    reference?: string;
    line_items: LineItemData[];
}

export interface BatchUploadResponse {
    success: boolean;
    total_invoices: number;
    invoices: ParsedInvoice[];
    errors: Array<{ row: number; message: string }>;
    warnings: string[];
}

export interface PDFInvoiceData {
    invoice_number?: string;
    invoice_date?: string;
    due_date?: string;
    customer: CustomerData;
    subtotal?: number;
    vat_amount?: number;
    total?: number;
    line_items: LineItemData[];
    confidence: number;
    raw_text_preview?: string;
}

export interface PDFUploadResponse {
    success: boolean;
    invoice: PDFInvoiceData | null;
    error: string | null;
    warnings: string[];
    used_ocr: boolean;
    confidence: number;
}

export interface TemplateInfo {
    formats_supported: string[];
    required_columns: string[];
    optional_columns: string[];
    column_aliases: Record<string, string[]>;
    date_formats: string[];
    notes: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Upload Excel or CSV file for batch invoice processing.
 */
export async function uploadBatchFile(file: File): Promise<ApiResponse<BatchUploadResponse>> {
    if (DEMO_MODE) {
        await demoDelay(900);
        return {
            success: true,
            data: resolveDemo("POST", "/upload/batch") as BatchUploadResponse,
            error: null,
        };
    }
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE}/upload/batch`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                data: null,
                error: {
                    status: response.status,
                    detail: data.detail || "Upload failed",
                },
            };
        }

        return {
            success: true,
            data,
            error: null,
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            error: {
                status: 0,
                detail: error instanceof Error ? error.message : "Network error",
            },
        };
    }
}

/**
 * Upload PDF invoice for automatic data extraction.
 */
export async function uploadPdfInvoice(file: File): Promise<ApiResponse<PDFUploadResponse>> {
    if (DEMO_MODE) {
        await demoDelay(900);
        return {
            success: true,
            data: resolveDemo("POST", "/upload/pdf") as PDFUploadResponse,
            error: null,
        };
    }
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE}/upload/pdf`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                data: null,
                error: {
                    status: response.status,
                    detail: data.detail || "Upload failed",
                },
            };
        }

        return {
            success: true,
            data,
            error: null,
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            error: {
                status: 0,
                detail: error instanceof Error ? error.message : "Network error",
            },
        };
    }
}

/**
 * Get CSV template content.
 */
export async function getCSVTemplate(): Promise<ApiResponse<{ template: string; filename: string }>> {
    return apiClient.get<{ template: string; filename: string }>("/upload/template/csv");
}

/**
 * Get information about supported file formats and columns.
 */
export async function getTemplateInfo(): Promise<ApiResponse<TemplateInfo>> {
    return apiClient.get<TemplateInfo>("/upload/template/info");
}

/**
 * Download the CSV template as a file.
 */
export function downloadCSVTemplate(content: string, filename: string = "invoice_template.csv") {
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
