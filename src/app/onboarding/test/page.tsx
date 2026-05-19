"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, FileText, Download, Sparkles } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OnboardingTestPage() {
    const router = useRouter();
    const [step, setStep] = useState<"choose" | "processing" | "complete">("choose");

    const handleCreateSample = () => {
        setStep("processing");
        setTimeout(() => {
            setStep("complete");
        }, 2500);
    };

    const handleFinish = () => {
        localStorage.setItem("onboarding_completed", "true");
        router.push("/dashboard");
    };

    return (
        <OnboardingLayout currentStep={6}>
            <div className="max-w-3xl mx-auto">
                <AnimatePresence mode="wait">
                    {step === "choose" && (
                        <motion.div
                            key="choose"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Test Your Setup</h1>
                                <p className="text-slate-600">Create a sample invoice to verify everything works</p>
                            </div>

                            <div className="space-y-4">
                                <Card className="p-6 border-slate-200 hover:border-amber-300 transition-colors cursor-pointer" onClick={handleCreateSample}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900 mb-1">Create Sample Invoice</h3>
                                            <p className="text-sm text-slate-600 mb-3">
                                                We'll create a test invoice with sample data and submit it to ZATCA sandbox
                                            </p>
                                            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                                                Create Test Invoice
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6 border-slate-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-6 h-6 text-slate-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900 mb-1">Skip to Dashboard</h3>
                                            <p className="text-sm text-slate-600 mb-3">
                                                I'll create my first invoice later
                                            </p>
                                            <Button variant="outline" onClick={handleFinish}>
                                                Skip this step
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {step === "processing" && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                        >
                            <div className="w-16 h-16 mx-auto mb-6 relative">
                                <motion.div
                                    className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Processing Test Invoice...</h2>
                            <div className="space-y-2 text-sm text-slate-600">
                                <p>✓ Generating invoice</p>
                                <p>✓ Submitting to ZATCA sandbox</p>
                                <p>⏳ Awaiting clearance...</p>
                            </div>
                        </motion.div>
                    )}

                    {step === "complete" && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            {/* Celebration */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <CheckCircle2 className="w-14 h-14 text-white" />
                            </motion.div>

                            <h1 className="text-4xl font-bold text-slate-900 mb-2">You're All Set!</h1>
                            <p className="text-lg text-slate-600 mb-8">Your ZATCA Bridge account is ready to use</p>

                            {/* Summary */}
                            <Card className="p-6 border-green-200 bg-green-50/50 text-left mb-8">
                                <h3 className="font-semibold text-slate-900 mb-4">Setup Complete</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        <span>Company verified</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        <span>ZATCA connected</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        <span>Preferences configured</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        <span>Integration method selected</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        <span>Test invoice cleared ✓</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Test Invoice Details */}
                            <Card className="p-6 border-slate-200 text-left mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-slate-900">Test Invoice Details</h3>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                        Cleared
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-slate-500">Invoice Number</p>
                                        <p className="font-medium">INV-00001</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Amount</p>
                                        <p className="font-medium">SAR 1,150.00</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Customer</p>
                                        <p className="font-medium">Test Customer LLC</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Clearance UUID</p>
                                        <p className="font-medium font-mono text-xs">3fa85f64-5717...</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="mt-4 gap-2">
                                    <Download size={14} />
                                    Download PDF
                                </Button>
                            </Card>

                            {/* CTA */}
                            <Button
                                onClick={handleFinish}
                                size="lg"
                                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg"
                            >
                                Go to Dashboard
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </OnboardingLayout>
    );
}
