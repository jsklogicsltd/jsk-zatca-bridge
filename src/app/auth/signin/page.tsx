"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormInput } from "@/components/auth/FormInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialButton } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { signInSchema, type SignInFormData } from "@/lib/validationSchemas";
import { login } from "@/lib/api";

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            rememberMe: false,
        },
    });

    const onSubmit = async (data: SignInFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await login({
                email: data.email,
                password: data.password,
            });

            if (response.success && response.data) {
                // Successfully logged in, redirect to dashboard
                router.push("/dashboard");
            } else {
                // Show error message
                setError(response.error?.detail || "Login failed. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please check your connection.");
        }

        setIsLoading(false);
    };

    const handleSocialLogin = (provider: string) => {
        console.log(`${provider} login clicked`);
        alert(`${provider} login coming soon!`);
    };

    return (
        <AuthLayout>
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                                <AlertCircle className="w-4 h-4" />
                                {error}
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

                        {/* Password */}
                        <PasswordInput
                            {...register("password")}
                            id="password"
                            label="Password"
                            placeholder="Enter your password"
                            error={errors.password?.message}
                            autoComplete="current-password"
                        />

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="rememberMe"
                                    {...register("rememberMe")}
                                />
                                <label
                                    htmlFor="rememberMe"
                                    className="text-sm text-slate-600 cursor-pointer select-none"
                                >
                                    Remember me
                                </label>
                            </div>
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <Separator />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">or continue with</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-3">
                            <SocialButton provider="google" onClick={() => handleSocialLogin("Google")} />
                            <SocialButton provider="microsoft" onClick={() => handleSocialLogin("Microsoft")} />
                        </div>

                        {/* Sign Up Link */}
                        <p className="text-center text-sm text-slate-600">
                            Don't have an account?{" "}
                            <Link
                                href="/auth/signup"
                                className="font-medium text-amber-600 hover:text-amber-700"
                            >
                                Sign up
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
