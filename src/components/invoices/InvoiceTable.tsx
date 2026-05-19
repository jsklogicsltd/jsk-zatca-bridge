"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MoreHorizontal, Eye, Download, FileText, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import type { Invoice } from "@/lib/mockData/invoices";

interface InvoiceTableProps {
    invoices: Invoice[];
    loading?: boolean;
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

function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            <td className="p-3"><div className="w-4 h-4 bg-slate-200 rounded" /></td>
            <td className="p-3"><div className="w-32 h-4 bg-slate-200 rounded" /></td>
            <td className="p-3"><div className="w-40 h-4 bg-slate-200 rounded" /></td>
            <td className="p-3"><div className="w-24 h-4 bg-slate-200 rounded" /></td>
            <td className="p-3"><div className="w-20 h-4 bg-slate-200 rounded" /></td>
            <td className="p-3"><div className="w-16 h-4 bg-slate-200 rounded" /></td>
            <td className="p-3"><div className="w-8 h-4 bg-slate-200 rounded" /></td>
        </tr>
    );
}

export function InvoiceTable({ invoices, loading }: InvoiceTableProps) {
    const [selected, setSelected] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const totalPages = Math.ceil(invoices.length / rowsPerPage);
    const startIndex = (page - 1) * rowsPerPage;
    const paginatedInvoices = invoices.slice(startIndex, startIndex + rowsPerPage);

    const toggleSelect = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selected.length === paginatedInvoices.length) {
            setSelected([]);
        } else {
            setSelected(paginatedInvoices.map((inv) => inv.id));
        }
    };

    if (loading) {
        return (
            <Card className="overflow-hidden border-slate-200">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase">Select</th>
                            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase">Invoice</th>
                            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonRow key={i} />
                        ))}
                    </tbody>
                </table>
            </Card>
        );
    }

    if (invoices.length === 0) {
        return (
            <Card className="border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No invoices found</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                    Get started by creating your first invoice
                </p>
                <Link href="/dashboard/invoices/new">
                    <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                        Create your first invoice
                    </Button>
                </Link>
            </Card>
        );
    }

    return (
        <Card className="border-slate-200">
            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-3 text-left">
                                <Checkbox
                                    checked={selected.length === paginatedInvoices.length && paginatedInvoices.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </th>
                            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice</th>
                            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="p-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="p-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedInvoices.map((invoice, index) => (
                            <motion.tr
                                key={invoice.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                className="hover:bg-slate-50 transition-colors"
                            >
                                <td className="p-3">
                                    <Checkbox
                                        checked={selected.includes(invoice.id)}
                                        onCheckedChange={() => toggleSelect(invoice.id)}
                                    />
                                </td>
                                <td className="p-3">
                                    <Link
                                        href={`/dashboard/invoices/${invoice.id}`}
                                        className="font-medium text-slate-900 hover:text-amber-600"
                                    >
                                        {invoice.invoiceNumber}
                                    </Link>
                                </td>
                                <td className="p-3 text-sm text-slate-600">{invoice.customer.name}</td>
                                <td className="p-3 text-sm text-slate-600">{formatDate(invoice.issueDate)}</td>
                                <td className="p-3 text-sm text-slate-900 font-medium text-right">
                                    {formatCurrency(invoice.total, invoice.currency)}
                                </td>
                                <td className="p-3">
                                    <StatusBadge status={invoice.status} />
                                </td>
                                <td className="p-3 relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setOpenMenuId(openMenuId === invoice.id ? null : invoice.id)}
                                    >
                                        <MoreHorizontal size={16} />
                                    </Button>

                                    {openMenuId === invoice.id && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                            <div className="absolute right-0 bottom-full mb-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                                                <Link
                                                    href={`/dashboard/invoices/${invoice.id}`}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                                    onClick={() => setOpenMenuId(null)}
                                                >
                                                    <Eye size={14} /> View
                                                </Link>
                                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                                    <Download size={14} /> Download XML
                                                </button>
                                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                                    <FileText size={14} /> Download PDF
                                                </button>
                                                {(invoice.status === "failed" || invoice.status === "rejected") && (
                                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                                        <RotateCcw size={14} /> Resubmit
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>Rows per page:</span>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setPage(1);
                        }}
                        className="h-8 px-2 rounded border border-slate-200 text-sm"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                        {startIndex + 1}-{Math.min(startIndex + rowsPerPage, invoices.length)} of {invoices.length}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
