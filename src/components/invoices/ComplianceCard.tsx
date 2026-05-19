"use client";

import { Copy, CheckCircle, Clock, XCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { ValidationStep } from "@/lib/mockData/invoices";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ComplianceCardProps {
    clearanceUuid?: string;
    invoiceHash?: string;
    submittedAt?: Date;
    validationLog: ValidationStep[];
}

const stepIcons = {
    success: CheckCircle,
    error: XCircle,
    pending: Clock,
};

function formatTime(date: Date) {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-slate-100 transition-colors"
        >
            {copied ? (
                <CheckCircle size={14} className="text-green-600" />
            ) : (
                <Copy size={14} className="text-slate-400" />
            )}
        </button>
    );
}

export function ComplianceCard({ clearanceUuid, invoiceHash, submittedAt, validationLog }: ComplianceCardProps) {
    const [showSignature, setShowSignature] = useState(false);

    return (
        <div className="space-y-4">
            {/* ZATCA Compliance Card */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">ZATCA Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Submission Timestamp */}
                    {submittedAt && (
                        <div>
                            <p className="text-xs text-slate-500 mb-0.5">Submitted</p>
                            <p className="text-sm font-medium text-slate-900">
                                {submittedAt.toLocaleDateString()} at {formatTime(submittedAt)}
                            </p>
                        </div>
                    )}

                    {/* Clearance UUID */}
                    {clearanceUuid && (
                        <div>
                            <p className="text-xs text-slate-500 mb-0.5">Clearance UUID</p>
                            <div className="flex items-center gap-2">
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1 truncate">
                                    {clearanceUuid}
                                </code>
                                <CopyButton text={clearanceUuid} />
                            </div>
                        </div>
                    )}

                    {/* Invoice Hash */}
                    {invoiceHash && (
                        <div>
                            <p className="text-xs text-slate-500 mb-0.5">Invoice Hash</p>
                            <div className="flex items-center gap-2">
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1 truncate">
                                    {invoiceHash}
                                </code>
                                <CopyButton text={invoiceHash} />
                            </div>
                        </div>
                    )}

                    {/* QR Code Placeholder */}
                    <div className="border border-dashed border-slate-200 rounded-lg p-4 bg-slate-50 text-center">
                        <div className="w-24 h-24 bg-white border border-slate-200 rounded mx-auto mb-2 flex items-center justify-center">
                            <span className="text-3xl">📱</span>
                        </div>
                        <p className="text-xs text-slate-500">QR Code</p>
                    </div>

                    {/* Signature Info */}
                    <button
                        onClick={() => setShowSignature(!showSignature)}
                        className="w-full flex items-center justify-between text-sm text-slate-600 hover:text-slate-900"
                    >
                        <span>Cryptographic Signature</span>
                        {showSignature ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showSignature && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-xs text-slate-500 bg-slate-50 p-2 rounded"
                        >
                            <p>Algorithm: ECDSA-SHA256</p>
                            <p className="mt-1 truncate">Signature: eyJhbGciOiJFUzI1NiIs...</p>
                        </motion.div>
                    )}
                </CardContent>
            </Card>

            {/* Validation Log Card */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Validation Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {validationLog.map((step, index) => {
                            const Icon = stepIcons[step.status];
                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                                        step.status === "success" && "bg-green-100",
                                        step.status === "error" && "bg-red-100",
                                        step.status === "pending" && "bg-amber-100"
                                    )}>
                                        <Icon size={12} className={cn(
                                            step.status === "success" && "text-green-600",
                                            step.status === "error" && "text-red-600",
                                            step.status === "pending" && "text-amber-600"
                                        )} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900">{step.step}</p>
                                        {step.message && (
                                            <p className="text-xs text-red-600 mt-0.5">{step.message}</p>
                                        )}
                                        <p className="text-xs text-slate-400">{formatTime(step.timestamp)}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
