"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface BackendHealth {
    status: string;
    version?: string;
    database?: string;
    timestamp?: string;
}

interface NetworkStatusPillProps {
    /** Notify parent when health state changes (used by diagnostic footer). */
    onChange?: (state: { online: boolean; health: BackendHealth | null }) => void;
}

export function NetworkStatusPill({ onChange }: NetworkStatusPillProps) {
    const [online, setOnline] = useState<boolean | null>(null);
    const [health, setHealth] = useState<BackendHealth | null>(null);
    const [open, setOpen] = useState(false);
    const lastPing = useRef<number>(0);

    const ping = async () => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
            clearTimeout(timeout);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = (await res.json()) as BackendHealth;
            setOnline(true);
            setHealth(data);
            onChange?.({ online: true, health: data });
        } catch {
            setOnline(false);
            setHealth(null);
            onChange?.({ online: false, health: null });
        } finally {
            lastPing.current = Date.now();
        }
    };

    useEffect(() => {
        ping();
        const id = setInterval(ping, 15_000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isOnline = online === true;
    const isLoading = online === null;

    return (
        <div className="relative inline-block">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    isLoading
                        ? "bg-slate-50 text-slate-500 border-slate-200"
                        : isOnline
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                )}
            >
                <span
                    className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isLoading
                            ? "bg-slate-400 animate-pulse"
                            : isOnline
                                ? "bg-green-500 animate-pulse"
                                : "bg-amber-500"
                    )}
                />
                {isLoading
                    ? "Checking backend…"
                    : isOnline
                        ? "Backend Connected"
                        : "Demo Mode (backend offline)"}
                <ChevronDown
                    size={12}
                    className={cn("transition-transform", open && "rotate-180")}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 z-30 bg-white border border-slate-200 rounded-lg shadow-lg w-80 p-3 text-xs"
                    >
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                            {isOnline ? (
                                <Wifi size={14} className="text-green-600" />
                            ) : (
                                <WifiOff size={14} className="text-amber-600" />
                            )}
                            <span
                                className={cn(
                                    "font-semibold",
                                    isOnline ? "text-green-700" : "text-amber-700"
                                )}
                            >
                                {isOnline
                                    ? "Backend reachable"
                                    : "Backend not reachable"}
                            </span>
                        </div>

                        <dl className="space-y-1.5">
                            <div className="flex justify-between gap-2">
                                <dt className="text-slate-500">API endpoint</dt>
                                <dd className="font-mono text-slate-800 truncate">
                                    {API_BASE}
                                </dd>
                            </div>
                            {health?.version && (
                                <div className="flex justify-between gap-2">
                                    <dt className="text-slate-500">Backend version</dt>
                                    <dd className="font-mono text-slate-800">{health.version}</dd>
                                </div>
                            )}
                            {health?.database && (
                                <div className="flex justify-between gap-2">
                                    <dt className="text-slate-500">Database</dt>
                                    <dd className="font-mono text-slate-800">{health.database}</dd>
                                </div>
                            )}
                            {health?.timestamp && (
                                <div className="flex justify-between gap-2">
                                    <dt className="text-slate-500">Last ping</dt>
                                    <dd className="font-mono text-slate-800">
                                        {new Date(health.timestamp).toLocaleTimeString()}
                                    </dd>
                                </div>
                            )}
                            {!isOnline && (
                                <p className="pt-2 text-amber-700">
                                    Submissions will display "what would be sent" previews
                                    instead of hitting ZATCA. Start the backend with{" "}
                                    <code className="bg-slate-100 px-1 rounded">
                                        uvicorn app.main:app --reload
                                    </code>
                                    .
                                </p>
                            )}
                        </dl>

                        <button
                            type="button"
                            onClick={ping}
                            className="mt-3 w-full px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                            Recheck now
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
