"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { SystemStatusCard } from "@/components/dashboard/SystemStatusCard";
import { IntegrationStatusCard } from "@/components/dashboard/IntegrationStatusCard";
import { IntegrationLiveBanner } from "@/components/dashboard/IntegrationLiveBanner";
import { quickActions } from "@/lib/mockData";
import { motion } from "framer-motion";
import { useDashboardStats, useHealthStatus } from "@/lib/hooks/useApi";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const { data: stats, loading: statsLoading, error: statsError } = useDashboardStats();
    const { data: health, loading: healthLoading } = useHealthStatus();
    const [isBackendOnline, setIsBackendOnline] = useState(false);

    useEffect(() => {
        if (health?.status === 'healthy') {
            setIsBackendOnline(true);
        }
    }, [health]);

    // Calculate values from API or use fallback
    const totalInvoices = stats?.total_invoices ?? 0;
    const clearedCount = stats?.cleared_count ?? 0;
    const reportedCount = stats?.reported_count ?? 0;
    const rejectedCount = stats?.rejected_count ?? 0;
    const draftCount = stats?.draft_count ?? 0;
    const signedCount = stats?.signed_count ?? 0;

    const clearedRate = totalInvoices > 0
        ? Math.round(((clearedCount + reportedCount) / totalInvoices) * 100)
        : 0;

    const pendingCount = draftCount + signedCount;

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                {/* Integration "live" banner (only if user finished ERP onboarding) */}
                <IntegrationLiveBanner />

                {/* Backend Status Banner */}
                {!healthLoading && (
                    <div className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${isBackendOnline
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        {isBackendOnline
                            ? `Backend API connected (v${health?.version || '1.0'})`
                            : 'Backend API offline - using cached data'}
                    </div>
                )}

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Welcome back! Here's an overview of your ZATCA compliance.
                        </p>
                    </div>
                </div>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon="invoices"
                        value={statsLoading ? "..." : totalInvoices.toLocaleString()}
                        label="Total Invoices"
                        trend={`${clearedCount + reportedCount} processed`}
                        trendDirection="up"
                        index={0}
                    />
                    <StatCard
                        icon="rate"
                        value={statsLoading ? "..." : `${clearedRate}%`}
                        label="Compliance Rate"
                        trend={rejectedCount > 0 ? `${rejectedCount} rejected` : "All compliant"}
                        trendDirection={rejectedCount > 0 ? "down" : "up"}
                        index={1}
                    />
                    <StatCard
                        icon="pending"
                        value={statsLoading ? "..." : pendingCount.toString()}
                        label="Pending Review"
                        trend={`${draftCount} drafts, ${signedCount} signed`}
                        trendDirection={pendingCount > 5 ? "down" : "neutral"}
                        index={2}
                    />
                    <StatCard
                        icon="csid"
                        value={isBackendOnline ? "Active" : "Offline"}
                        label="CSID Status"
                        status={isBackendOnline ? "active" : "warning"}
                        index={3}
                    />
                </div>

                {/* Error display */}
                {statsError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                        <strong>API Error:</strong> {statsError}
                    </div>
                )}

                {/* Quick Actions Grid */}
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <QuickActionCard
                                key={action.id}
                                id={action.id}
                                label={action.label}
                                description={action.description}
                                icon={action.icon as "Upload" | "CheckCircle" | "Download" | "BookOpen"}
                                href={action.href}
                                index={index}
                            />
                        ))}
                    </div>
                </div>

                {/* Activity & Status Row */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                    <ActivityTimeline />
                    <div className="space-y-4">
                        <IntegrationStatusCard />
                        <SystemStatusCard />
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
