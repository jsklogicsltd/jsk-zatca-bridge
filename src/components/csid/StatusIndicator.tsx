"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CSIDStatus } from "@/lib/mockData/csid";

interface StatusIndicatorProps {
    status: CSIDStatus;
    daysRemaining?: number;
}

const statusConfig = {
    active: {
        icon: CheckCircle,
        label: "System Operational",
        bgColor: "bg-green-500",
        textColor: "text-green-700",
        bgLight: "bg-green-50",
        borderColor: "border-green-200",
    },
    expiring: {
        icon: AlertTriangle,
        label: "Certificate Expiring Soon",
        bgColor: "bg-amber-500",
        textColor: "text-amber-700",
        bgLight: "bg-amber-50",
        borderColor: "border-amber-200",
    },
    expired: {
        icon: XCircle,
        label: "Action Required",
        bgColor: "bg-red-500",
        textColor: "text-red-700",
        bgLight: "bg-red-50",
        borderColor: "border-red-200",
    },
    revoked: {
        icon: XCircle,
        label: "Certificate Revoked",
        bgColor: "bg-red-500",
        textColor: "text-red-700",
        bgLight: "bg-red-50",
        borderColor: "border-red-200",
    },
};

export function StatusIndicator({ status, daysRemaining }: StatusIndicatorProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div className={cn("p-6 rounded-xl border", config.bgLight, config.borderColor)}>
            <div className="flex items-center gap-4">
                {/* Animated Status Dot */}
                <div className="relative">
                    <motion.div
                        className={cn("w-16 h-16 rounded-full flex items-center justify-center", config.bgColor)}
                        animate={status === "active" ? { scale: [1, 1.05, 1] } : {}}
                        transition={status === "active" ? { duration: 2, repeat: Infinity } : {}}
                    >
                        <Icon size={32} className="text-white" />
                    </motion.div>
                    {status === "active" && (
                        <motion.div
                            className={cn("absolute inset-0 rounded-full", config.bgColor)}
                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    )}
                </div>

                <div className="flex-1">
                    <h3 className={cn("text-xl font-bold", config.textColor)}>
                        {config.label}
                    </h3>
                    {status === "active" && (
                        <p className="text-sm text-slate-600 mt-1">
                            Your CSID certificate is valid and operational
                        </p>
                    )}
                    {status === "expiring" && daysRemaining !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex gap-1">
                                {String(daysRemaining).split("").map((digit, i) => (
                                    <motion.span
                                        key={i}
                                        className="inline-block w-8 h-10 bg-amber-100 rounded text-amber-700 font-mono text-xl font-bold flex items-center justify-center"
                                        initial={{ y: -10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        {digit}
                                    </motion.span>
                                ))}
                            </div>
                            <span className="text-amber-700 font-medium">days remaining</span>
                        </div>
                    )}
                    {status === "expired" && (
                        <p className="text-sm text-red-600 mt-1">
                            Your certificate has expired. Generate a new one immediately.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
