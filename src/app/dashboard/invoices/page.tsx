"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { mockInvoices, type InvoiceStatus } from "@/lib/mockData/invoices";
import { useInvoiceList } from "@/lib/hooks/useApi";
import { Loader2 } from "lucide-react";

export default function InvoicesPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<InvoiceStatus | "all">("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(0);
    const limit = 20;

    // Fetch from real API
    const { data: apiData, loading, error, refetch } = useInvoiceList({
        skip: page * limit,
        limit,
        status: status === "all" ? undefined : status.toUpperCase(),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
    });

    // Transform API data to match frontend format, fallback to mock data
    const [invoices, setInvoices] = useState(mockInvoices);
    const [totalCount, setTotalCount] = useState(mockInvoices.length);
    const [isUsingApi, setIsUsingApi] = useState(false);

    useEffect(() => {
        if (apiData && apiData.invoices) {
            // Transform API response to frontend format matching Invoice interface
            const transformedInvoices = apiData.invoices.map((inv) => ({
                id: inv.uuid,
                invoiceNumber: inv.invoice_number,
                customer: {
                    id: "api-customer",
                    name: "Customer", // Not in API response yet
                    vatNumber: "", // Not in API response yet
                    address: "",
                    city: "",
                    country: "Saudi Arabia",
                    type: "B2B" as const,
                },
                issueDate: new Date(inv.created_at),
                dueDate: new Date(inv.created_at),
                status: inv.status.toLowerCase() as InvoiceStatus,
                lineItems: [],
                subtotal: 0,
                taxAmount: 0,
                total: 0,
                currency: "SAR",
                clearanceUuid: inv.uuid,
                invoiceHash: inv.hash,
                validationLog: [],
            }));
            setInvoices(transformedInvoices.length > 0 ? transformedInvoices : mockInvoices);
            setTotalCount(apiData.total);
            setIsUsingApi(true);
        }
    }, [apiData]);

    // Filter client-side if using mock data
    const filteredInvoices = isUsingApi
        ? invoices
        : invoices.filter((invoice) => {
            // Search filter
            if (search) {
                const searchLower = search.toLowerCase();
                if (
                    !invoice.invoiceNumber.toLowerCase().includes(searchLower) &&
                    !invoice.customer.name.toLowerCase().includes(searchLower)
                ) {
                    return false;
                }
            }
            // Status filter
            if (status !== "all" && invoice.status !== status) {
                return false;
            }
            // Date filters
            if (startDate && invoice.issueDate < new Date(startDate)) {
                return false;
            }
            if (endDate && invoice.issueDate > new Date(endDate)) {
                return false;
            }
            return true;
        });

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                {/* Page Header */}
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                            {totalCount} total
                        </span>
                        {isUsingApi && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-600 rounded-full">
                                Live
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage and track your tax invoices
                    </p>
                </div>

                {/* API Status */}
                {error && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 flex items-center justify-between">
                        <span>Using offline data: {error}</span>
                        <button
                            onClick={() => refetch()}
                            className="text-yellow-800 hover:underline font-medium"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Filters */}
                <InvoiceFilters
                    search={search}
                    onSearchChange={setSearch}
                    status={status}
                    onStatusChange={setStatus}
                    startDate={startDate}
                    onStartDateChange={setStartDate}
                    endDate={endDate}
                    onEndDateChange={setEndDate}
                />

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        <span className="ml-2 text-slate-600">Loading invoices...</span>
                    </div>
                )}

                {/* Table */}
                {!loading && <InvoiceTable invoices={filteredInvoices} />}

                {/* Pagination */}
                {isUsingApi && totalCount > limit && (
                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-600">
                            Page {page + 1} of {Math.ceil(totalCount / limit)}
                        </span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={(page + 1) * limit >= totalCount}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
