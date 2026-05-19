"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Building, MapPin } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { saudiCities, businessCategories, monthlyInvoiceRanges } from "@/lib/mockData/onboarding";

interface CompanyFormData {
    legalName: string;
    registrationNumber: string;
    vatNumber: string;
    category: string;
    monthlyInvoices: string;
    building: string;
    street: string;
    district: string;
    city: string;
    postalCode: string;
}

export default function OnboardingCompanyPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, watch } = useForm<CompanyFormData>();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: CompanyFormData) => {
        setIsLoading(true);
        // Save to localStorage
        localStorage.setItem("onboarding_company", JSON.stringify(data));
        setTimeout(() => {
            router.push("/onboarding/zatca");
        }, 500);
    };

    return (
        <OnboardingLayout currentStep={2}>
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Company Information</h1>
                            <p className="text-slate-600">Tell us about your business</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <Card className="p-6 border-slate-200">
                                <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Building size={20} className="text-amber-600" />
                                    Business Details
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="legalName">Company Legal Name *</Label>
                                        <Input
                                            id="legalName"
                                            {...register("legalName", { required: "Company name is required" })}
                                            placeholder="Your Company LLC"
                                            className="mt-1"
                                        />
                                        {errors.legalName && <p className="text-sm text-red-600 mt-1">{errors.legalName.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="registrationNumber">CR Number *</Label>
                                            <Input
                                                id="registrationNumber"
                                                {...register("registrationNumber", { required: "CR number is required" })}
                                                placeholder="1234567890"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="vatNumber">VAT Number *</Label>
                                            <Input
                                                id="vatNumber"
                                                {...register("vatNumber", {
                                                    required: "VAT number is required",
                                                    pattern: { value: /^3\d{14}$/, message: "Must be 15 digits starting with 3" }
                                                })}
                                                placeholder="300123456789003"
                                                maxLength={15}
                                                className="mt-1"
                                            />
                                            {errors.vatNumber && <p className="text-sm text-red-600 mt-1">{errors.vatNumber.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="category">Business Category *</Label>
                                            <select
                                                id="category"
                                                {...register("category", { required: true })}
                                                className="w-full h-10 px-3 mt-1 rounded-md border border-slate-200"
                                            >
                                                <option value="">Select category</option>
                                                {businessCategories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="monthlyInvoices">Monthly Invoices *</Label>
                                            <select
                                                id="monthlyInvoices"
                                                {...register("monthlyInvoices", { required: true })}
                                                className="w-full h-10 px-3 mt-1 rounded-md border border-slate-200"
                                            >
                                                <option value="">Select range</option>
                                                {monthlyInvoiceRanges.map(range => (
                                                    <option key={range.value} value={range.value}>{range.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 border-slate-200">
                                <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <MapPin size={20} className="text-amber-600" />
                                    Company Address
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="building">Building Number *</Label>
                                            <Input
                                                id="building"
                                                {...register("building", { required: true })}
                                                placeholder="1234"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="street">Street Name *</Label>
                                            <Input
                                                id="street"
                                                {...register("street", { required: true })}
                                                placeholder="King Fahd Road"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="district">District *</Label>
                                            <Input
                                                id="district"
                                                {...register("district", { required: true })}
                                                placeholder="Al Olaya"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="city">City *</Label>
                                            <select
                                                id="city"
                                                {...register("city", { required: true })}
                                                className="w-full h-10 px-3 mt-1 rounded-md border border-slate-200"
                                            >
                                                <option value="">Select city</option>
                                                {saudiCities.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="postalCode">Postal Code *</Label>
                                            <Input
                                                id="postalCode"
                                                {...register("postalCode", { required: true })}
                                                placeholder="12345"
                                                maxLength={5}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Country</Label>
                                            <Input
                                                value="Saudi Arabia"
                                                disabled
                                                className="mt-1 bg-slate-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-4">
                                <Link href="/onboarding">
                                    <Button type="button" variant="outline">
                                        Back
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-500">Step 1 of 5</span>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                                    >
                                        {isLoading ? "Saving..." : "Continue"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 border-amber-200 bg-amber-50/50 sticky top-24">
                            <h3 className="font-semibold text-slate-900 mb-3">Why we need this</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex gap-2">
                                    <span className="text-amber-600">•</span>
                                    <span>Required for ZATCA registration</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-amber-600">•</span>
                                    <span>Appears on all invoices</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-amber-600">•</span>
                                    <span>Ensures tax compliance</span>
                                </li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-amber-200">
                                <p className="text-xs text-slate-500">
                                    Need help? <a href="/help" className="text-amber-600 hover:underline">Contact support</a>
                                </p>
                            </div>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </OnboardingLayout>
    );
}
