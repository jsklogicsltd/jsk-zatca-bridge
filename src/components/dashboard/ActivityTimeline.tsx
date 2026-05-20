"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvoiceList } from "@/lib/hooks/useApi";
import type { InvoiceResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

type RowStatus = "success" | "pending" | "failed" | "draft";

const statusConfig: Record<RowStatus, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
    success: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Cleared" },
    pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100", label: "Pending" },
    failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-100", label: "Failed" },
    draft: { icon: FileText, color: "text-slate-600", bg: "bg-slate-100", label: "Draft" },
};

function mapStatus(status: InvoiceResponse["status"]): RowStatus {
    switch (status) {
        case "CLEARED":
        case "REPORTED":
            return "success";
        case "REJECTED":
            return "failed";
        case "SIGNED":
            return "pending";
        case "DRAFT":
        default:
            return "draft";
    }
}

function formatTime(iso: string) {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ActivityTimeline() {
    const { data, loading, error } = useInvoiceList({ limit: 8 });
    const invoices = data?.invoices ?? [];

    return (
        <Card className="border-slate-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/invoices">View all</Link>
                </Button>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="py-8 text-center text-sm text-slate-400">Loading recent invoices…</div>
                )}

                {!loading && error && (
                    <div className="py-6 text-center text-sm text-red-600">
                        Couldn't load activity: {error}
                    </div>
                )}

                {!loading && !error && invoices.length === 0 && (
                    <div className="py-8 text-center">
                        <FileText className="mx-auto mb-2 text-slate-300" size={28} />
                        <p className="text-sm text-slate-500">No invoices yet</p>
                        <p className="text-xs text-slate-400 mt-1">Submitted invoices will appear here.</p>
                    </div>
                )}

                {!loading && !error && invoices.length > 0 && (
                    <div className="space-y-1">
                        {invoices.map((invoice, index) => {
                            const row = mapStatus(invoice.status);
                            const cfg = statusConfig[row];
                            const StatusIcon = cfg.icon;

                            return (
                                <motion.div
                                    key={invoice.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", cfg.bg)}>
                                            <StatusIcon size={14} className={cfg.color} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">
                                                {invoice.invoice_number}
                                            </p>
                                            <p className={cn("text-xs truncate", cfg.color)}>{cfg.label}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-xs text-slate-400">{formatTime(invoice.created_at)}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                <Link href={`/dashboard/invoices/${invoice.id}`}>
                                                    <Eye size={14} />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
