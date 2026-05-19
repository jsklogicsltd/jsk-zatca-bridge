"use client";

import { motion } from "framer-motion";
import { Wifi, WifiOff, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { systemStatus } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const connectionConfig = {
    connected: { icon: Wifi, color: "text-green-600", bg: "bg-green-100", label: "Connected" },
    degraded: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100", label: "Degraded" },
    down: { icon: WifiOff, color: "text-red-600", bg: "bg-red-100", label: "Disconnected" },
};

function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(date: Date) {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function SystemStatusCard() {
    const connection = connectionConfig[systemStatus.zatcaConnection];
    const ConnectionIcon = connection.icon;
    const showRenewButton = systemStatus.csidInfo.daysUntilExpiry <= 7;

    return (
        <Card className={cn(
            "border-slate-200 relative overflow-hidden",
            systemStatus.zatcaConnection === "connected" && "bg-gradient-to-br from-green-50 to-white",
            systemStatus.zatcaConnection === "degraded" && "bg-gradient-to-br from-amber-50 to-white",
            systemStatus.zatcaConnection === "down" && "bg-gradient-to-br from-red-50 to-white"
        )}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Connection Status */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                >
                    <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", connection.bg)}>
                            <ConnectionIcon size={20} className={connection.color} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900">ZATCA Connection</p>
                            <p className={cn("text-xs font-medium", connection.color)}>{connection.label}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Last Sync */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={14} />
                        <span className="text-sm">Last Sync</span>
                    </div>
                    <span className="text-sm font-medium">{formatTime(systemStatus.lastSyncTime)}</span>
                </motion.div>

                {/* CSID Expiry */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-3 bg-white rounded-lg border border-slate-200"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">CSID Expires</span>
                        <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            systemStatus.csidInfo.daysUntilExpiry > 7 && "bg-green-100 text-green-700",
                            systemStatus.csidInfo.daysUntilExpiry <= 7 && systemStatus.csidInfo.daysUntilExpiry > 0 && "bg-amber-100 text-amber-700",
                            systemStatus.csidInfo.daysUntilExpiry <= 0 && "bg-red-100 text-red-700"
                        )}>
                            {systemStatus.csidInfo.daysUntilExpiry} days left
                        </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                        {formatDate(systemStatus.csidInfo.expiryDate)}
                    </p>

                    {showRenewButton && (
                        <Button
                            size="sm"
                            className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            <RefreshCw size={14} className="mr-2" />
                            Renew CSID
                        </Button>
                    )}
                </motion.div>

                {/* API Health */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 gap-3 text-center"
                >
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <p className="text-lg font-bold text-slate-900">{systemStatus.apiHealth.uptime}%</p>
                        <p className="text-xs text-slate-500">Uptime</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <p className="text-lg font-bold text-slate-900">{systemStatus.apiHealth.latency}ms</p>
                        <p className="text-xs text-slate-500">Latency</p>
                    </div>
                </motion.div>
            </CardContent>
        </Card>
    );
}
