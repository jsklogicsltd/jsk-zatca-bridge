"use client";

import { CheckCircle, Clock, XCircle, AlertTriangle, FileCheck, Send, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    size?: "sm" | "md";
}

const statusConfig: Record<string, {
    icon: typeof CheckCircle;
    label: string;
    bgColor: string;
    textColor: string;
    iconColor: string;
}> = {
    // ZATCA API statuses
    signed: {
        icon: FileCheck,
        label: "Signed",
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        iconColor: "text-blue-600",
    },
    reported: {
        icon: Send,
        label: "Reported",
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-700",
        iconColor: "text-indigo-600",
    },
    cleared: {
        icon: CheckCircle,
        label: "Cleared",
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        iconColor: "text-green-600",
    },
    rejected: {
        icon: XCircle,
        label: "Rejected",
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        iconColor: "text-red-600",
    },
    draft: {
        icon: FileText,
        label: "Draft",
        bgColor: "bg-stone-100",
        textColor: "text-stone-700",
        iconColor: "text-stone-600",
    },
    // Legacy frontend statuses
    pending: {
        icon: Clock,
        label: "Pending",
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        iconColor: "text-amber-600",
    },
    failed: {
        icon: AlertTriangle,
        label: "Failed",
        bgColor: "bg-orange-100",
        textColor: "text-orange-700",
        iconColor: "text-orange-600",
    },
};

// Default fallback config
const defaultConfig = {
    icon: Clock,
    label: "Unknown",
    bgColor: "bg-stone-100",
    textColor: "text-stone-700",
    iconColor: "text-stone-600",
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
    // Normalize status to lowercase for lookup
    const normalizedStatus = (status || "").toLowerCase();
    const config = statusConfig[normalizedStatus] || defaultConfig;
    const Icon = config.icon;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full font-medium shadow-sm",
                config.bgColor,
                config.textColor,
                size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
            )}
        >
            <Icon size={size === "sm" ? 12 : 14} className={config.iconColor} />
            {config.label}
        </span>
    );
}

