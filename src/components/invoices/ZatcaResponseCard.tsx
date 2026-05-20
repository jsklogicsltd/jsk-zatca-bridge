"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    Sparkles,
    Server,
    Lock,
    FileCode,
    Hash,
    Clock,
    Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ZatcaAction, ZatcaSubmissionResult } from "@/lib/api";

// ---------------------------------------------------------------------------
// State model
// ---------------------------------------------------------------------------

export type ZatcaDisplayState =
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "success"; result: ZatcaSubmissionResult }
    | {
        kind: "demo";
        reason: "credentials_missing" | "backend_offline";
        result: ZatcaSubmissionResult | null;
        action: ZatcaAction;
        endpoint: string;
        details?: string;
    }
    | {
        kind: "rejected";
        reason: "zatca_rejection" | "backend_error";
        result: ZatcaSubmissionResult | null;
        errorMessage: string;
        errorCode?: string;
    };

export function actionToZatcaEndpoint(action: ZatcaAction, environment = "sandbox"): string {
    const base =
        environment === "production"
            ? "https://gw-fatoora.zatca.gov.sa/e-invoicing/core"
            : environment === "simulation"
                ? "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation"
                : "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal";
    const path =
        action === "clear"
            ? "/invoices/clearance/single"
            : action === "report"
                ? "/invoices/reporting/single"
                : "/compliance/invoices";
    return `${base}${path}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={async () => {
                await navigator.clipboard.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
            }}
            className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors"
        >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy"}
        </button>
    );
}

function Collapsible({
    title,
    children,
    defaultOpen = false,
}: {
    title: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
                <span className="text-sm font-medium text-slate-800">{title}</span>
                {open ? (
                    <ChevronUp size={14} className="text-slate-500" />
                ) : (
                    <ChevronDown size={14} className="text-slate-500" />
                )}
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-slate-200">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CodeBlock({ text }: { text: string }) {
    return (
        <div className="relative bg-slate-900 text-emerald-200">
            <div className="absolute top-2 right-2">
                <CopyButton value={text} />
            </div>
            <pre className="font-mono text-[11px] leading-relaxed overflow-x-auto p-3 pr-16 max-h-72">
                <code>{text}</code>
            </pre>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

interface ZatcaResponseCardProps {
    state: ZatcaDisplayState;
    onRetry?: () => void;
}

export function ZatcaResponseCard({ state, onRetry }: ZatcaResponseCardProps) {
    if (state.kind === "idle") return null;

    if (state.kind === "submitting") {
        return (
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm">
                <CardContent className="p-5 flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        className="w-9 h-9 rounded-full border-2 border-amber-400 border-t-transparent"
                    />
                    <div>
                        <p className="font-medium text-amber-900">
                            Submitting to ZATCA Fatoora portal…
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            Backend is calling gw-fatoora.zatca.gov.sa server-side via httpx.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (state.kind === "success") return <SuccessCard result={state.result} />;
    if (state.kind === "demo") return <DemoCard state={state} />;
    return <RejectionCard state={state} onRetry={onRetry} />;
}

// ---------------------------------------------------------------------------
// State A — success
// ---------------------------------------------------------------------------

function SuccessCard({ result }: { result: ZatcaSubmissionResult }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-600" />
                <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                        <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 320, damping: 18 }}
                            className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-sm"
                        >
                            <CheckCircle2 size={22} className="text-white" />
                        </motion.div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-green-900">
                                ZATCA Sandbox Submission Successful
                            </h3>
                            <p className="text-sm text-green-700">
                                Invoice accepted by the Fatoora portal.
                            </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-green-200 text-green-900">
                            {result.status}
                        </span>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs bg-white rounded-lg border border-green-200 p-3">
                        {result.clearance_uuid && (
                            <div className="sm:col-span-2">
                                <dt className="text-slate-500">Clearance UUID</dt>
                                <dd className="font-mono text-slate-800 break-all">
                                    {result.clearance_uuid}
                                </dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-slate-500">Action</dt>
                            <dd className="font-mono text-slate-800 capitalize">
                                {result.action ?? "—"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Environment</dt>
                            <dd className="font-mono text-slate-800">
                                {result.environment ?? "sandbox"}
                            </dd>
                        </div>
                        {result.timestamp && (
                            <div className="sm:col-span-2">
                                <dt className="text-slate-500">ZATCA timestamp (UTC)</dt>
                                <dd className="font-mono text-slate-800">{result.timestamp}</dd>
                            </div>
                        )}
                        {result.attempted_url && (
                            <div className="sm:col-span-2">
                                <dt className="text-slate-500">Endpoint</dt>
                                <dd className="font-mono text-slate-800 break-all">
                                    {result.attempted_url}
                                </dd>
                            </div>
                        )}
                    </dl>

                    <Collapsible title="Raw ZATCA response JSON">
                        <CodeBlock
                            text={JSON.stringify(
                                result.zatca_response ?? result,
                                null,
                                2
                            )}
                        />
                    </Collapsible>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// State B — demo / informational
// ---------------------------------------------------------------------------

function DemoCard({
    state,
}: {
    state: Extract<ZatcaDisplayState, { kind: "demo" }>;
}) {
    const result = state.result;

    // Compose the payload we'd show. If backend gave us one, use it.
    // Otherwise fall back to a representative shape.
    const wouldSendPayload =
        (result?.would_send_payload as Record<string, unknown> | undefined) ??
        ((result?.zatca_response as Record<string, unknown> | undefined)?.would_be_payload as
            | Record<string, unknown>
            | undefined) ?? {
            invoiceHash: "<SHA-256 of canonicalised UBL XML>",
            uuid: "<invoice UUID v4>",
            invoice: "<base64-encoded signed UBL 2.1 XML>",
        };

    const expectedResponse =
        (result?.expected_response_format as Record<string, unknown> | undefined) ??
        (state.action === "clear"
            ? {
                validationResults: {
                    infoMessages: [],
                    warningMessages: [],
                    errorMessages: [],
                    status: "PASS",
                },
                clearanceStatus: "CLEARED",
                clearedInvoice: "<base64 of ZATCA-cleared XML>",
            }
            : {
                validationResults: {
                    infoMessages: [],
                    warningMessages: [],
                    errorMessages: [],
                    status: "PASS",
                },
                reportingStatus: "REPORTED",
            });

    const payloadSize =
        result?.payload_size_bytes ??
        new TextEncoder().encode(JSON.stringify(wouldSendPayload)).length;

    const heading =
        state.reason === "backend_offline"
            ? "ZATCA Sandbox Connection — Backend Offline"
            : "ZATCA Sandbox Connection — Awaiting Credentials";

    const subtitle =
        state.reason === "backend_offline"
            ? "Invoice signed locally. The FastAPI backend is not reachable, so we can't relay to the Fatoora portal right now."
            : "This invoice is fully ZATCA-compliant and ready for submission. Production submission requires your business VAT credentials.";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
                <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Sparkles size={20} className="text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-amber-900">{heading}</h3>
                            <p className="text-sm text-amber-800 mt-0.5">{subtitle}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-amber-200 text-amber-900 whitespace-nowrap">
                            {state.reason === "backend_offline"
                                ? "DEMO MODE"
                                : "AWAITING CREDS"}
                        </span>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <InfoTile
                            icon={<Server size={14} className="text-amber-600" />}
                            label="Target endpoint"
                            value={state.endpoint}
                            mono
                        />
                        <InfoTile
                            icon={<Lock size={14} className="text-amber-600" />}
                            label="Authentication"
                            value="Basic Auth with CSID:Secret"
                        />
                        <InfoTile
                            icon={<FileCode size={14} className="text-amber-600" />}
                            label="Payload size"
                            value={`${payloadSize.toLocaleString()} bytes`}
                            mono
                        />
                    </div>

                    {/* Collapsibles */}
                    <div className="space-y-2">
                        <Collapsible title="What would be sent to ZATCA" defaultOpen>
                            <CodeBlock
                                text={JSON.stringify(wouldSendPayload, null, 2)}
                            />
                        </Collapsible>
                        <Collapsible title="Expected ZATCA response on success">
                            <CodeBlock
                                text={JSON.stringify(expectedResponse, null, 2)}
                            />
                        </Collapsible>
                    </div>

                    {/* Footnote */}
                    <div className="bg-white border border-amber-200 rounded-lg p-3 text-xs text-slate-700">
                        Once your ZATCA credentials are configured in{" "}
                        <a
                            href="/dashboard/csid"
                            className="text-amber-600 font-medium hover:underline"
                        >
                            Settings → ZATCA Integration
                        </a>
                        , invoices will submit automatically in real-time.
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function InfoTile({
    icon,
    label,
    value,
    mono,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="bg-white border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
                {icon}
                <span className="text-[11px] text-slate-500 uppercase tracking-wide">
                    {label}
                </span>
            </div>
            <p
                className={cn(
                    "text-xs text-slate-800 break-all",
                    mono && "font-mono"
                )}
            >
                {value}
            </p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// State C — rejection
// ---------------------------------------------------------------------------

function RejectionCard({
    state,
    onRetry,
}: {
    state: Extract<ZatcaDisplayState, { kind: "rejected" }>;
    onRetry?: () => void;
}) {
    const result = state.result;
    const zatcaErrors = (() => {
        if (!result?.zatca_response) return [];
        const parsed =
            (result.zatca_response as Record<string, unknown>).parsed_errors;
        if (parsed && typeof parsed === "object") {
            return (parsed as { errors?: Array<{ code: string; message: string }> })
                .errors ?? [];
        }
        return [];
    })();

    const suggestion =
        state.reason === "backend_error"
            ? "Check the FastAPI backend logs at /api/v1/invoices/submit-to-zatca — the error came back from your backend, not from ZATCA."
            : "Most ZATCA rejections come from invoice-level rule violations: TRN format, VAT rounding, missing fields. Fix the highlighted items and resubmit.";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-white shadow-md overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-red-400 to-red-600" />
                <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <XCircle size={22} className="text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-red-900">
                                {state.reason === "backend_error"
                                    ? "Backend rejected the submission"
                                    : "ZATCA Validation Error"}
                            </h3>
                            <p className="text-sm text-red-700 mt-0.5">
                                {state.errorMessage}
                            </p>
                        </div>
                        {state.errorCode && (
                            <span className="px-2 py-1 rounded text-xs font-mono font-semibold bg-red-200 text-red-900">
                                {state.errorCode}
                            </span>
                        )}
                    </div>

                    {zatcaErrors.length > 0 && (
                        <div className="bg-white border border-red-200 rounded-lg overflow-hidden">
                            <p className="px-3 py-2 text-xs font-semibold text-red-800 bg-red-50 border-b border-red-200">
                                ZATCA error codes
                            </p>
                            <ul className="divide-y divide-red-100">
                                {zatcaErrors.map((err, i) => (
                                    <li key={i} className="px-3 py-2 text-xs">
                                        <span className="font-mono font-semibold text-red-700">
                                            {err.code}
                                        </span>{" "}
                                        <span className="text-slate-700">{err.message}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
                        <AlertTriangle
                            size={14}
                            className="text-amber-600 flex-shrink-0 mt-0.5"
                        />
                        <span>
                            <strong>Suggested fix: </strong>
                            {suggestion}
                        </span>
                    </div>

                    {result?.zatca_response && (
                        <Collapsible title="Raw error response">
                            <CodeBlock
                                text={JSON.stringify(result.zatca_response, null, 2)}
                            />
                        </Collapsible>
                    )}

                    {onRetry && (
                        <div className="flex justify-end">
                            <Button
                                onClick={onRetry}
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 text-white"
                            >
                                <Sparkles size={14} className="mr-2" />
                                Retry Submission
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Diagnostic footer — always visible
// ---------------------------------------------------------------------------

interface DiagnosticFooterProps {
    backendOnline: boolean;
    apiEndpoint: string;
    environment: string;
    requestId?: string;
}

export function DiagnosticFooter({
    backendOnline,
    apiEndpoint,
    environment,
    requestId,
}: DiagnosticFooterProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono">
            <DiagnosticItem
                icon={<Activity size={11} />}
                label="Backend"
                value={
                    <span
                        className={cn(
                            "inline-flex items-center gap-1",
                            backendOnline ? "text-green-700" : "text-red-700"
                        )}
                    >
                        <span
                            className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                backendOnline ? "bg-green-500" : "bg-red-500"
                            )}
                        />
                        {backendOnline ? "Connected" : "Not reachable"}
                    </span>
                }
            />
            <DiagnosticItem
                icon={<Server size={11} />}
                label="API"
                value={<span className="text-slate-700 truncate">{apiEndpoint}</span>}
            />
            <DiagnosticItem
                icon={<Clock size={11} />}
                label="Env"
                value={<span className="text-slate-700 capitalize">{environment}</span>}
            />
            <DiagnosticItem
                icon={<Hash size={11} />}
                label="Request ID"
                value={
                    <span className="text-slate-700 truncate">
                        {requestId ? requestId.slice(0, 8) + "…" : "—"}
                    </span>
                }
            />
        </div>
    );
}

function DiagnosticItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-slate-400 flex-shrink-0">{icon}</span>
            <span className="text-slate-500 uppercase tracking-wide flex-shrink-0">
                {label}:
            </span>
            <span className="min-w-0 truncate">{value}</span>
        </div>
    );
}
