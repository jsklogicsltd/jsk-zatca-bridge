"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { cn } from "@/lib/utils";

interface RevenueTrendChartProps {
    data: { date: string; revenue: number }[];
}

const periodOptions = ["7D", "30D", "90D", "1Y", "All"];

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
    const [period, setPeriod] = useState("30D");

    const filteredData = (() => {
        const now = new Date();
        let days = 30;
        switch (period) {
            case "7D":
                days = 7;
                break;
            case "30D":
                days = 30;
                break;
            case "90D":
                days = 90;
                break;
            case "1Y":
                days = 365;
                break;
            case "All":
                days = data.length;
                break;
        }
        return data.slice(-days);
    })();

    const formatCurrency = (value: number) => `SAR ${(value / 1000).toFixed(0)}K`;
    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Revenue Trend</CardTitle>
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        {periodOptions.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setPeriod(opt)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                                    period === opt
                                        ? "bg-white text-amber-600 shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                        <Download size={14} />
                        Export
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-[300px]"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredData}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                tick={{ fontSize: 12, fill: "#64748b" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tickFormatter={formatCurrency}
                                tick={{ fontSize: 12, fill: "#64748b" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length && label) {
                                        return (
                                            <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                                                <p className="text-xs text-slate-500">{formatDate(String(label))}</p>
                                                <p className="text-lg font-bold text-slate-900">
                                                    SAR {payload[0].value?.toLocaleString()}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </CardContent>
        </Card>
    );
}
