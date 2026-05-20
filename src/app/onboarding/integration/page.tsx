"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Copy,
    Download,
    ExternalLink,
    Sparkles,
} from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ErpConnectorCard } from "@/components/onboarding/ErpConnectorCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    ERP_CONNECTORS,
    findConnector,
    type SnippetLanguage,
} from "@/lib/erpConnectors";

export default function OnboardingIntegrationPage() {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [step, setStep] = useState<"pick" | "configure">("pick");
    const [copied, setCopied] = useState(false);
    const [activeSnippet, setActiveSnippet] = useState<SnippetLanguage | null>(null);

    const apiKey = useMemo(
        () => "zb_live_" + Math.random().toString(36).slice(2, 14) + Math.random().toString(36).slice(2, 8),
        []
    );

    const connector = findConnector(selectedId);

    const snippetLanguages = useMemo<SnippetLanguage[]>(
        () => (connector ? (Object.keys(connector.snippets) as SnippetLanguage[]) : []),
        [connector]
    );

    const currentSnippetLang: SnippetLanguage | null =
        activeSnippet && snippetLanguages.includes(activeSnippet)
            ? activeSnippet
            : snippetLanguages[0] ?? null;

    const currentSnippet = currentSnippetLang ? connector?.snippets[currentSnippetLang] : null;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const handleContinueToConfigure = () => {
        if (!selectedId) return;
        setStep("configure");
        setActiveSnippet(null);
    };

    const handleFinish = () => {
        if (!connector) return;
        localStorage.setItem(
            "onboarding_integration",
            JSON.stringify({
                erpId: connector.id,
                erpName: connector.name,
                method: connector.connectionMethod,
                connectionLabel: connector.connectionLabel,
                apiKey,
                connectedAt: new Date().toISOString(),
            })
        );
        router.push("/onboarding/test");
    };

    return (
        <OnboardingLayout currentStep={5}>
            <div className="max-w-5xl mx-auto">
                {/* Header with hero badge */}
                <div className="mb-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full mb-3"
                    >
                        <Sparkles size={12} />
                        Smart connector — auto-detects your ERP
                    </motion.div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {step === "pick"
                            ? "What system do you currently use for invoicing?"
                            : `Setting up ${connector?.name}`}
                    </h1>
                    <p className="text-slate-600">
                        {step === "pick"
                            ? "Pick your platform — we'll generate tailored instructions in seconds."
                            : `Estimated setup time: ${connector?.setupTime} · ${connector?.recommendedFor}`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === "pick" && (
                        <motion.div
                            key="pick"
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={{ duration: 0.28 }}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ERP_CONNECTORS.map((c, i) => (
                                    <ErpConnectorCard
                                        key={c.id}
                                        connector={c}
                                        selected={selectedId === c.id}
                                        onClick={() => setSelectedId(c.id)}
                                        index={i}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-8">
                                <Link href="/onboarding/preferences">
                                    <Button variant="outline">
                                        <ArrowLeft size={16} className="mr-2" />
                                        Back
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-500">Step 4 of 5</span>
                                    <Button
                                        onClick={handleContinueToConfigure}
                                        disabled={!selectedId}
                                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md disabled:opacity-50"
                                    >
                                        Continue
                                        <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === "configure" && connector && (
                        <motion.div
                            key="configure"
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={{ duration: 0.28 }}
                            className="space-y-6"
                        >
                            {/* Hero header card */}
                            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/40 overflow-hidden">
                                <div className="p-6 flex items-center gap-5">
                                    <motion.div
                                        initial={{ scale: 0.6, rotate: -8 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 220, damping: 18 }}
                                        className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-sm",
                                            connector.color,
                                            connector.textColor
                                        )}
                                    >
                                        {connector.monogram}
                                    </motion.div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {connector.name}
                                        </h2>
                                        <p className="text-sm text-slate-600">{connector.vendor}</p>
                                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                                                Setup · {connector.setupTime}
                                            </span>
                                            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                                                Difficulty · {connector.difficulty}
                                            </span>
                                            {connector.supportsLiveUpdates && (
                                                <span className="bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                    Live status updates supported
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Setup steps */}
                            <Card className="border-slate-200">
                                <div className="p-6">
                                    <h3 className="font-semibold text-slate-900 mb-4">
                                        Setup steps
                                    </h3>
                                    <ol className="space-y-3">
                                        {connector.setupSteps.map((stepText, i) => (
                                            <motion.li
                                                key={i}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.06 * i }}
                                                className="flex items-start gap-3 text-sm text-slate-700"
                                            >
                                                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-semibold text-xs">
                                                    {i + 1}
                                                </span>
                                                <span className="pt-0.5">{stepText}</span>
                                            </motion.li>
                                        ))}
                                    </ol>
                                </div>
                            </Card>

                            {/* Primary action */}
                            <Card className="border-slate-200">
                                <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            Quick action
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {connector.connectionMethod === "spreadsheet"
                                                ? "We've prepared a template with sample rows."
                                                : connector.connectionMethod === "manual"
                                                    ? "Nothing to install — head to the dashboard."
                                                    : "One-click — opens the relevant configuration."}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                    >
                                        {connector.connectionMethod === "spreadsheet" ||
                                            connector.connectionMethod === "plugin" ? (
                                            <Download size={16} className="mr-2" />
                                        ) : (
                                            <ExternalLink size={16} className="mr-2" />
                                        )}
                                        {connector.primaryActionLabel}
                                    </Button>
                                </div>
                            </Card>

                            {/* API key (always useful, prominent for custom/api integrations) */}
                            {(connector.connectionMethod === "rest_api" ||
                                connector.connectionMethod === "plugin" ||
                                connector.connectionMethod === "webhook" ||
                                connector.connectionMethod === "oauth") && (
                                    <Card className="border-amber-200 bg-amber-50/40">
                                        <div className="p-6">
                                            <h3 className="font-semibold text-slate-900 mb-3">
                                                Your API key
                                            </h3>
                                            <div className="bg-white p-3 rounded-lg flex items-center justify-between border border-amber-200">
                                                <code className="text-sm font-mono text-slate-800 truncate">
                                                    {apiKey}
                                                </code>
                                                <button
                                                    onClick={() => handleCopy(apiKey)}
                                                    className="p-2 hover:bg-slate-100 rounded transition-colors flex-shrink-0"
                                                >
                                                    {copied ? (
                                                        <Check size={16} className="text-green-600" />
                                                    ) : (
                                                        <Copy size={16} />
                                                    )}
                                                </button>
                                            </div>
                                            <Link
                                                href={connector.docsUrl}
                                                className="text-xs text-amber-600 hover:underline mt-3 inline-block"
                                            >
                                                View full {connector.name} integration docs →
                                            </Link>
                                        </div>
                                    </Card>
                                )}

                            {/* Code snippet block */}
                            {currentSnippet && snippetLanguages.length > 0 && (
                                <Card className="border-slate-200 overflow-hidden">
                                    <div className="p-6 pb-3">
                                        <h3 className="font-semibold text-slate-900 mb-3">
                                            Drop-in code sample
                                        </h3>

                                        {snippetLanguages.length > 1 && (
                                            <div className="flex flex-wrap gap-1 border-b border-slate-200 -mx-6 px-6 -mb-px">
                                                {snippetLanguages.map((lang) => {
                                                    const meta = connector.snippets[lang]!;
                                                    const active = lang === currentSnippetLang;
                                                    return (
                                                        <button
                                                            key={lang}
                                                            onClick={() => setActiveSnippet(lang)}
                                                            className={cn(
                                                                "px-3 py-2 text-xs font-medium border-b-2 transition-colors",
                                                                active
                                                                    ? "border-amber-500 text-amber-700"
                                                                    : "border-transparent text-slate-500 hover:text-slate-700"
                                                            )}
                                                        >
                                                            {meta.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative bg-slate-900">
                                        <button
                                            onClick={() => handleCopy(currentSnippet.code)}
                                            className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check size={12} /> Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={12} /> Copy
                                                </>
                                            )}
                                        </button>
                                        <pre className="overflow-x-auto text-xs text-emerald-200 p-5 leading-relaxed max-h-96">
                                            <code>{currentSnippet.code}</code>
                                        </pre>
                                    </div>
                                </Card>
                            )}

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-2">
                                <Button variant="outline" onClick={() => setStep("pick")}>
                                    <ArrowLeft size={16} className="mr-2" />
                                    Change ERP
                                </Button>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-500">Step 4 of 5</span>
                                    <Button
                                        onClick={handleFinish}
                                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md"
                                    >
                                        Finish setup
                                        <Sparkles size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </OnboardingLayout>
    );
}
