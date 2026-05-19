"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Code, FileSpreadsheet, MousePointerClick, Copy, Check } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OnboardingIntegrationPage() {
    const router = useRouter();
    const [method, setMethod] = useState<"api" | "manual" | "excel" | null>(null);
    const [copied, setCopied] = useState(false);
    const apiKey = "sk_live_" + Math.random().toString(36).substring(2, 15);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleContinue = () => {
        localStorage.setItem("onboarding_integration", JSON.stringify({ method, apiKey }));
        router.push("/onboarding/test");
    };

    return (
        <OnboardingLayout currentStep={5}>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Integration Setup</h1>
                    <p className="text-slate-600">Choose how you'll create invoices</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <OptionCard
                            title="API Integration"
                            description="Full programmatic access for developers"
                            icon={Code}
                            selected={method === "api"}
                            onClick={() => setMethod("api")}
                        />
                        <OptionCard
                            title="Manual Entry"
                            description="Create invoices through dashboard. Perfect for getting started."
                            icon={MousePointerClick}
                            selected={method === "manual"}
                            onClick={() => setMethod("manual")}
                            recommended
                        />
                        <OptionCard
                            title="Excel Upload"
                            description="Upload invoices in bulk using spreadsheets"
                            icon={FileSpreadsheet}
                            selected={method === "excel"}
                            onClick={() => setMethod("excel")}
                        />
                    </div>

                    {/* Integration Details */}
                    {method === "api" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                        >
                            <Card className="p-6 border-amber-200 bg-amber-50/50">
                                <h3 className="font-semibold text-slate-900 mb-4">Your API Key</h3>
                                <div className="bg-white p-4 rounded-lg mb-4 flex items-center justify-between">
                                    <code className="text-sm font-mono">{apiKey}</code>
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 hover:bg-slate-100 rounded transition-colors"
                                    >
                                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <Link href="/docs/api" className="text-sm text-amber-600 hover:underline">
                                    View API Documentation →
                                </Link>
                            </Card>
                        </motion.div>
                    )}

                    {method === "manual" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                        >
                            <Card className="p-6 border-green-200 bg-green-50/50">
                                <h3 className="font-semibold text-slate-900 mb-2">Great choice!</h3>
                                <p className="text-sm text-slate-600">
                                    You can create invoices directly from your dashboard. We'll show you how in the next step.
                                </p>
                            </Card>
                        </motion.div>
                    )}

                    {method === "excel" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                        >
                            <Card className="p-6 border-blue-200 bg-blue-50/50">
                                <h3 className="font-semibold text-slate-900 mb-4">Excel Template</h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    Download our Excel template to start uploading invoices in bulk.
                                </p>
                                <Button variant="outline" size="sm">
                                    Download Template
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4">
                        <Link href="/onboarding/preferences">
                            <Button variant="outline">Back</Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500">Step 4 of 5</span>
                            <Button
                                onClick={handleContinue}
                                disabled={!method}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </OnboardingLayout>
    );
}
