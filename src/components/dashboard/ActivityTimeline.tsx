"use client";

import { motion } from "framer-motion";
import { Eye, Download, CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { recentActivities } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const statusConfig = {
    success: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Cleared" },
    pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100", label: "Pending" },
    failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-100", label: "Failed" },
};

function formatTime(date: Date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
}

export function ActivityTimeline() {
    return (
        <Card className="border-slate-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {recentActivities.map((activity, index) => {
                        const status = statusConfig[activity.status];
                        const StatusIcon = status.icon;

                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", status.bg)}>
                                        <StatusIcon size={14} className={status.color} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {activity.invoiceNumber}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">{activity.customerName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-xs text-slate-400">{formatTime(activity.timestamp)}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                            <Eye size={14} />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                            <Download size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
