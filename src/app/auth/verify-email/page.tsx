"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [email] = useState("user@company.com"); // In real app, get from route params or state

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResend = async () => {
        if (countdown > 0) return;

        setIsResending(true);

        // Simulate API call
        console.log("Resending verification email to:", email);

        setTimeout(() => {
            setIsResending(false);
            setCountdown(60); // Start 60 second countdown
            alert("Verification email sent! (UI only - no backend)");
        }, 1500);
    };

    return (
        <AuthLayout>
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="space-y-1 text-center">
                    <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4"
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Mail className="h-8 w-8 text-amber-600" />
                    </motion.div>

                    <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
                    <CardDescription>
                        We've sent a verification link to your email address
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center space-y-3">
                        <p className="text-sm text-slate-600">
                            Please check your inbox at{" "}
                            <span className="font-medium text-slate-900">{email}</span> and click the
                            verification link to activate your account.
                        </p>

                        <div className="pt-4 space-y-2">
                            <p className="text-xs text-slate-500">
                                Didn't receive the email? Check your spam folder or request a new one.
                            </p>
                        </div>
                    </div>

                    {/* Resend Button */}
                    <Button
                        onClick={handleResend}
                        variant="outline"
                        className="w-full"
                        disabled={isResending || countdown > 0}
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : countdown > 0 ? (
                            `Resend in ${countdown}s`
                        ) : (
                            "Resend Verification Email"
                        )}
                    </Button>

                    {/* Change Email Link */}
                    <div className="text-center">
                        <Link
                            href="/auth/signup"
                            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                        >
                            Change email address
                        </Link>
                    </div>

                    {/* Additional Help */}
                    <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs text-center text-slate-500">
                            Need help?{" "}
                            <Link href="/support" className="text-amber-600 hover:text-amber-700">
                                Contact Support
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
