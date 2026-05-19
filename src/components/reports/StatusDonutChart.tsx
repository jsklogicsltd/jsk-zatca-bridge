"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface StatusDonutChartProps {
    data: { name: string; value: number; color: string }[];
    title: string;
}

export function StatusDonutChart({ data, title }: StatusDonutChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card className="border-slate-200">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-[280px] relative"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="45%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={1000}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        const percentage = ((data.value / total) * 100).toFixed(1);
                                        return (
                                            <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                                                <p className="text-sm font-medium">{data.name}</p>
                                                <p className="text-lg font-bold">{data.value}</p>
                                                <p className="text-xs text-slate-500">{percentage}%</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center label */}
                    <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-3xl font-bold text-slate-900">{total}</p>
                        <p className="text-xs text-slate-500">Total</p>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-4 mt-4">
                        {data.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-xs text-slate-600">
                                    {item.name} ({item.value})
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </CardContent>
        </Card>
    );
}
