"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, PlugZap, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { findConnector, type ErpConnector } from "@/lib/erpConnectors";

interface IntegrationProfile {
    erpId: string;
    erpName: string;
    method: string;
    connectionLabel: string;
    apiKey?: string;
    connectedAt?: string;
}

function readProfile(): IntegrationProfile | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem("onboarding_integration");
        return raw ? (JSON.parse(raw) as IntegrationProfile) : null;
    } catch {
        return null;
    }
}

function formatRelative(iso?: string): string {
    if (!iso) return "just now";
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "just now";
    const diffSec = Math.max(1, Math.floor((Date.now() - then) / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} h ago`;
    return `${Math.floor(diffSec / 86400)} d ago`;
}

export function IntegrationStatusCard() {
    const [profile, setProfile] = useState<IntegrationProfile | null>(null);
    const [connector, setConnector] = useState<ErpConnector | undefined>();

    useEffect(() => {
        const p = readProfile();
        setProfile(p);
        setConnector(findConnector(p?.erpId));
    }, []);

    if (!profile || !connector) {
        return (
            <Card className="border-dashed border-2 border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <PlugZap size={16} className="text-slate-500" />
                        Integration Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    <p className="text-slate-500 mb-3">
                        You haven't connected an ERP yet. Pick one to start receiving
                        invoices automatically.
                    </p>
                    <Link href="/onboarding/integration">
                        <Button size="sm" variant="outline">
                            Choose your ERP
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-200 overflow-hidden">
            <div className={cn("h-1 bg-gradient-to-r", "from-amber-400 to-amber-600")} />
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <PlugZap size={16} className="text-amber-600" />
                    Integration Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 220, damping: 16 }}
                        className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0",
                            connector.color,
                            connector.textColor
                        )}
                    >
                        {connector.monogram}
                    </motion.div>
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 leading-tight truncate">
                            {connector.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {connector.connectionLabel}
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Active
                    </span>
                </div>

                <dl className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                    <dt className="text-slate-500">Method</dt>
                    <dd className="text-slate-800 capitalize">
                        {profile.method.replace("_", " ")}
                    </dd>
                    <dt className="text-slate-500">Connected</dt>
                    <dd className="text-slate-800">{formatRelative(profile.connectedAt)}</dd>
                    {connector.supportsLiveUpdates && (
                        <>
                            <dt className="text-slate-500">Live updates</dt>
                            <dd className="text-green-700 inline-flex items-center gap-1">
                                <CheckCircle2 size={12} /> Webhook armed
                            </dd>
                        </>
                    )}
                </dl>

                <Link
                    href="/onboarding/integration"
                    className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline"
                >
                    <Settings2 size={12} />
                    Reconfigure
                </Link>
            </CardContent>
        </Card>
    );
}
