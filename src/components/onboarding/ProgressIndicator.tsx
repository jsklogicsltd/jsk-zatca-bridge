"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
    stepLabels: string[];
}

export function ProgressIndicator({ currentStep, totalSteps, stepLabels }: ProgressIndicatorProps) {
    return (
        <div className="w-full max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-between">
                {stepLabels.map((label, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <div key={label} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <motion.div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all",
                                        isCompleted && "bg-green-500 border-green-500 text-white",
                                        isCurrent && "bg-amber-500 border-amber-500 text-white",
                                        !isCompleted && !isCurrent && "bg-white border-slate-300 text-slate-400"
                                    )}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {isCompleted ? "✓" : stepNumber}
                                </motion.div>
                                <span className={cn(
                                    "text-xs mt-2 font-medium hidden sm:block",
                                    isCurrent ? "text-amber-600" : "text-slate-500"
                                )}>
                                    {label}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {index < totalSteps - 1 && (
                                <div className="flex-1 h-0.5 mx-2 bg-slate-200 relative">
                                    <motion.div
                                        className="absolute inset-0 bg-green-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: isCompleted ? "100%" : 0 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
