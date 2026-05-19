"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { DollarSign, FileText, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MetricCard } from "@/components/reports/MetricCard";
import { RevenueTrendChart } from "@/components/reports/RevenueTrendChart";
import { StatusDonutChart } from "@/components/reports/StatusDonutChart";
import { ProcessingTimeChart } from "@/components/reports/ProcessingTimeChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    revenueData,
    monthlyMetrics,
    statusDistribution,
    processingTimeData,
    topCustomers,
} from "@/lib/mockData/analytics";

function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-SA", {
        style: "currency",
        currency: "SAR",
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function ReportsPage() {
    // Sparkline data
    const revenueSparkline = revenueData.slice(-14).map((d) => ({ value: d.revenue }));
    const invoicesSparkline = revenueData.slice(-14).map((d) => ({ value: d.invoices }));

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
                        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Analytics and insights for your invoicing
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/dashboard/reports/vat">
                            <Button variant="outline" size="sm">VAT Report</Button>
                        </Link>
                        <Link href="/dashboard/reports/custom">
                            <Button variant="outline" size="sm">Custom Report</Button>
                        </Link>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Revenue"
                        value={monthlyMetrics.totalRevenue}
                        subtitle="This month"
                        trend={monthlyMetrics.revenueChange}
                        trendDirection="up"
                        icon={DollarSign}
                        sparklineData={revenueSparkline}
                        sparklineType="area"
                        index={0}
                    />
                    <MetricCard
                        title="Invoices Processed"
                        value={monthlyMetrics.invoicesProcessed}
                        subtitle={`${monthlyMetrics.invoicesCleared} cleared, ${monthlyMetrics.invoicesPending} pending`}
                        icon={FileText}
                        sparklineData={invoicesSparkline}
                        sparklineType="bar"
                        index={1}
                    />
                    <MetricCard
                        title="Clearance Rate"
                        value={monthlyMetrics.clearanceRate}
                        icon={CheckCircle}
                        target={{ value: monthlyMetrics.targetClearanceRate, label: "Target 95%" }}
                        index={2}
                    />
                    <MetricCard
                        title="Avg Processing Time"
                        value={monthlyMetrics.avgProcessingTime}
                        trend={-17.6}
                        trendDirection="down"
                        icon={Clock}
                        index={3}
                    />
                </div>

                {/* Revenue Chart */}
                <RevenueTrendChart data={revenueData} />

                {/* Status & Processing Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StatusDonutChart data={statusDistribution} title="Invoice Status Distribution" />
                    <ProcessingTimeChart data={processingTimeData} />
                </div>

                {/* Top Customers */}
                <Card className="border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Top Customers by Volume</CardTitle>
                        <Button variant="outline" size="sm">View All Customers</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-slate-200">
                                    <tr className="text-slate-500">
                                        <th className="text-left py-3 font-medium">Customer</th>
                                        <th className="text-right py-3 font-medium">Invoices</th>
                                        <th className="text-right py-3 font-medium">Total Amount</th>
                                        <th className="text-right py-3 font-medium">Avg Value</th>
                                        <th className="text-right py-3 font-medium">Last Invoice</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {topCustomers.slice(0, 10).map((customer, index) => (
                                        <motion.tr
                                            key={customer.name}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="py-3 font-medium text-slate-900">{customer.name}</td>
                                            <td className="py-3 text-right text-slate-600">{customer.invoices}</td>
                                            <td className="py-3 text-right font-medium">{formatCurrency(customer.totalAmount)}</td>
                                            <td className="py-3 text-right text-slate-600">{formatCurrency(customer.avgValue)}</td>
                                            <td className="py-3 text-right text-slate-500">{formatDate(customer.lastInvoice)}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </DashboardLayout>
    );
}
