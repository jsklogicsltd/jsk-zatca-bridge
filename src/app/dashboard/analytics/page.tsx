"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, TrendingUp, AlertTriangle, Users, Activity } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from "recharts";
import { complianceAnalytics, topCustomers } from "@/lib/mockData/analytics";

export default function AnalyticsPage() {
    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* Header */}
                <div>
                    <Link
                        href="/dashboard/reports"
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600 mb-2"
                    >
                        <ArrowLeft size={16} />
                        Back to Reports
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Advanced insights and performance metrics
                    </p>
                </div>

                {/* Success Rate Trend */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp size={20} />
                            Clearance Success Rate Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={complianceAnalytics.successRateTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    />
                                    <YAxis
                                        domain={[85, 100]}
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        tickFormatter={(v) => `${v}%`}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length && label) {
                                                return (
                                                    <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                                                        <p className="text-xs text-slate-500">
                                                            {new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                        </p>
                                                        <p className="text-lg font-bold text-slate-900">
                                                            {(payload[0].value as number).toFixed(1)}%
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="rate"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Failure Reasons */}
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Common Failure Reasons
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={complianceAnalytics.failureReasons}
                                        layout="vertical"
                                        margin={{ left: 120 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                                        <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                                        <YAxis
                                            dataKey="reason"
                                            type="category"
                                            tick={{ fontSize: 11, fill: "#64748b" }}
                                            width={110}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                                                            <p className="text-sm font-medium">{payload[0].payload.reason}</p>
                                                            <p className="text-lg font-bold text-red-600">{payload[0].value} failures</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Insights */}
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users size={20} />
                                Customer Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-xs text-green-600 mb-1">Top Performer</p>
                                    <p className="font-medium text-green-800">{topCustomers[0].name}</p>
                                    <p className="text-sm text-green-600">{topCustomers[0].invoices} invoices this period</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 mb-1">Active Customers</p>
                                        <p className="text-xl font-bold">{topCustomers.length}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 mb-1">Avg. Invoice Value</p>
                                        <p className="text-xl font-bold">SAR 2,335</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs text-slate-500">Top 5 by Volume</p>
                                    {topCustomers.slice(0, 5).map((customer, i) => (
                                        <div key={customer.name} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">{i + 1}. {customer.name}</span>
                                            <span className="font-medium">{customer.invoices}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Metrics */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity size={20} />
                            System Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-green-50 rounded-lg text-center">
                                <p className="text-3xl font-bold text-green-600">99.98%</p>
                                <p className="text-xs text-green-700">API Uptime</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg text-center">
                                <p className="text-3xl font-bold text-blue-600">145ms</p>
                                <p className="text-xs text-blue-700">Avg. Response Time</p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-lg text-center">
                                <p className="text-3xl font-bold text-amber-600">1.3</p>
                                <p className="text-xs text-amber-700">Avg. Retry Count</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg text-center">
                                <p className="text-3xl font-bold text-purple-600">247</p>
                                <p className="text-xs text-purple-700">Invoices This Month</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </DashboardLayout>
    );
}
