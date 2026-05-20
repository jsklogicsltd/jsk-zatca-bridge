"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wifi, WifiOff, AlertTriangle, Clock, ShieldCheck, ShieldAlert, Server } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHealthStatus, useZatcaHealth, useZatcaCredentialsStatus } from "@/lib/hooks/useApi";
import { cn } from "@/lib/utils";

type Connection = "connected" | "degraded" | "down";

const connectionConfig: Record<Connection, { icon: typeof Wifi; color: string; bg: string; label: string }> = {
    connected: { icon: Wifi, color: "text-green-600", bg: "bg-green-100", label: "Connected" },
    degraded: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100", label: "Degraded" },
    down: { icon: WifiOff, color: "text-red-600", bg: "bg-red-100", label: "Disconnected" },
};

function formatTime(date: Date) {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function SystemStatusCard() {
    const { data: health, loading: healthLoading, refetch: refetchHealth } = useHealthStatus();
    const { data: zatca, loading: zatcaLoading } = useZatcaHealth();
    const { data: creds, loading: credsLoading } = useZatcaCredentialsStatus();

    const apiOk = health?.status === "healthy" || health?.status === "ok";
    const zatcaOk = zatca?.status === "healthy" || zatca?.status === "ok";

    const connectionKey: Connection = !apiOk ? "down" : zatcaOk ? "connected" : "degraded";
    const connection = connectionConfig[connectionKey];
    const ConnectionIcon = connection.icon;

    const hasCsid = !!creds?.has_csid;
    const csidEnvironment = creds?.environment ?? "sandbox";

    return (
        <Card className={cn(
            "border-slate-200 relative overflow-hidden",
            connectionKey === "connected" && "bg-gradient-to-br from-green-50 to-white",
            connectionKey === "degraded" && "bg-gradient-to-br from-amber-50 to-white",
            connectionKey === "down" && "bg-gradient-to-br from-red-50 to-white"
        )}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* ZATCA Connection */}
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
                            <p className={cn("text-xs font-medium", connection.color)}>
                                {zatcaLoading ? "Checking…" : zatca?.message ?? connection.label}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Backend API */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-2 text-slate-600">
                        <Server size={14} />
                        <span className="text-sm">Backend API</span>
                    </div>
                    <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        apiOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                        {healthLoading ? "…" : apiOk ? `v${health?.version ?? "1.0"}` : "Offline"}
                    </span>
                </motion.div>

                {/* Last checked */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={14} />
                        <span className="text-sm">Last Check</span>
                    </div>
                    <button
                        type="button"
                        onClick={refetchHealth}
                        className="text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors"
                    >
                        {formatTime(new Date())}
                    </button>
                </motion.div>

                {/* CSID Status */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-3 bg-white rounded-lg border border-slate-200"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">CSID Status</span>
                        <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            credsLoading && "bg-slate-100 text-slate-500",
                            !credsLoading && hasCsid && "bg-green-100 text-green-700",
                            !credsLoading && !hasCsid && "bg-amber-100 text-amber-700"
                        )}>
                            {credsLoading ? "…" : hasCsid ? "Active" : "Not configured"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        {hasCsid ? (
                            <ShieldCheck size={16} className="text-green-600" />
                        ) : (
                            <ShieldAlert size={16} className="text-amber-600" />
                        )}
                        <span>
                            {hasCsid
                                ? `${csidEnvironment.charAt(0).toUpperCase() + csidEnvironment.slice(1)} environment`
                                : "No certificate on file"}
                        </span>
                    </div>

                    {!credsLoading && !hasCsid && (
                        <Button
                            asChild
                            size="sm"
                            className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            <Link href="/dashboard/csid">Configure CSID</Link>
                        </Button>
                    )}
                </motion.div>
            </CardContent>
        </Card>
    );
}
