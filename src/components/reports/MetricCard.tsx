"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar } from "recharts";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    trendDirection?: "up" | "down";
    icon: LucideIcon;
    sparklineData?: { value: number }[];
    sparklineType?: "area" | "bar";
    target?: { value: number; label: string };
    index?: number;
}

export function MetricCard({
    title,
    value,
    subtitle,
    trend,
    trendDirection,
    icon: Icon,
    sparklineData,
    sparklineType = "area",
    target,
    index = 0,
}: MetricCardProps) {
    const isPositive = trendDirection === "up";
    const showTarget = target !== undefined;
    const aboveTarget = showTarget && typeof value === "number" && value >= target.value;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <Card className="p-4 hover:shadow-md transition-shadow border-slate-200">
                <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-amber-600" />
                    </div>
                    {trend !== undefined && (
                        <div
                            className={cn(
                                "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                                isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}
                        >
                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                    {showTarget && (
                        <span
                            className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded-full",
                                aboveTarget ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            )}
                        >
                            {aboveTarget ? "Above target" : "Below target"}
                        </span>
                    )}
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <motion.p
                            className="text-2xl font-bold text-slate-900"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            {typeof value === "number" && title.toLowerCase().includes("revenue")
                                ? `SAR ${value.toLocaleString()}`
                                : typeof value === "number" && title.toLowerCase().includes("rate")
                                    ? `${value}%`
                                    : typeof value === "number" && title.toLowerCase().includes("time")
                                        ? `${value}s`
                                        : value}
                        </motion.p>
                        <p className="text-xs text-slate-500 mt-1">{title}</p>
                        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                    </div>

                    {sparklineData && (
                        <div className="w-20 h-10">
                            <ResponsiveContainer width="100%" height="100%">
                                {sparklineType === "area" ? (
                                    <AreaChart data={sparklineData}>
                                        <defs>
                                            <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#f59e0b"
                                            strokeWidth={1.5}
                                            fill="url(#sparkGradient)"
                                        />
                                    </AreaChart>
                                ) : (
                                    <BarChart data={sparklineData}>
                                        <Bar dataKey="value" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
