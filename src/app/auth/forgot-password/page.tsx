"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormInput } from "@/components/auth/FormInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validationSchemas";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        setErrorMessage(null);

        const redirectTo =
            typeof window !== "undefined"
                ? `${window.location.origin}/auth/reset-password`
                : undefined;

        const response = await requestPasswordReset(data.email, redirectTo);
        setIsLoading(false);
        if (response.success) {
            setIsSuccess(true);
        } else {
            setErrorMessage(response.error?.detail || "Could not send reset email.");
        }
    };

    return (
        <AuthLayout>
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
                    <CardDescription>
                        {isSuccess
                            ? "We've sent you a reset link"
                            : "Enter your email to receive a password reset link"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-center py-8 space-y-6"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                    delay: 0.1
                                }}
                                className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full"
                            >
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </motion.div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Check Your Email
                                </h3>
                                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                                    We've sent a password reset link to{" "}
                                    <span className="font-medium text-slate-900">{getValues("email")}</span>
                                </p>
                                <p className="text-xs text-slate-500 pt-2">
                                    Didn't receive the email? Check your spam folder or try again.
                                </p>
                            </div>

                            <Button
                                onClick={() => setIsSuccess(false)}
                                variant="outline"
                                className="w-full"
                            >
                                Try Another Email
                            </Button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {errorMessage && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    {errorMessage}
                                </div>
                            )}
                            {/* Email */}
                            <FormInput
                                {...register("email")}
                                id="email"
                                label="Email Address"
                                type="email"
                                placeholder="you@company.com"
                                icon={Mail}
                                error={errors.email?.message}
                                autoComplete="email"
                            />

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending link...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>

                            {/* Back to Sign In */}
                            <Link
                                href="/auth/signin"
                                className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-amber-600 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Back to sign in
                            </Link>
                        </form>
                    )}
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
