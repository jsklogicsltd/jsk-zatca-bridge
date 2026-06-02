"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Upload,
    FileCode,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    Loader2,
    RotateCcw,
    Terminal,
    Sparkles,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { validateXmlWithSdk, fetchSampleInvoice, type XMLValidationResult } from "@/lib/api/zatca";

type Status = "idle" | "validating" | "done" | "error";

const MAX_XML_BYTES = 2 * 1024 * 1024; // 2 MB — generous for a single invoice.

export default function ValidationPage() {
    const [xml, setXml] = useState("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>("idle");
    const [result, setResult] = useState<XMLValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loadingSample, setLoadingSample] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadSample = useCallback(async () => {
        setLoadingSample(true);
        setError(null);
        const resp = await fetchSampleInvoice();
        if (resp.success && resp.data) {
            setXml(resp.data.xml);
            setFileName(`${resp.data.invoice_number}.xml (generated sample)`);
            setResult(null);
            setStatus("idle");
        } else {
            setError(resp.error?.detail || "Could not load a sample invoice.");
        }
        setLoadingSample(false);
    }, []);

    const loadFile = useCallback((file: File) => {
        if (!/\.xml$/i.test(file.name)) {
            setError("Unsupported file type. Please upload a .xml invoice file.");
            return;
        }
        if (file.size > MAX_XML_BYTES) {
            setError("File is too large (max 2 MB).");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setXml(String(reader.result ?? ""));
            setFileName(file.name);
            setError(null);
            setResult(null);
            setStatus("idle");
        };
        reader.onerror = () => setError("Could not read the file.");
        reader.readAsText(file);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) loadFile(file);
        },
        [loadFile]
    );

    const handleValidate = async () => {
        if (!xml.trim()) {
            setError("Paste or upload an invoice XML first.");
            return;
        }
        setStatus("validating");
        setError(null);
        setResult(null);

        const resp = await validateXmlWithSdk(xml);
        if (resp.success && resp.data) {
            setResult(resp.data);
            setStatus("done");
        } else {
            setError(resp.error?.detail || "Validation failed. Please try again.");
            setStatus("error");
        }
    };

    const reset = () => {
        setXml("");
        setFileName(null);
        setResult(null);
        setError(null);
        setStatus("idle");
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto space-y-6"
            >
                {/* Header */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Validate XML</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Upload or paste a signed ZATCA invoice XML and check it against the
                        official ZATCA SDK validator.
                    </p>
                </div>

                {/* Input */}
                <Card className="border-slate-200">
                    <CardContent className="pt-6 space-y-4">
                        {/* Drop zone */}
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                                isDragging
                                    ? "border-amber-500 bg-amber-50"
                                    : "border-slate-300 hover:border-slate-400 bg-slate-50"
                            )}
                        >
                            <div className="w-14 h-14 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
                                <FileCode size={28} className="text-amber-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">
                                Drag &amp; drop your <span className="font-semibold">.xml</span> invoice here
                            </p>
                            <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xml,text/xml,application/xml"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) loadFile(file);
                                    e.target.value = "";
                                }}
                            />
                        </div>

                        {/* Paste area */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="xml-input"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    …or paste XML
                                    {fileName && (
                                        <span className="ml-2 text-xs font-normal text-slate-500">
                                            (loaded from {fileName})
                                        </span>
                                    )}
                                </label>
                                {xml && (
                                    <span className="text-xs text-slate-400">
                                        {new Blob([xml]).size.toLocaleString()} bytes
                                    </span>
                                )}
                            </div>
                            <textarea
                                id="xml-input"
                                value={xml}
                                onChange={(e) => {
                                    setXml(e.target.value);
                                    setFileName(null);
                                }}
                                placeholder="<Invoice xmlns=...>"
                                spellCheck={false}
                                className="w-full h-48 rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs text-slate-800 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-y"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                                <XCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={handleValidate}
                                disabled={status === "validating" || !xml.trim()}
                            >
                                {status === "validating" ? (
                                    <>
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                        Validating…
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} className="mr-2" />
                                        Validate XML
                                    </>
                                )}
                            </Button>
                            {(xml || result) && (
                                <Button variant="outline" onClick={reset} disabled={status === "validating"}>
                                    <RotateCcw size={16} className="mr-2" />
                                    Clear
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={loadSample}
                                disabled={loadingSample || status === "validating"}
                                className="ml-auto"
                            >
                                {loadingSample ? (
                                    <>
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                        Loading…
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} className="mr-2" />
                                        Load sample invoice
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Result */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <ValidationResultCard result={result} />
                    </motion.div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}

function ValidationResultCard({ result }: { result: XMLValidationResult }) {
    const pass = result.valid;
    return (
        <Card
            className={cn(
                "border",
                pass ? "border-green-300 bg-green-50/40" : "border-red-300 bg-red-50/40"
            )}
        >
            <CardContent className="pt-6 space-y-5">
                {/* Verdict */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {pass ? (
                            <CheckCircle size={28} className="text-green-600 shrink-0" />
                        ) : (
                            <XCircle size={28} className="text-red-600 shrink-0" />
                        )}
                        <div>
                            <h2
                                className={cn(
                                    "text-lg font-semibold",
                                    pass ? "text-green-800" : "text-red-800"
                                )}
                            >
                                {pass ? "ZATCA SDK Validation: PASS" : "ZATCA SDK Validation: FAIL"}
                            </h2>
                            <p className="text-sm text-slate-600">
                                Return Code: {result.return_code}
                            </p>
                        </div>
                    </div>
                    <Badge variant={pass ? "default" : "destructive"}>
                        {pass ? "VALID" : "INVALID"}
                    </Badge>
                </div>

                <IssueList
                    title="Errors"
                    items={result.errors}
                    icon={<XCircle size={15} className="text-red-600 shrink-0 mt-0.5" />}
                    tone="error"
                />
                <IssueList
                    title="Warnings"
                    items={result.warnings}
                    icon={<AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />}
                    tone="warning"
                />
                <IssueList
                    title="Info"
                    items={result.info}
                    icon={<Info size={15} className="text-blue-600 shrink-0 mt-0.5" />}
                    tone="info"
                />

                {/* Known schematron-version false-positives */}
                {result.known_issues && result.known_issues.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-blue-700">
                            Known schematron-version false-positive
                            {result.known_issues.length > 1 ? "s" : ""} ({result.known_issues.length})
                        </h3>
                        {result.known_issues.map((issue) => (
                            <div
                                key={issue.code}
                                className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800"
                            >
                                <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
                                <span>
                                    <span className="font-mono font-semibold">[{issue.code}]</span>{" "}
                                    {issue.explanation}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Raw SDK output */}
                {(result.stdout || result.stderr) && (
                    <details className="group">
                        <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 select-none">
                            <Terminal size={15} />
                            Raw SDK output
                        </summary>
                        <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100 whitespace-pre-wrap">
                            {result.stdout}
                            {result.stderr ? `\n${result.stderr}` : ""}
                        </pre>
                    </details>
                )}
            </CardContent>
        </Card>
    );
}

function IssueList({
    title,
    items,
    icon,
    tone,
}: {
    title: string;
    items: string[];
    icon: React.ReactNode;
    tone: "error" | "warning" | "info";
}) {
    if (!items?.length) return null;
    const headingColor =
        tone === "error"
            ? "text-red-700"
            : tone === "warning"
            ? "text-amber-700"
            : "text-blue-700";
    return (
        <div>
            <h3 className={cn("text-sm font-semibold mb-2", headingColor)}>
                {title} ({items.length})
            </h3>
            <ul className="space-y-1.5">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        {icon}
                        <span className="break-words">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
