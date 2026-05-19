"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OTPInput } from "./OTPInput";

interface RenewalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = "otp" | "generating" | "success";

export function RenewalModal({ isOpen, onClose, onSuccess }: RenewalModalProps) {
    const [step, setStep] = useState<Step>("otp");
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState("");

    const handleOTPComplete = async (otp: string) => {
        setStep("generating");

        // Simulate generation process
        const messages = [
            "Validating OTP...",
            "Generating key pair...",
            "Creating certificate request...",
            "Submitting to ZATCA...",
            "Receiving certificate...",
            "Storing securely...",
        ];

        for (let i = 0; i <= 100; i += 20) {
            await new Promise((r) => setTimeout(r, 500));
            setProgress(i);
            setProgressMessage(messages[Math.floor(i / 20)] || "Finalizing...");
        }

        setStep("success");
    };

    const handleClose = () => {
        setStep("otp");
        setProgress(0);
        onClose();
    };

    const handleDone = () => {
        setStep("otp");
        setProgress(0);
        onSuccess();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50"
                onClick={step === "success" ? handleDone : undefined}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            >
                {/* Close button */}
                {step === "otp" && (
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                )}

                <AnimatePresence mode="wait">
                    {/* Step 1: OTP Verification */}
                    {step === "otp" && (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield size={32} className="text-amber-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                Verify Your Identity
                            </h2>
                            <p className="text-sm text-slate-500 mb-6">
                                Enter the 6-digit OTP sent to your registered email
                            </p>

                            <OTPInput onComplete={handleOTPComplete} />

                            <p className="text-xs text-slate-400 mt-4">
                                Didn't receive the code?{" "}
                                <button className="text-amber-600 hover:underline">Resend OTP</button>
                            </p>
                        </motion.div>
                    )}

                    {/* Step 2: Generating */}
                    {step === "generating" && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Loader2 size={32} className="text-amber-600 animate-spin" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                Generating Certificate
                            </h2>
                            <p className="text-sm text-amber-600 mb-6 h-5">
                                {progressMessage}
                            </p>

                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-amber-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">{progress}% complete</p>
                        </motion.div>
                    )}

                    {/* Step 3: Success */}
                    {step === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <CheckCircle size={32} className="text-green-600" />
                            </motion.div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                Certificate Renewed!
                            </h2>
                            <p className="text-sm text-slate-500 mb-2">
                                Your new CSID certificate is now active
                            </p>
                            <p className="text-sm text-green-600 font-medium mb-6">
                                New expiry date: February 23, 2026
                            </p>

                            <Button
                                onClick={handleDone}
                                className="w-full bg-green-500 hover:bg-green-600 text-white"
                            >
                                Done
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
