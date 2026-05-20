"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Download,
    Copy,
    CheckCircle,
    RefreshCw,
    AlertTriangle,
    KeyRound,
    Save,
    Trash2,
    Loader2,
    ArrowUpCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatusIndicator } from "@/components/csid/StatusIndicator";
import { CSIDTimeline } from "@/components/csid/CSIDTimeline";
import { RenewalModal } from "@/components/csid/RenewalModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { currentCSID, csidHistory, getDaysUntilExpiry, getCSIDStatusFromExpiry } from "@/lib/mockData/csid";
import { cn } from "@/lib/utils";
import {
    setZatcaCredentials,
    getZatcaCredentialsStatus,
    clearZatcaCredentials,
    upgradeToProduction,
    type CredentialsStatus,
} from "@/lib/api";

function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function maskSerial(serial: string) {
    return serial.slice(0, 10) + "••••••" + serial.slice(-4);
}

export default function CSIDPage() {
    const [isRenewalOpen, setIsRenewalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [environment, setEnvironment] = useState<"sandbox" | "production">(currentCSID.environment);

    // Real ZATCA credential management (backed by /api/v1/zatca/credentials)
    const [credsStatus, setCredsStatus] = useState<CredentialsStatus | null>(null);
    const [csidInput, setCsidInput] = useState("");
    const [secretInput, setSecretInput] = useState("");
    const [credsEnv, setCredsEnv] = useState<"sandbox" | "simulation" | "production">("sandbox");
    const [credsSaving, setCredsSaving] = useState(false);
    const [credsMessage, setCredsMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
    const [upgrading, setUpgrading] = useState(false);

    const refreshCredsStatus = async () => {
        const resp = await getZatcaCredentialsStatus();
        if (resp.success && resp.data) {
            setCredsStatus(resp.data);
            if (resp.data.environment) {
                setCredsEnv(resp.data.environment as "sandbox" | "simulation" | "production");
            }
        } else {
            setCredsStatus({ has_csid: false, has_secret: false });
        }
    };

    useEffect(() => {
        refreshCredsStatus();
    }, []);

    const handleSaveCreds = async () => {
        if (!csidInput.trim() || !secretInput.trim()) {
            setCredsMessage({ kind: "err", text: "Both CSID and secret are required." });
            return;
        }
        setCredsSaving(true);
        setCredsMessage(null);
        const resp = await setZatcaCredentials({
            csid: csidInput.trim(),
            secret: secretInput.trim(),
            environment: credsEnv,
        });
        setCredsSaving(false);
        if (resp.success && resp.data) {
            setCredsStatus(resp.data);
            setCsidInput("");
            setSecretInput("");
            setCredsMessage({ kind: "ok", text: "Credentials saved (encrypted at rest)." });
        } else {
            setCredsMessage({
                kind: "err",
                text: resp.error?.detail || "Failed to save credentials.",
            });
        }
    };

    const handleClearCreds = async () => {
        setCredsSaving(true);
        await clearZatcaCredentials();
        await refreshCredsStatus();
        setCredsMessage({ kind: "ok", text: "Credentials cleared." });
        setCredsSaving(false);
    };

    const handleUpgrade = async () => {
        setUpgrading(true);
        setCredsMessage(null);
        const resp = await upgradeToProduction();
        setUpgrading(false);
        if (resp.success && resp.data?.success) {
            await refreshCredsStatus();
            setCredsMessage({
                kind: "ok",
                text: `Production CSID issued. ${resp.data.message ?? ""}`,
            });
        } else {
            setCredsMessage({
                kind: "err",
                text: resp.error?.detail || resp.data?.message || "Upgrade failed.",
            });
        }
    };

    const daysRemaining = getDaysUntilExpiry(currentCSID.expiryDate);
    const status = getCSIDStatusFromExpiry(currentCSID.expiryDate);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(currentCSID.serialNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">CSID Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage your Cryptographic Stamp ID certificates
                    </p>
                </div>

                {/* Status Indicator */}
                <StatusIndicator status={status} daysRemaining={daysRemaining} />

                {/* Current CSID Info + Environment Selector */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Certificate */}
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle>Current Certificate</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Serial Number</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-sm bg-slate-100 px-3 py-2 rounded font-mono">
                                        {maskSerial(currentCSID.serialNumber)}
                                    </code>
                                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                                        {copied ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">Issue Date</p>
                                    <p className="font-medium">{formatDate(currentCSID.issueDate)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Expiry Date</p>
                                    <p className="font-medium">{formatDate(currentCSID.expiryDate)}</p>
                                </div>
                            </div>

                            <div className="text-sm">
                                <p className="text-slate-500">Issued By</p>
                                <p className="font-medium">{currentCSID.issuedBy}</p>
                            </div>

                            <div className="text-sm">
                                <p className="text-slate-500">Valid For</p>
                                <span className={cn(
                                    "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                                    environment === "production" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                )}>
                                    {environment === "production" ? "Production" : "Sandbox"}
                                </span>
                            </div>

                            <Button variant="outline" className="w-full gap-2">
                                <Download size={16} />
                                Download Certificate (PEM)
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Environment & Renewal */}
                    <div className="space-y-6">
                        {/* Environment Selector */}
                        <Card className="border-slate-200">
                            <CardHeader>
                                <CardTitle>Environment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setEnvironment("sandbox")}
                                        className={cn(
                                            "flex-1 p-4 rounded-lg border-2 transition-all text-left",
                                            environment === "sandbox"
                                                ? "border-amber-500 bg-amber-50"
                                                : "border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        <p className="font-medium">Sandbox</p>
                                        <p className="text-xs text-slate-500">For testing</p>
                                    </button>
                                    <button
                                        onClick={() => setEnvironment("production")}
                                        className={cn(
                                            "flex-1 p-4 rounded-lg border-2 transition-all text-left",
                                            environment === "production"
                                                ? "border-green-500 bg-green-50"
                                                : "border-slate-200 hover:border-slate-300"
                                        )}
                                    >
                                        <p className="font-medium">Production</p>
                                        <p className="text-xs text-slate-500">Live environment</p>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Renewal Card */}
                        <Card className={cn(
                            "border-2",
                            status === "active" && "border-slate-200",
                            status === "expiring" && "border-amber-300 bg-amber-50",
                            status === "expired" && "border-red-300 bg-red-50"
                        )}>
                            <CardContent className="pt-6">
                                {status === "active" && (
                                    <div className="text-center py-4">
                                        <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                                        <p className="font-medium text-slate-900">Certificate Valid</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            No renewal required at this time
                                        </p>
                                    </div>
                                )}

                                {status === "expiring" && (
                                    <div className="text-center py-4">
                                        <AlertTriangle size={40} className="text-amber-500 mx-auto mb-3" />
                                        <p className="font-medium text-amber-700">Certificate Expiring Soon</p>
                                        <p className="text-sm text-amber-600 mt-1">
                                            {daysRemaining} days remaining - renew now to avoid disruption
                                        </p>
                                        <Button
                                            onClick={() => setIsRenewalOpen(true)}
                                            className="mt-4 bg-amber-500 hover:bg-amber-600 text-white"
                                        >
                                            <RefreshCw size={16} className="mr-2" />
                                            Renew Now
                                        </Button>
                                    </div>
                                )}

                                {status === "expired" && (
                                    <div className="text-center py-4">
                                        <AlertTriangle size={40} className="text-red-500 mx-auto mb-3" />
                                        <p className="font-medium text-red-700">Certificate Expired</p>
                                        <p className="text-sm text-red-600 mt-1">
                                            Your certificate has expired. Generate a new one immediately.
                                        </p>
                                        <Button
                                            onClick={() => setIsRenewalOpen(true)}
                                            className="mt-4 bg-red-500 hover:bg-red-600 text-white"
                                        >
                                            <RefreshCw size={16} className="mr-2" />
                                            Generate New Certificate
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Real ZATCA Credentials Manager */}
                <Card className="border-2 border-amber-200 bg-amber-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <KeyRound size={18} className="text-amber-600" />
                            ZATCA Credentials (Live)
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-1">
                            Paste a CSID + secret obtained from the ZATCA sandbox here. Stored
                            encrypted (Fernet) on the user record and used by the real
                            <code className="mx-1 bg-slate-100 px-1 rounded">/invoices/submit-to-zatca</code>
                            path. Requires the FastAPI backend running and you to be signed in.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Current stored credentials status */}
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-500 mb-1">Currently stored</p>
                            {credsStatus === null ? (
                                <p className="text-sm text-slate-400">Checking…</p>
                            ) : credsStatus.has_csid ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-mono text-slate-800">
                                        {credsStatus.csid_preview ?? "<set>"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Environment:{" "}
                                        <span className="font-mono">{credsStatus.environment ?? "—"}</span>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    No credentials stored. Submissions will return
                                    <code className="mx-1 bg-slate-100 px-1 rounded">CREDENTIALS_MISSING</code>
                                    until you paste in a CSID below.
                                </p>
                            )}
                        </div>

                        {/* Input form */}
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <Label htmlFor="csid-input" className="text-xs">
                                    CSID (binarySecurityToken)
                                </Label>
                                <Input
                                    id="csid-input"
                                    value={csidInput}
                                    onChange={(e) => setCsidInput(e.target.value)}
                                    placeholder="TUlJQ0V6Q0NBYm1nQXdJQkFnSVRFQUFBRkRq…"
                                    className="font-mono text-xs mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="secret-input" className="text-xs">
                                    Secret
                                </Label>
                                <Input
                                    id="secret-input"
                                    type="password"
                                    value={secretInput}
                                    onChange={(e) => setSecretInput(e.target.value)}
                                    placeholder="Wj7HQ1Sk2gZb…"
                                    className="font-mono text-xs mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="env-select" className="text-xs">
                                    Environment
                                </Label>
                                <select
                                    id="env-select"
                                    value={credsEnv}
                                    onChange={(e) =>
                                        setCredsEnv(e.target.value as "sandbox" | "simulation" | "production")
                                    }
                                    className="w-full h-9 px-3 mt-1 rounded-md border border-slate-200 bg-white text-sm"
                                >
                                    <option value="sandbox">Sandbox (developer-portal)</option>
                                    <option value="simulation">Simulation (PREZATCA)</option>
                                    <option value="production">Production (Fatoora)</option>
                                </select>
                            </div>
                        </div>

                        {credsMessage && (
                            <div
                                className={cn(
                                    "text-xs px-3 py-2 rounded",
                                    credsMessage.kind === "ok"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                )}
                            >
                                {credsMessage.text}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={handleSaveCreds}
                                disabled={credsSaving || !csidInput.trim() || !secretInput.trim()}
                                className="bg-amber-500 hover:bg-amber-600 text-white"
                                size="sm"
                            >
                                {credsSaving ? (
                                    <Loader2 size={14} className="mr-2 animate-spin" />
                                ) : (
                                    <Save size={14} className="mr-2" />
                                )}
                                Save Credentials
                            </Button>

                            {credsStatus?.has_csid && (
                                <>
                                    <Button
                                        onClick={handleClearCreds}
                                        disabled={credsSaving}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 size={14} className="mr-2" />
                                        Clear
                                    </Button>

                                    {credsStatus.environment !== "production" && (
                                        <Button
                                            onClick={handleUpgrade}
                                            disabled={upgrading}
                                            variant="outline"
                                            size="sm"
                                        >
                                            {upgrading ? (
                                                <Loader2 size={14} className="mr-2 animate-spin" />
                                            ) : (
                                                <ArrowUpCircle size={14} className="mr-2" />
                                            )}
                                            Upgrade CCSID → PCSID
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Timeline */}
                <CSIDTimeline records={csidHistory} />

                {/* Renewal Modal */}
                <RenewalModal
                    isOpen={isRenewalOpen}
                    onClose={() => setIsRenewalOpen(false)}
                    onSuccess={() => { }}
                />
            </motion.div>
        </DashboardLayout>
    );
}
