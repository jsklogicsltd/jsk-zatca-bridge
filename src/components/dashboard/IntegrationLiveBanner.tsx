"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { findConnector } from "@/lib/erpConnectors";

interface IntegrationProfile {
    erpId: string;
    erpName: string;
    method: string;
    connectionLabel: string;
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

const SAMPLE_INVOICE_NUMBERS = [
    "INV-2026-001284",
    "INV-2026-001285",
    "INV-2026-001286",
    "INV-2026-001287",
];

/**
 * A subtle "live" banner that rotates a fake "last invoice received" timestamp
 * every few seconds, so the dashboard feels connected even with mock data.
 *
 * Renders nothing unless the user has completed the integration onboarding
 * step and the chosen ERP supports live updates.
 */
export function IntegrationLiveBanner() {
    const [profile, setProfile] = useState<IntegrationProfile | null>(null);
    const [tick, setTick] = useState(0);
    const [invoiceIdx, setInvoiceIdx] = useState(0);

    useEffect(() => {
        setProfile(readProfile());
    }, []);

    useEffect(() => {
        if (!profile) return;
        const interval = setInterval(() => {
            setTick((t) => t + 1);
            // Bump the invoice number every ~3 ticks (15s) for a "live feed" feel
            setInvoiceIdx((i) => (i + 1) % SAMPLE_INVOICE_NUMBERS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [profile]);

    if (!profile) return null;
    const connector = findConnector(profile.erpId);
    if (!connector || !connector.supportsLiveUpdates) return null;

    // Compute a "synthetic" last-seen offset that ticks 30s → 1m → 2m → 5s reset
    const offsets = ["2 min ago", "just now", "5 sec ago", "30 sec ago", "1 min ago"];
    const lastSeen = offsets[tick % offsets.length];
    const invoiceNumber = SAMPLE_INVOICE_NUMBERS[invoiceIdx];

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative rounded-xl overflow-hidden border border-emerald-200",
                "bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40"
            )}
        >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600" />
            <div className="px-4 py-3 pl-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                        <div
                            className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm",
                                connector.color,
                                connector.textColor
                            )}
                        >
                            {connector.monogram}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                        </span>
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm text-slate-800 font-medium">
                            Your integration with{" "}
                            <span className="text-emerald-700">{connector.name}</span> is
                            active
                        </p>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={`${tick}-${invoiceIdx}`}
                                initial={{ opacity: 0, y: 3 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -3 }}
                                transition={{ duration: 0.25 }}
                                className="text-xs text-slate-500 mt-0.5 truncate"
                            >
                                <Radio size={10} className="inline mr-1 text-emerald-500" />
                                Last invoice received{" "}
                                <span className="font-mono text-slate-700">
                                    {invoiceNumber}
                                </span>{" "}
                                · {lastSeen}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                </div>
            </div>
        </motion.div>
    );
}
