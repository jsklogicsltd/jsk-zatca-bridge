"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Building2, Hash, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormInput } from "@/components/auth/FormInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { SocialButton } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { signUpSchema, type SignUpFormData } from "@/lib/validationSchemas";
import { signup } from "@/lib/api";

export default function SignUpPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        control,
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            acceptTerms: false,
        },
    });

    const password = watch("password");

    const onSubmit = async (data: SignUpFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await signup({
                email: data.email,
                password: data.password,
                confirm_password: data.confirmPassword,
                company_name: data.companyName,
                tax_id: data.vatNumber,
            });

            if (response.success && response.data) {
                setSuccess(true);
                // Redirect to onboarding after short delay
                setTimeout(() => {
                    router.push("/onboarding");
                }, 1500);
            } else {
                setError(response.error?.detail || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please check your connection.");
        }

        setIsLoading(false);
    };

    const handleSocialSignup = (provider: string) => {
        console.log(`${provider} signup clicked`);
        alert(`${provider} signup coming soon!`);
    };

    if (success) {
        return (
            <AuthLayout>
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Account Created!</h2>
                        <p className="text-slate-600 mb-4">
                            Redirecting you to the onboarding wizard...
                        </p>
                        <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
                    </CardContent>
                </Card>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>
                        Get started with ZATCA Bridge today
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

                        {/* Company Name */}
                        <FormInput
                            {...register("companyName")}
                            id="companyName"
                            label="Company Name"
                            type="text"
                            placeholder="Your Company Ltd."
                            icon={Building2}
                            error={errors.companyName?.message}
                            autoComplete="organization"
                        />

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
                        <div>
                            <PasswordInput
                                {...register("password")}
                                id="password"
                                label="Password"
                                placeholder="Create a strong password"
                                error={errors.password?.message}
                                autoComplete="new-password"
                            />
                            <PasswordStrengthMeter password={password || ""} />
                        </div>

                        {/* Confirm Password */}
                        <PasswordInput
                            {...register("confirmPassword")}
                            id="confirmPassword"
                            label="Confirm Password"
                            placeholder="Re-enter your password"
                            error={errors.confirmPassword?.message}
                            autoComplete="new-password"
                        />

                        {/* VAT Number */}
                        <FormInput
                            {...register("vatNumber")}
                            id="vatNumber"
                            label="VAT Number"
                            type="text"
                            placeholder="300000000000003"
                            icon={Hash}
                            error={errors.vatNumber?.message}
                            maxLength={15}
                        />

                        {/* Terms Checkbox */}
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <Controller
                                    name="acceptTerms"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="acceptTerms"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="mt-0.5"
                                        />
                                    )}
                                />
                                <label
                                    htmlFor="acceptTerms"
                                    className="text-sm text-slate-600 cursor-pointer select-none leading-relaxed"
                                >
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-amber-600 hover:text-amber-700 font-medium">
                                        Terms and Conditions
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-amber-600 hover:text-amber-700 font-medium">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {errors.acceptTerms && (
                                <p className="text-xs text-red-600">{errors.acceptTerms.message}</p>
                            )}
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
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
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

                        {/* Social Signup */}
                        <div className="grid grid-cols-2 gap-3">
                            <SocialButton provider="google" onClick={() => handleSocialSignup("Google")} />
                            <SocialButton provider="microsoft" onClick={() => handleSocialSignup("Microsoft")} />
                        </div>

                        {/* Sign In Link */}
                        <p className="text-center text-sm text-slate-600">
                            Already have an account?{" "}
                            <Link
                                href="/auth/signin"
                                className="font-medium text-amber-600 hover:text-amber-700"
                            >
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
