"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Download, RefreshCw, Eye, X, Copy, CheckCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { validationLogs, type ValidationLog } from "@/lib/mockData/csid";
import { cn } from "@/lib/utils";
import Link from "next/link";

type LogLevel = "all" | "info" | "warning" | "error" | "success";

const levelConfig = {
    info: { color: "bg-blue-100 text-blue-700", label: "Info" },
    warning: { color: "bg-amber-100 text-amber-700", label: "Warning" },
    error: { color: "bg-red-100 text-red-700", label: "Error" },
    success: { color: "bg-green-100 text-green-700", label: "Success" },
};

function formatTimestamp(date: Date) {
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export default function ValidationLogsPage() {
    const [search, setSearch] = useState("");
    const [level, setLevel] = useState<LogLevel>("all");
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [selectedLog, setSelectedLog] = useState<ValidationLog | null>(null);
    const [copied, setCopied] = useState(false);

    const filteredLogs = useMemo(() => {
        return validationLogs.filter((log) => {
            if (search && !log.message.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }
            if (level !== "all" && log.level !== level) {
                return false;
            }
            return true;
        });
    }, [search, level]);

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Validation Logs</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Monitor system events and invoice validation history
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
                        <div className="relative flex-1 sm:max-w-sm">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search logs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>

                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value as LogLevel)}
                            className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white"
                        >
                            <option value="all">All Levels</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                            <option value="success">Success</option>
                        </select>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="accent-amber-500"
                            />
                            Auto-refresh
                            {autoRefresh && <RefreshCw size={14} className="text-amber-500 animate-spin" />}
                        </label>
                    </div>

                    <Button variant="outline" size="sm" className="gap-2">
                        <Download size={16} />
                        Export Logs
                    </Button>
                </div>

                {/* Logs Table */}
                <Card className="border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                <tr className="text-xs text-slate-500 uppercase">
                                    <th className="p-3 text-left font-medium">Timestamp</th>
                                    <th className="p-3 text-left font-medium">Level</th>
                                    <th className="p-3 text-left font-medium">Event</th>
                                    <th className="p-3 text-left font-medium">Message</th>
                                    <th className="p-3 text-left font-medium">Invoice</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono text-sm">
                                {filteredLogs.map((log, index) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="p-3 text-slate-600 whitespace-nowrap">
                                            {formatTimestamp(log.timestamp)}
                                        </td>
                                        <td className="p-3">
                                            <span className={cn("px-2 py-0.5 rounded text-xs font-medium", levelConfig[log.level].color)}>
                                                {levelConfig[log.level].label}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-700 whitespace-nowrap">{log.eventType}</td>
                                        <td className="p-3 text-slate-600 max-w-md truncate">{log.message}</td>
                                        <td className="p-3">
                                            {log.invoiceId && (
                                                <Link
                                                    href={`/dashboard/invoices/${log.invoiceId}`}
                                                    className="text-amber-600 hover:underline text-xs"
                                                >
                                                    {log.invoiceId}
                                                </Link>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <Eye size={14} />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Log Detail Modal */}
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedLog(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-lg font-bold text-slate-900 mb-4">Log Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                                    <p className="font-mono text-sm">{selectedLog.timestamp.toISOString()}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Level</p>
                                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", levelConfig[selectedLog.level].color)}>
                                        {levelConfig[selectedLog.level].label}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Event Type</p>
                                    <p className="text-sm font-medium">{selectedLog.eventType}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Message</p>
                                    <p className="text-sm">{selectedLog.message}</p>
                                </div>

                                {selectedLog.invoiceId && (
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Related Invoice</p>
                                        <Link
                                            href={`/dashboard/invoices/${selectedLog.invoiceId}`}
                                            className="text-amber-600 hover:underline text-sm"
                                        >
                                            {selectedLog.invoiceId}
                                        </Link>
                                    </div>
                                )}

                                {selectedLog.details?.stackTrace && (
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Stack Trace</p>
                                        <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                                            {selectedLog.details.stackTrace}
                                        </pre>
                                    </div>
                                )}

                                {selectedLog.details?.response && (
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs text-slate-500">Response Data</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(JSON.stringify(selectedLog.details?.response, null, 2))}
                                            >
                                                {copied ? <CheckCircle size={14} className="text-green-600" /> : <Copy size={14} />}
                                            </Button>
                                        </div>
                                        <pre className="text-xs bg-slate-100 p-4 rounded-lg overflow-x-auto">
                                            {JSON.stringify(selectedLog.details.response, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
