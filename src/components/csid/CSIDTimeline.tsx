"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CSIDRecord, CSIDStatus } from "@/lib/mockData/csid";

interface CSIDTimelineProps {
    records: CSIDRecord[];
}

function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const statusIcons: Record<CSIDStatus, React.ElementType> = {
    active: CheckCircle,
    expiring: AlertTriangle,
    expired: XCircle,
    revoked: XCircle,
};

const statusColors: Record<CSIDStatus, { bg: string; text: string; border: string }> = {
    active: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
    expiring: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
    expired: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300" },
    revoked: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
};

export function CSIDTimeline({ records }: CSIDTimelineProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <Card className="border-slate-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield size={20} />
                    Certificate History
                </CardTitle>
            </CardHeader>
            <CardContent>
                {records.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500">
                        No certificate history yet. Past CSID issuances and renewals will
                        appear here.
                    </div>
                ) : (
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

                    <div className="space-y-6">
                        {records.map((record, index) => {
                            const Icon = statusIcons[record.status];
                            const colors = statusColors[record.status];
                            const isExpanded = expandedId === record.id;
                            const isFirst = index === 0;

                            return (
                                <motion.div
                                    key={record.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative pl-14"
                                >
                                    {/* Timeline Node */}
                                    <div
                                        className={cn(
                                            "absolute left-3 w-6 h-6 rounded-full flex items-center justify-center border-2",
                                            colors.bg,
                                            colors.border,
                                            isFirst && "ring-4 ring-offset-2 ring-green-100"
                                        )}
                                    >
                                        <Icon size={12} className={colors.text} />
                                    </div>

                                    {/* Content */}
                                    <div
                                        className={cn(
                                            "p-4 rounded-lg border transition-colors",
                                            isFirst ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50 border-slate-100"
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", colors.bg, colors.text)}>
                                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {record.environment === "production" ? "Production" : "Sandbox"}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-900 mt-2">
                                                    Issued: {formatDate(record.issueDate)}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    Expires: {formatDate(record.expiryDate)}
                                                </p>
                                                <p className="text-xs text-slate-500 font-mono mt-1">
                                                    {record.serialNumber.slice(0, 10)}...
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : record.id)}
                                                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                            >
                                                Details
                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>
                                        </div>

                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="mt-4 pt-4 border-t border-slate-200 text-sm space-y-2"
                                            >
                                                <div>
                                                    <span className="text-slate-500">Serial Number:</span>
                                                    <code className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded">
                                                        {record.serialNumber}
                                                    </code>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Issued By:</span>
                                                    <span className="ml-2 text-slate-700">{record.issuedBy}</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
                )}
            </CardContent>
        </Card>
    );
}
