"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Download, FileText, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { vatReportData, vatTransactions } from "@/lib/mockData/analytics";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-SA", {
        style: "currency",
        currency: "SAR",
        minimumFractionDigits: 2,
    }).format(amount);
}

function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const quarters = ["Q1 2026", "Q4 2025", "Q3 2025", "Q2 2025"];

export default function VATReportsPage() {
    const [period, setPeriod] = useState("Q1 2026");

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href="/dashboard/reports"
                            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600 mb-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Reports
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900">VAT Report</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Value Added Tax summary and details
                        </p>
                    </div>
                </div>

                {/* Period Selector */}
                <Card className="border-slate-200">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex gap-2">
                                <select
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    className="h-10 px-4 rounded-lg border border-slate-200 text-sm"
                                >
                                    {quarters.map((q) => (
                                        <option key={q} value={q}>{q}</option>
                                    ))}
                                </select>
                                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                                    Generate Report
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download size={14} />
                                    PDF
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download size={14} />
                                    Excel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* VAT Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card className="border-slate-200 p-4">
                        <p className="text-xs text-slate-500 mb-1">Total Sales</p>
                        <p className="text-xl font-bold text-slate-900">{formatCurrency(vatReportData.totalSales)}</p>
                        <p className="text-xs text-slate-400">Taxable amount</p>
                    </Card>
                    <Card className="border-slate-200 p-4">
                        <p className="text-xs text-slate-500 mb-1">Output VAT</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(vatReportData.outputVAT)}</p>
                        <p className="text-xs text-slate-400">Collected (15%)</p>
                    </Card>
                    <Card className="border-slate-200 p-4">
                        <p className="text-xs text-slate-500 mb-1">Total Purchases</p>
                        <p className="text-xl font-bold text-slate-900">{formatCurrency(vatReportData.totalPurchases)}</p>
                        <p className="text-xs text-slate-400">Taxable amount</p>
                    </Card>
                    <Card className="border-slate-200 p-4">
                        <p className="text-xs text-slate-500 mb-1">Input VAT</p>
                        <p className="text-xl font-bold text-red-600">{formatCurrency(vatReportData.inputVAT)}</p>
                        <p className="text-xs text-slate-400">Paid</p>
                    </Card>
                    <Card className="border-amber-200 bg-amber-50 p-4">
                        <p className="text-xs text-amber-600 mb-1">Net VAT Payable</p>
                        <p className="text-xl font-bold text-amber-700">{formatCurrency(vatReportData.netVATPayable)}</p>
                        <p className="text-xs text-amber-500">To ZATCA</p>
                    </Card>
                </div>

                {/* VAT Transactions Table */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>VAT Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-slate-200">
                                    <tr className="text-slate-500">
                                        <th className="text-left py-3 font-medium">Date</th>
                                        <th className="text-left py-3 font-medium">Invoice</th>
                                        <th className="text-left py-3 font-medium">Customer</th>
                                        <th className="text-right py-3 font-medium">Taxable</th>
                                        <th className="text-right py-3 font-medium">Rate</th>
                                        <th className="text-right py-3 font-medium">VAT</th>
                                        <th className="text-right py-3 font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {vatTransactions.map((tx, index) => (
                                        <motion.tr
                                            key={tx.invoiceNumber}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="py-3 text-slate-600">{formatDate(tx.date)}</td>
                                            <td className="py-3">
                                                <Link href="/dashboard/invoices/inv-001" className="text-amber-600 hover:underline">
                                                    {tx.invoiceNumber}
                                                </Link>
                                            </td>
                                            <td className="py-3 text-slate-600">{tx.customer}</td>
                                            <td className="py-3 text-right">{formatCurrency(tx.taxableAmount)}</td>
                                            <td className="py-3 text-right text-slate-500">{tx.vatRate}%</td>
                                            <td className="py-3 text-right font-medium">{formatCurrency(tx.vatAmount)}</td>
                                            <td className="py-3 text-right font-medium">{formatCurrency(tx.total)}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* VAT Return Helper */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText size={20} />
                            VAT Return Helper
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                            <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-700">
                                This is a helper tool with pre-filled values from your system. Please verify all information before submitting to ZATCA.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Box 1: Standard Rated Sales</p>
                                <p className="font-medium">{formatCurrency(vatReportData.totalSales)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Box 2: Output VAT Due</p>
                                <p className="font-medium">{formatCurrency(vatReportData.outputVAT)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Box 10: Recoverable VAT</p>
                                <p className="font-medium">{formatCurrency(vatReportData.inputVAT)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Box 15: Net VAT Due</p>
                                <p className="font-medium">{formatCurrency(vatReportData.netVATPayable)}</p>
                            </div>
                        </div>

                        <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                            <Download size={16} />
                            Download Pre-filled Form
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </DashboardLayout>
    );
}
