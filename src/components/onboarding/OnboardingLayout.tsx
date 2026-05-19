"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgressIndicator } from "./ProgressIndicator";

interface OnboardingLayoutProps {
    children: ReactNode;
    currentStep: number;
    showProgress?: boolean;
}

const stepLabels = ["Welcome", "Company", "ZATCA", "Preferences", "Integration", "Test"];

export function OnboardingLayout({ children, currentStep, showProgress = true }: OnboardingLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-slate-50">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-900 font-semibold">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Z</span>
                        </div>
                        ZATCA Bridge
                    </Link>
                    <Link href="/dashboard" className="text-sm text-slate-600 hover:text-amber-600 flex items-center gap-1">
                        <ArrowLeft size={14} />
                        Exit Setup
                    </Link>
                </div>
            </header>

            {/* Progress Indicator */}
            {showProgress && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <ProgressIndicator
                        currentStep={currentStep}
                        totalSteps={stepLabels.length}
                        stepLabels={stepLabels}
                    />
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
