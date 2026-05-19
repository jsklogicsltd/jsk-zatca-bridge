"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle, FileText, Settings, Zap } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";

export default function OnboardingWelcomePage() {
    return (
        <OnboardingLayout currentStep={1} showProgress={false}>
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-8"
                >
                    {/* Hero */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                            <CheckCircle className="w-12 h-12 text-white" />
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                            Welcome to ZATCA Bridge
                        </h1>

                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Let's get your company set up for tax compliance in just a few minutes
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        {[
                            { icon: FileText, title: "Simple Setup", desc: "5-minute guided process" },
                            { icon: Settings, title: "Full Control", desc: "Customize to your needs" },
                            { icon: Zap, title: "Quick Start", desc: "Start invoicing today" },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm"
                            >
                                <div className="w-12 h-12 mx-auto bg-amber-500/10 rounded-lg flex items-center justify-center mb-3">
                                    <feature.icon className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                                <p className="text-sm text-slate-500">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/onboarding/company">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white h-12 px-8 shadow-lg hover:shadow-xl"
                            >
                                Let's Get Started
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button
                                size="lg"
                                variant="ghost"
                                className="text-slate-600"
                            >
                                Skip for now
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Progress Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center justify-center gap-2 text-sm text-slate-500"
                    >
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <div key={step} className="w-2 h-2 bg-slate-300 rounded-full" />
                            ))}
                        </div>
                        <span>5 simple steps</span>
                    </motion.div>
                </motion.div>
            </div>
        </OnboardingLayout>
    );
}
