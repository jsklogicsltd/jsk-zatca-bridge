"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Upload,
    FileSpreadsheet,
    FileText,
    Download,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Eye,
    Send,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    uploadBatchFile,
    uploadPdfInvoice,
    getCSVTemplate,
    downloadCSVTemplate,
    type ParsedInvoice,
    type PDFInvoiceData,
    type BatchUploadResponse,
    type PDFUploadResponse,
} from "@/lib/api/upload";
import { signInvoice } from "@/lib/api/invoices";

type FileType = "excel" | "csv" | "pdf" | null;
type UploadStatus = "idle" | "uploading" | "parsing" | "ready" | "submitting" | "submitted" | "error";

interface ProcessingResult {
    type: "batch" | "pdf";
    invoices: ParsedInvoice[] | PDFInvoiceData[];
    errors: Array<{ row: number; message: string }>;
    warnings: string[];
    usedOCR?: boolean;
    confidence?: number;
}

// Helper function to translate technical errors to user-friendly messages
function translateError(errorMsg: string): string {
    const errorMappings: Record<string, string> = {
        "String should match pattern '^\\d{4}$'": "Building number must be exactly 4 digits",
        "String should match pattern '^\\d{5}$'": "Postal code must be exactly 5 digits",
        "String should match pattern '^\\d{15}$'": "VAT/TRN number must be exactly 15 digits",
        "field required": "A required field is missing",
        "value is not a valid email": "Invalid email address format",
        "value is not a valid integer": "Expected a whole number",
        "value is not a valid float": "Expected a number",
        "ensure this value is greater than 0": "Value must be greater than 0",
        "Invalid date format": "Date must be in YYYY-MM-DD format",
        "Network error": "Unable to connect to server. Please check your connection.",
    };

    // Check for exact matches first
    for (const [pattern, friendly] of Object.entries(errorMappings)) {
        if (errorMsg.includes(pattern)) {
            return friendly;
        }
    }

    // If error contains technical patterns, try to extract field name
    const fieldMatch = errorMsg.match(/loc.*?["']([^"']+)["']/);
    if (fieldMatch) {
        const fieldName = fieldMatch[1].replace(/_/g, " ");
        return `Invalid value for ${fieldName}`;
    }

    return errorMsg;
}

export default function BatchUploadPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<FileType>(null);
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [result, setResult] = useState<ProcessingResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
    const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0, results: [] as Array<{ success: boolean; message: string }> });

    const detectFileType = (filename: string): FileType => {
        const ext = filename.toLowerCase().split(".").pop();
        if (ext === "xlsx" || ext === "xls") return "excel";
        if (ext === "csv") return "csv";
        if (ext === "pdf") return "pdf";
        return null;
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = async (file: File) => {
        const type = detectFileType(file.name);

        if (!type) {
            setError("Unsupported file type. Please upload .xlsx, .xls, .csv, or .pdf files.");
            return;
        }

        setUploadedFile(file);
        setFileType(type);
        setStatus("uploading");
        setError(null);
        setResult(null);
        setSelectedInvoice(null);

        try {
            if (type === "pdf") {
                // PDF upload
                setStatus("parsing");
                const response = await uploadPdfInvoice(file);

                if (!response.success || !response.data) {
                    setError(response.error?.detail || "Failed to parse PDF");
                    setStatus("error");
                    return;
                }

                const pdfResult = response.data as PDFUploadResponse;

                if (!pdfResult.success || !pdfResult.invoice) {
                    setError(pdfResult.error || "Failed to extract invoice data from PDF");
                    setStatus("error");
                    return;
                }

                setResult({
                    type: "pdf",
                    invoices: [pdfResult.invoice],
                    errors: [],
                    warnings: pdfResult.warnings,
                    usedOCR: pdfResult.used_ocr,
                    confidence: pdfResult.confidence,
                });
                setStatus("ready");
            } else {
                // Excel/CSV upload
                setStatus("parsing");
                const response = await uploadBatchFile(file);

                if (!response.success || !response.data) {
                    setError(response.error?.detail || "Failed to parse file");
                    setStatus("error");
                    return;
                }

                const batchResult = response.data as BatchUploadResponse;

                setResult({
                    type: "batch",
                    invoices: batchResult.invoices,
                    errors: batchResult.errors,
                    warnings: batchResult.warnings,
                });
                setStatus("ready");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setStatus("error");
        }
    };

    const handleDownloadTemplate = async () => {
        const response = await getCSVTemplate();
        if (response.success && response.data) {
            downloadCSVTemplate(response.data.template, response.data.filename);
        }
    };

    const resetUpload = () => {
        setUploadedFile(null);
        setFileType(null);
        setStatus("idle");
        setResult(null);
        setError(null);
        setSelectedInvoice(null);
        setSubmitProgress({ current: 0, total: 0, results: [] });
    };

    const handleSubmitToZatca = async () => {
        if (!result || result.invoices.length === 0) return;

        setStatus("submitting");
        const invoices = result.invoices;
        const total = invoices.length;
        const results: Array<{ success: boolean; message: string }> = [];

        setSubmitProgress({ current: 0, total, results: [] });

        for (let i = 0; i < invoices.length; i++) {
            const invoice = invoices[i];
            const isPDF = result.type === "pdf";

            try {
                // Prepare invoice data for signing
                const inv = invoice as ParsedInvoice & PDFInvoiceData;
                const lineItems = inv.line_items || [];
                const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
                const vatAmount = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price * (item.tax_rate / 100), 0);
                const issueDate = isPDF ? (inv as PDFInvoiceData).invoice_date || new Date().toISOString().split("T")[0] : (inv as ParsedInvoice).issue_date;

                const invoiceData = {
                    invoice_type: ((inv as ParsedInvoice).invoice_type === "Simplified" ? "Simplified" : "Tax") as "Tax" | "Simplified",
                    invoice_number: `INV-BATCH-${Date.now()}-${i + 1}`,
                    issue_date: issueDate,
                    supplier: {
                        trn: "300000000000003",
                        name: "JSK Logics",
                        street: "King Fahd Road",
                        building_number: "1234",
                        city: "Riyadh",
                        district: "Central",
                        postal_code: "12345",
                        country_code: "SA"
                    },
                    customer: {
                        trn: inv.customer?.vat || "",
                        name: inv.customer?.name || "Unknown Customer",
                        street: inv.customer?.address || "Unknown Street",
                        building_number: "0001",
                        city: (inv.customer as any)?.city || "Riyadh",
                        district: "Central",
                        postal_code: "12345",
                        country_code: "SA"
                    },
                    line_items: lineItems.map((item) => ({
                        name: item.description,
                        quantity: item.quantity,
                        price: item.unit_price,
                        vat_rate: item.tax_rate,
                        tax_code: item.tax_rate > 0 ? "S" : "Z"
                    })),
                    currency_code: "SAR",
                    total_excluding_vat: subtotal,
                    total_vat: vatAmount,
                    total_including_vat: subtotal + vatAmount
                };

                // Sign the invoice
                const signResponse = await signInvoice(invoiceData);

                if (signResponse.success) {
                    results.push({
                        success: true,
                        message: `Invoice ${i + 1} signed successfully`
                    });
                } else {
                    // Handle error message - could be string or object
                    let errorMsg = "Failed to sign invoice";
                    const detail: unknown = signResponse.error?.detail;
                    const errObj = signResponse.error as { message?: string } | null;
                    if (detail) {
                        if (typeof detail === "string") {
                            errorMsg = translateError(detail);
                        } else if (Array.isArray(detail)) {
                            errorMsg = detail.map((e: any) => {
                                const msg = e.msg || e.message || JSON.stringify(e);
                                return translateError(msg);
                            }).join(", ");
                        } else {
                            errorMsg = translateError(JSON.stringify(detail));
                        }
                    } else if (errObj?.message) {
                        errorMsg = translateError(errObj.message);
                    }
                    results.push({
                        success: false,
                        message: `Invoice ${i + 1}: ${errorMsg}`
                    });
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : (typeof err === "string" ? err : "Unknown error");
                results.push({
                    success: false,
                    message: `Invoice ${i + 1}: ${errorMsg}`
                });
            }

            setSubmitProgress({ current: i + 1, total, results: [...results] });
        }

        setStatus("submitted");
    };

    const successCount = result?.invoices.length || 0;
    const errorCount = result?.errors.length || 0;
    const warningCount = result?.warnings.length || 0;

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto space-y-6"
            >
                {/* Header */}
                <Link
                    href="/dashboard/invoices"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600"
                >
                    <ArrowLeft size={16} />
                    Back to Invoices
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Batch Upload</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Upload multiple invoices using Excel, CSV, or import data from PDF invoices
                    </p>
                </div>

                {/* Upload Zone */}
                {status === "idle" && (
                    <Card className="border-slate-200">
                        <CardContent className="pt-6">
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-12 text-center transition-all",
                                    isDragging
                                        ? "border-amber-500 bg-amber-50"
                                        : "border-slate-300 hover:border-slate-400 bg-slate-50"
                                )}
                            >
                                <div className="flex justify-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                                        <FileSpreadsheet size={28} className="text-green-600" />
                                    </div>
                                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                        <FileText size={28} className="text-blue-600" />
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    Drag & drop your file here
                                </h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    Supports Excel (.xlsx, .xls), CSV, and PDF files
                                </p>

                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload">
                                    <Button asChild className="cursor-pointer">
                                        <span>
                                            <Upload size={16} className="mr-2" />
                                            Choose File
                                        </span>
                                    </Button>
                                </label>
                            </div>

                            {/* File Format Info */}
                            <details className="mt-4 text-sm">
                                <summary className="cursor-pointer text-amber-600 hover:text-amber-700 font-medium">
                                    View file format requirements
                                </summary>
                                <div className="mt-3 p-4 bg-slate-50 rounded-lg">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="font-medium mb-2">Excel/CSV Columns:</p>
                                            <ul className="list-disc list-inside text-slate-600 space-y-1 text-xs">
                                                <li>customer_name (required)</li>
                                                <li>customer_vat (required)</li>
                                                <li>issue_date (required, YYYY-MM-DD)</li>
                                                <li>due_date (optional)</li>
                                                <li>item_description (required)</li>
                                                <li>quantity (required)</li>
                                                <li>unit_price (required)</li>
                                                <li>tax_rate (optional, default 15)</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-medium mb-2">PDF Import:</p>
                                            <ul className="list-disc list-inside text-slate-600 space-y-1 text-xs">
                                                <li>Auto-extracts invoice data</li>
                                                <li>Supports text-based PDFs</li>
                                                <li>OCR for scanned documents</li>
                                                <li>Review extracted data before submit</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </details>

                            {/* Sample Template Download */}
                            <div className="mt-4">
                                <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadTemplate}>
                                    <Download size={14} />
                                    Download Sample Template
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {(status === "uploading" || status === "parsing") && (
                    <Card className="border-slate-200">
                        <CardContent className="py-12">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
                                <div className="text-center">
                                    <p className="font-medium text-slate-900">
                                        {status === "uploading" ? "Uploading file..." : "Parsing invoice data..."}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">{uploadedFile?.name}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Error State */}
                {status === "error" && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="py-6">
                            <div className="flex items-start gap-4">
                                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="font-medium text-red-900">Upload Failed</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                    <Button variant="outline" size="sm" className="mt-4" onClick={resetUpload}>
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {(status === "ready" || status === "submitting" || status === "submitted") && result && (
                    <>
                        {/* Summary */}
                        <Card className="border-slate-200">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span>
                                            {result.type === "pdf" ? "PDF Parsed Successfully" : "File Processed"}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 text-sm font-normal">
                                        <span className="flex items-center gap-1 text-green-600">
                                            <CheckCircle size={14} /> {successCount} invoice
                                            {successCount !== 1 ? "s" : ""}
                                        </span>
                                        {warningCount > 0 && (
                                            <span className="flex items-center gap-1 text-amber-600">
                                                <AlertCircle size={14} /> {warningCount} warning
                                                {warningCount !== 1 ? "s" : ""}
                                            </span>
                                        )}
                                        {errorCount > 0 && (
                                            <span className="flex items-center gap-1 text-red-600">
                                                <XCircle size={14} /> {errorCount} error{errorCount !== 1 ? "s" : ""}
                                            </span>
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* PDF specific info */}
                                {result.type === "pdf" && (
                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-blue-700">Extraction Confidence:</span>
                                            <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600"
                                                    style={{ width: `${(result.confidence || 0) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-blue-700">
                                                {Math.round((result.confidence || 0) * 100)}%
                                            </span>
                                        </div>
                                        {result.usedOCR && (
                                            <p className="mt-2 text-blue-600">
                                                <AlertCircle size={14} className="inline mr-1" />
                                                OCR was used for text extraction (scanned document)
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Warnings */}
                                {result.warnings.length > 0 && (
                                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="font-medium text-amber-800 mb-1">Warnings:</p>
                                        <ul className="text-sm text-amber-700 list-disc list-inside">
                                            {result.warnings.map((warning, i) => (
                                                <li key={i}>{warning}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Errors */}
                                {result.errors.length > 0 && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="font-medium text-red-800 mb-1">Errors:</p>
                                        <ul className="text-sm text-red-700 list-disc list-inside">
                                            {result.errors.map((err, i) => (
                                                <li key={i}>
                                                    Row {err.row}: {err.message}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={resetUpload}>
                                        Upload Different File
                                    </Button>
                                    {successCount > 0 && status !== "submitted" && (
                                        <Button
                                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                                            onClick={handleSubmitToZatca}
                                            disabled={status === "submitting"}
                                        >
                                            {status === "submitting" ? (
                                                <>
                                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                                    Submitting {submitProgress.current}/{submitProgress.total}...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={16} className="mr-2" />
                                                    Submit {successCount} Invoice{successCount !== 1 ? "s" : ""} to ZATCA
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>

                                {/* Submission Results */}
                                {status === "submitted" && submitProgress.results.length > 0 && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                        <h4 className="font-medium text-slate-900 mb-3">Submission Results:</h4>
                                        <ul className="space-y-2">
                                            {submitProgress.results.map((r, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm">
                                                    {r.success ? (
                                                        <CheckCircle size={14} className="text-green-500" />
                                                    ) : (
                                                        <XCircle size={14} className="text-red-500" />
                                                    )}
                                                    <span className={r.success ? "text-green-700" : "text-red-700"}>
                                                        {r.message}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3">
                                            <Button variant="outline" size="sm" onClick={resetUpload}>
                                                Upload More Invoices
                                            </Button>
                                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
                                                <Link href="/dashboard/invoices">
                                                    View All Invoices
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Invoices List */}
                        <Card className="border-slate-200">
                            <CardHeader>
                                <CardTitle>Parsed Invoices - Review Before Submission</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b border-slate-200">
                                            <tr className="text-slate-500">
                                                <th className="text-left py-3 font-medium">#</th>
                                                <th className="text-left py-3 font-medium">Customer</th>
                                                <th className="text-left py-3 font-medium">VAT Number</th>
                                                <th className="text-left py-3 font-medium">Date</th>
                                                <th className="text-right py-3 font-medium">Items</th>
                                                <th className="text-right py-3 font-medium">Total</th>
                                                <th className="text-center py-3 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {result.invoices.map((invoice, index) => {
                                                const isPDF = result.type === "pdf";
                                                const inv = invoice as ParsedInvoice & PDFInvoiceData;
                                                const customer = inv.customer;
                                                const date = isPDF ? (inv as PDFInvoiceData).invoice_date : (inv as ParsedInvoice).issue_date;
                                                const lineItems = inv.line_items || [];
                                                const total = isPDF
                                                    ? (inv as PDFInvoiceData).total ||
                                                    lineItems.reduce(
                                                        (sum, item) =>
                                                            sum + item.quantity * item.unit_price * (1 + item.tax_rate / 100),
                                                        0
                                                    )
                                                    : lineItems.reduce(
                                                        (sum, item) =>
                                                            sum + item.quantity * item.unit_price * (1 + item.tax_rate / 100),
                                                        0
                                                    );

                                                return (
                                                    <tr key={index} className="hover:bg-slate-50">
                                                        <td className="py-3 text-slate-500">{index + 1}</td>
                                                        <td className="py-3 font-medium">{customer?.name || "Unknown"}</td>
                                                        <td className="py-3 font-mono text-xs">
                                                            {customer?.vat || "Not provided"}
                                                        </td>
                                                        <td className="py-3">{date || "N/A"}</td>
                                                        <td className="py-3 text-right">{lineItems.length}</td>
                                                        <td className="py-3 text-right font-medium">
                                                            SAR {total.toFixed(2)}
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setSelectedInvoice(selectedInvoice === index ? null : index)
                                                                }
                                                            >
                                                                <Eye size={14} className="mr-1" />
                                                                {selectedInvoice === index ? "Hide" : "View"}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selected Invoice Details */}
                        {selectedInvoice !== null && result.invoices[selectedInvoice] && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="border-amber-200 bg-amber-50/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Invoice Details #{selectedInvoice + 1}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {(() => {
                                            const inv = result.invoices[selectedInvoice] as ParsedInvoice & PDFInvoiceData;
                                            return (
                                                <div className="space-y-4">
                                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-slate-500">Customer:</span>
                                                            <span className="ml-2 font-medium">{inv.customer?.name}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">VAT Number:</span>
                                                            <span className="ml-2 font-mono">{inv.customer?.vat}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">Date:</span>
                                                            <span className="ml-2">
                                                                {(inv as PDFInvoiceData).invoice_date || (inv as ParsedInvoice).issue_date}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">Due Date:</span>
                                                            <span className="ml-2">{inv.due_date || "Not specified"}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <h4 className="font-medium mb-2">Line Items:</h4>
                                                        <table className="w-full text-sm border border-slate-200 rounded">
                                                            <thead className="bg-slate-100">
                                                                <tr>
                                                                    <th className="text-left p-2">Description</th>
                                                                    <th className="text-right p-2">Qty</th>
                                                                    <th className="text-right p-2">Price</th>
                                                                    <th className="text-right p-2">Tax</th>
                                                                    <th className="text-right p-2">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {inv.line_items?.map((item, i) => (
                                                                    <tr key={i} className="border-t border-slate-200">
                                                                        <td className="p-2">{item.description}</td>
                                                                        <td className="p-2 text-right">{item.quantity}</td>
                                                                        <td className="p-2 text-right">
                                                                            {item.unit_price.toFixed(2)}
                                                                        </td>
                                                                        <td className="p-2 text-right">{item.tax_rate}%</td>
                                                                        <td className="p-2 text-right font-medium">
                                                                            {(
                                                                                item.quantity *
                                                                                item.unit_price *
                                                                                (1 + item.tax_rate / 100)
                                                                            ).toFixed(2)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
