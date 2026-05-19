"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, FileText, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
    icon: "invoices" | "rate" | "pending" | "csid";
    value: number | string;
    label: string;
    trend?: number | string;
    trendDirection?: "up" | "down" | "neutral";
    status?: "active" | "expiring" | "expired" | "warning";
    index?: number;
}

const iconMap = {
    invoices: FileText,
    rate: CheckCircle,
    pending: Clock,
    csid: ShieldCheck,
};

export function StatCard({ icon, value, label, trend, trendDirection = "neutral", status, index = 0 }: StatCardProps) {
    const Icon = iconMap[icon];

    // Determine trend icon
    const TrendIcon = trendDirection === "up" ? TrendingUp : trendDirection === "down" ? TrendingDown : Minus;

    // Format trend display
    const trendDisplay = typeof trend === "number" ? `${Math.abs(trend)}%` : trend;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-slate-200">
                <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-amber-600" />
                    </div>

                    {trend !== undefined && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                            trendDirection === "up" && "bg-green-100 text-green-700",
                            trendDirection === "down" && "bg-red-100 text-red-700",
                            trendDirection === "neutral" && "bg-slate-100 text-slate-600"
                        )}>
                            <TrendIcon size={12} />
                            {trendDisplay}
                        </div>
                    )}

                    {status && (
                        <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            status === "active" && "bg-green-100 text-green-700",
                            status === "expiring" && "bg-amber-100 text-amber-700",
                            status === "expired" && "bg-red-100 text-red-700",
                            status === "warning" && "bg-yellow-100 text-yellow-700"
                        )}>
                            {status === "active" ? "Active" : status === "expiring" ? "Expiring" : status === "warning" ? "Warning" : "Expired"}
                        </span>
                    )}
                </div>

                <div className="mt-4">
                    <p className="text-2xl font-bold text-slate-900">
                        {typeof value === "number" && icon === "rate" ? `${value}%` : typeof value === "number" ? value.toLocaleString() : value}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{label}</p>
                </div>
            </Card>
        </motion.div>
    );
}
