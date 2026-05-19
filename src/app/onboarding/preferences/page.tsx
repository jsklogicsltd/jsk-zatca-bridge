"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Settings, Bell, Hash, DollarSign } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface PreferencesFormData {
    invoicePrefix: string;
    startingNumber: number;
    paymentTerms: string;
    emailCustomer: boolean;
    emailClearance: boolean;
    emailFailed: boolean;
    emailExpiry: boolean;
}

export default function OnboardingPreferencesPage() {
    const router = useRouter();
    const { register, handleSubmit, watch } = useForm<PreferencesFormData>({
        defaultValues: {
            invoicePrefix: "INV",
            startingNumber: 1,
            paymentTerms: "Net 30",
            emailCustomer: true,
            emailClearance: true,
            emailFailed: true,
            emailExpiry: true,
        },
    });

    const prefix = watch("invoicePrefix");
    const startingNumber = watch("startingNumber");

    const onSubmit = (data: PreferencesFormData) => {
        localStorage.setItem("onboarding_preferences", JSON.stringify(data));
        router.push("/onboarding/integration");
    };

    return (
        <OnboardingLayout currentStep={4}>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Invoice Preferences</h1>
                    <p className="text-slate-600">Customize your default invoice settings</p>
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    {/* Invoice Numbering */}
                    <Card className="p-6 border-slate-200">
                        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Hash size={20} className="text-amber-600" />
                            Invoice Numbering
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="prefix">Prefix</Label>
                                    <Input
                                        id="prefix"
                                        {...register("invoicePrefix")}
                                        placeholder="INV"
                                        maxLength={5}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="startingNumber">Starting Number</Label>
                                    <Input
                                        id="startingNumber"
                                        type="number"
                                        {...register("startingNumber", { valueAsNumber: true })}
                                        min={1}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-sm text-amber-700">
                                    Preview: <span className="font-mono font-semibold">{prefix}-{String(startingNumber).padStart(5, '0')}</span>
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Payment Terms */}
                    <Card className="p-6 border-slate-200">
                        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <DollarSign size={20} className="text-amber-600" />
                            Default Payment Terms
                        </h2>
                        <div>
                            <Label htmlFor="paymentTerms">Payment Terms</Label>
                            <select
                                id="paymentTerms"
                                {...register("paymentTerms")}
                                className="w-full h-10 px-3 mt-1 rounded-md border border-slate-200"
                            >
                                <option value="Due on Receipt">Due on Receipt</option>
                                <option value="Net 15">Net 15</option>
                                <option value="Net 30">Net 30</option>
                                <option value="Net 45">Net 45</option>
                                <option value="Net 60">Net 60</option>
                            </select>
                        </div>
                    </Card>

                    {/* Email Notifications */}
                    <Card className="p-6 border-slate-200">
                        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Bell size={20} className="text-amber-600" />
                            Email Notifications
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Checkbox id="emailCustomer" {...register("emailCustomer")} />
                                <label htmlFor="emailCustomer" className="text-sm text-slate-700 cursor-pointer">
                                    Send invoice copies to customers
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="emailClearance" {...register("emailClearance")} />
                                <label htmlFor="emailClearance" className="text-sm text-slate-700 cursor-pointer">
                                    Clearance confirmations
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="emailFailed" {...register("emailFailed")} />
                                <label htmlFor="emailFailed" className="text-sm text-slate-700 cursor-pointer">
                                    Failed submission alerts
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="emailExpiry" {...register("emailExpiry")} />
                                <label htmlFor="emailExpiry" className="text-sm text-slate-700 cursor-pointer">
                                    CSID expiry warnings
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4">
                        <Link href="/onboarding/zatca">
                            <Button type="button" variant="outline">Back</Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500">Step 3 of 5</span>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </motion.form>
            </div>
        </OnboardingLayout>
    );
}
