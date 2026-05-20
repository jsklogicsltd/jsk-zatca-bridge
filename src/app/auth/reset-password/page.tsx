"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { changePassword } from "@/lib/api";

const resetSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) });

    const onSubmit = async (data: ResetFormData) => {
        setIsLoading(true);
        setError(null);

        const response = await changePassword({
            current_password: "",
            new_password: data.password,
            confirm_password: data.confirmPassword,
        });

        setIsLoading(false);
        if (response.success) {
            setSuccess(true);
            setTimeout(() => router.push("/dashboard"), 1500);
        } else {
            setError(response.error?.detail || "Could not update password.");
        }
    };

    return (
        <AuthLayout>
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Set a New Password</CardTitle>
                    <CardDescription>
                        Pick a new password for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center py-6 space-y-3">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full">
                                <CheckCircle2 className="h-7 w-7 text-green-600" />
                            </div>
                            <p className="text-sm text-slate-600">
                                Password updated. Redirecting…
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                            <PasswordInput
                                {...register("password")}
                                id="password"
                                label="New Password"
                                placeholder="Enter a new password"
                                error={errors.password?.message}
                                autoComplete="new-password"
                            />
                            <PasswordInput
                                {...register("confirmPassword")}
                                id="confirmPassword"
                                label="Confirm Password"
                                placeholder="Re-enter your password"
                                error={errors.confirmPassword?.message}
                                autoComplete="new-password"
                            />
                            <Button
                                type="submit"
                                className="w-full h-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating…
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
