"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface ProcessingTimeChartProps {
    data: { range: string; count: number }[];
}

export function ProcessingTimeChart({ data }: ProcessingTimeChartProps) {
    const avgTime = 4.2; // Mock average

    return (
        <Card className="border-slate-200">
            <CardHeader>
                <CardTitle>Processing Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-[280px]"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                                dataKey="range"
                                tick={{ fontSize: 11, fill: "#64748b" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#64748b" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                                                <p className="text-xs text-slate-500">{label}</p>
                                                <p className="text-lg font-bold text-slate-900">
                                                    {payload[0].value} invoices
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#f59e0b"
                                radius={[4, 4, 0, 0]}
                                animationDuration={1000}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Stats below */}
                <div className="flex justify-center gap-6 mt-4 text-sm">
                    <div className="text-center">
                        <p className="text-slate-500">Average</p>
                        <p className="font-bold text-slate-900">{avgTime}s</p>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-500">Median</p>
                        <p className="font-bold text-slate-900">2.1s</p>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-500">P95</p>
                        <p className="font-bold text-slate-900">6.8s</p>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-500">P99</p>
                        <p className="font-bold text-slate-900">9.2s</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
