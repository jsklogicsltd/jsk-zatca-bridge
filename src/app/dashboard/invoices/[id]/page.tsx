"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Download,
    FileText,
    Mail,
    Printer,
    RotateCcw,
    Building2,
    ChevronDown,
    ChevronUp,
    Code,
    Loader2,
    Send,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatusBadge } from "@/components/invoices/StatusBadge";
import { ComplianceCard } from "@/components/invoices/ComplianceCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getInvoiceById as getMockInvoiceById } from "@/lib/mockData/invoices";
import { DEMO_MODE } from "@/lib/api/client";
import { submitToZatca, type ZatcaSubmissionResult } from "@/lib/api";
import { cn } from "@/lib/utils";

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface APIInvoice {
    id: number;
    uuid: string;
    invoice_number: string;
    status: string;
    hash: string | null;
    previous_hash: string | null;
    xml_content: string | null;
    qr_code: string | null;
    zatca_response: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("en-SA", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [invoice, setInvoice] = useState<APIInvoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddress, setShowAddress] = useState(false);
    const [zatcaLog, setZatcaLog] = useState<ZatcaSubmissionResult | null>(null);
    const [isResubmitting, setIsResubmitting] = useState(false);
    const [resubmitError, setResubmitError] = useState<string | null>(null);
    const [showZatcaRaw, setShowZatcaRaw] = useState(false);

    // Try to get mock invoice for display fallback
    const mockInvoice = getMockInvoiceById(id);

    useEffect(() => {
        async function fetchInvoice() {
            setLoading(true);
            // Demo mode: skip the (unreachable) backend and render directly
            // from the rich mock invoice resolved by id.
            if (DEMO_MODE) {
                setInvoice(null);
                setLoading(false);
                return;
            }
            try {
                // Try fetching by UUID first, then by ID
                const response = await fetch(`${API_BASE}/invoices/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setInvoice(data);
                } else {
                    // If not found by path param, could be mock data ID
                    setInvoice(null);
                }
            } catch (err) {
                setError("Failed to fetch invoice");
            } finally {
                setLoading(false);
            }
        }
        fetchInvoice();
    }, [id]);

    useEffect(() => {
        if (invoice?.zatca_response && typeof invoice.zatca_response === "object") {
            setZatcaLog(invoice.zatca_response as ZatcaSubmissionResult);
        }
    }, [invoice]);

    const handleResubmit = async () => {
        if (!invoice) {
            setResubmitError(
                "Resubmission requires a live invoice from the backend (DEMO_MODE is on)."
            );
            return;
        }
        setIsResubmitting(true);
        setResubmitError(null);
        try {
            const action = invoice.status === "REPORTED" ? "report" : "clear";
            const payload = (invoice as unknown as { invoice_payload?: never }).invoice_payload;
            if (!payload) {
                setResubmitError(
                    "Original invoice payload not stored on this record — resubmit from the create-invoice wizard."
                );
                setIsResubmitting(false);
                return;
            }
            const resp = await submitToZatca(payload, action);
            if (resp.success && resp.data) {
                setZatcaLog(resp.data);
            } else {
                setResubmitError(resp.error?.detail || "Resubmission failed");
            }
        } catch (err) {
            setResubmitError(err instanceof Error ? err.message : "Network error");
        } finally {
            setIsResubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    <span className="ml-2 text-slate-600">Loading invoice...</span>
                </div>
            </DashboardLayout>
        );
    }

    // Use API invoice if found, otherwise fallback to mock
    const displayInvoice = invoice || mockInvoice;

    if (!displayInvoice) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-slate-900">Invoice not found</h2>
                    <p className="text-slate-500 mt-2">The invoice you're looking for doesn't exist.</p>
                    <Link href="/dashboard/invoices">
                        <Button className="mt-4">Back to Invoices</Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    // Normalize data whether from API or mock
    const isAPIInvoice = invoice !== null;
    const invoiceNumber = isAPIInvoice ? invoice.invoice_number : mockInvoice!.invoiceNumber;
    const status = isAPIInvoice ? invoice.status.toLowerCase() : mockInvoice!.status;
    const issueDate = isAPIInvoice ? new Date(invoice.created_at) : mockInvoice!.issueDate;
    const dueDate = isAPIInvoice ? new Date(invoice.created_at) : mockInvoice!.dueDate;
    const customerName = isAPIInvoice ? "Customer" : mockInvoice!.customer.name;
    const customerVat = isAPIInvoice ? "N/A" : mockInvoice!.customer.vatNumber;
    const customerAddress = isAPIInvoice ? "Address not available" : mockInvoice!.customer.address;
    const customerCity = isAPIInvoice ? "" : mockInvoice!.customer.city;
    const customerCountry = isAPIInvoice ? "Saudi Arabia" : mockInvoice!.customer.country;
    const lineItems = isAPIInvoice ? [] : mockInvoice!.lineItems;
    const subtotal = isAPIInvoice ? 0 : mockInvoice!.subtotal;
    const taxAmount = isAPIInvoice ? 0 : mockInvoice!.taxAmount;
    const total = isAPIInvoice ? 0 : mockInvoice!.total;
    const currency = isAPIInvoice ? "SAR" : mockInvoice!.currency;
    const reference = isAPIInvoice ? null : mockInvoice!.reference;
    const clearanceUuid = isAPIInvoice ? invoice.uuid : mockInvoice!.clearanceUuid;
    const invoiceHash = isAPIInvoice ? invoice.hash : mockInvoice!.invoiceHash;
    const submittedAt = isAPIInvoice ? new Date(invoice.created_at) : mockInvoice!.submittedAt;
    const validationLog = isAPIInvoice ? [] : mockInvoice!.validationLog;

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                {/* Back Link */}
                <Link
                    href="/dashboard/invoices"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600"
                >
                    <ArrowLeft size={16} />
                    Back to Invoices
                </Link>

                {/* API Data Notice */}
                {isAPIInvoice && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                        Viewing live invoice data from API
                    </div>
                )}

                {/* Three Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] gap-6">

                    {/* Left Column - Invoice Header */}
                    <div className="space-y-4">
                        <Card className="border-slate-200">
                            <CardContent className="pt-6">
                                <h1 className="text-xl font-bold text-slate-900 mb-2">
                                    {invoiceNumber}
                                </h1>
                                <StatusBadge status={status} size="md" />

                                <div className="mt-6 space-y-3 text-sm">
                                    <div>
                                        <p className="text-slate-500">Issue Date</p>
                                        <p className="font-medium">{formatDate(issueDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Due Date</p>
                                        <p className="font-medium">{formatDate(dueDate)}</p>
                                    </div>
                                    {reference && (
                                        <div>
                                            <p className="text-slate-500">Reference</p>
                                            <p className="font-medium">{reference}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Card */}
                        <Card className="border-slate-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Building2 size={16} />
                                    Customer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="font-medium text-slate-900">{customerName}</p>
                                <p className="text-sm text-slate-600">VAT: {customerVat}</p>

                                <button
                                    onClick={() => setShowAddress(!showAddress)}
                                    className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
                                >
                                    {showAddress ? "Hide" : "Show"} Address
                                    {showAddress ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {showAddress && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="text-sm text-slate-600"
                                    >
                                        <p>{customerAddress}</p>
                                        <p>{customerCity}{customerCity && ", "}{customerCountry}</p>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <FileText size={16} /> Download PDF
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Download size={16} /> Download XML
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Mail size={16} /> Email to Customer
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Printer size={16} /> Print
                            </Button>
                            {(status === "failed" || status === "rejected") && (
                                <Button className="w-full justify-start gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                                    <RotateCcw size={16} /> Resubmit
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Center Column - Line Items */}
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle>Invoice Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lineItems.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-slate-200">
                                            <tr className="text-xs text-slate-500 uppercase">
                                                <th className="text-left py-3 font-medium">Description</th>
                                                <th className="text-right py-3 font-medium">Qty</th>
                                                <th className="text-right py-3 font-medium">Unit Price</th>
                                                <th className="text-right py-3 font-medium">Tax</th>
                                                <th className="text-right py-3 font-medium">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {lineItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="py-3 text-sm text-slate-900">{item.description}</td>
                                                    <td className="py-3 text-sm text-slate-600 text-right">{item.quantity}</td>
                                                    <td className="py-3 text-sm text-slate-600 text-right">
                                                        {formatCurrency(item.unitPrice, currency)}
                                                    </td>
                                                    <td className="py-3 text-sm text-slate-600 text-right">{item.taxRate}%</td>
                                                    <td className="py-3 text-sm font-medium text-slate-900 text-right">
                                                        {formatCurrency(item.total, currency)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <p>Line item details not available</p>
                                    <p className="text-sm mt-1">Invoice data from API doesn't include item breakdown</p>
                                </div>
                            )}

                            {/* Summary Box */}
                            <div className="mt-6 pt-4 border-t border-slate-200">
                                <div className="flex justify-end">
                                    <div className="w-64 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Subtotal</span>
                                            <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">VAT (15%)</span>
                                            <span className="font-medium">{formatCurrency(taxAmount, currency)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                                            <span>Total</span>
                                            <span className="text-amber-600">{formatCurrency(total, currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column - Compliance + ZATCA Submission Log */}
                    <div className="space-y-4">
                        <ComplianceCard
                            clearanceUuid={clearanceUuid ?? undefined}
                            invoiceHash={invoiceHash ?? undefined}
                            submittedAt={submittedAt}
                            validationLog={validationLog}
                        />

                        <Card className="border-slate-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Send size={16} />
                                    ZATCA Submission Log
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                {zatcaLog ? (
                                    <>
                                        <div>
                                            <p className="text-slate-500">Status</p>
                                            <span
                                                className={cn(
                                                    "inline-block mt-0.5 px-2 py-0.5 rounded font-mono text-[10px] font-semibold",
                                                    zatcaLog.status === "CLEARED" ||
                                                        zatcaLog.status === "REPORTED"
                                                        ? "bg-green-100 text-green-800"
                                                        : zatcaLog.status === "CREDENTIALS_MISSING"
                                                            ? "bg-amber-100 text-amber-800"
                                                            : "bg-red-100 text-red-800"
                                                )}
                                            >
                                                {zatcaLog.status || "UNKNOWN"}
                                            </span>
                                        </div>

                                        {zatcaLog.timestamp && (
                                            <div>
                                                <p className="text-slate-500">Timestamp (UTC)</p>
                                                <p className="font-mono text-slate-800 break-all">
                                                    {zatcaLog.timestamp}
                                                </p>
                                            </div>
                                        )}

                                        {(zatcaLog.attempted_url ||
                                            (zatcaLog.zatca_response as Record<string, unknown>)
                                                ?.would_be_url) && (
                                            <div>
                                                <p className="text-slate-500">URL called</p>
                                                <p className="font-mono text-slate-800 break-all">
                                                    {zatcaLog.attempted_url ||
                                                        String(
                                                            (zatcaLog.zatca_response as Record<string, unknown>)
                                                                ?.would_be_url
                                                        )}
                                                </p>
                                            </div>
                                        )}

                                        {zatcaLog.clearance_uuid && (
                                            <div>
                                                <p className="text-slate-500">Clearance UUID</p>
                                                <p className="font-mono text-slate-800 break-all">
                                                    {zatcaLog.clearance_uuid}
                                                </p>
                                            </div>
                                        )}

                                        {zatcaLog.request_id && (
                                            <div>
                                                <p className="text-slate-500">Request ID</p>
                                                <p className="font-mono text-slate-800 break-all">
                                                    {zatcaLog.request_id}
                                                </p>
                                            </div>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => setShowZatcaRaw(!showZatcaRaw)}
                                        >
                                            <Code size={12} className="mr-2" />
                                            {showZatcaRaw ? "Hide" : "Show"} Raw Response
                                        </Button>

                                        {showZatcaRaw && (
                                            <pre className="p-3 bg-slate-900 text-emerald-300 rounded overflow-x-auto text-[10px] max-h-56">
                                                {JSON.stringify(
                                                    zatcaLog.zatca_response ?? zatcaLog,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        )}

                                        {(status === "rejected" ||
                                            status === "pending" ||
                                            zatcaLog.status === "REJECTED" ||
                                            zatcaLog.status === "CREDENTIALS_MISSING") && (
                                            <Button
                                                onClick={handleResubmit}
                                                disabled={isResubmitting}
                                                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                                                size="sm"
                                            >
                                                {isResubmitting ? (
                                                    <>
                                                        <Loader2 size={12} className="mr-2 animate-spin" />
                                                        Resubmitting…
                                                    </>
                                                ) : (
                                                    <>
                                                        <RotateCcw size={12} className="mr-2" />
                                                        Resubmit to ZATCA
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {resubmitError && (
                                            <p className="text-red-600 text-[11px]">
                                                {resubmitError}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-slate-500">
                                        No ZATCA submission has been recorded for this invoice
                                        {DEMO_MODE && " (DEMO_MODE is on — only newly created invoices show real ZATCA submissions)"}
                                        .
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
