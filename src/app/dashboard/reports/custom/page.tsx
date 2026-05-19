"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    FileText,
    Users,
    ShieldCheck,
    BarChart2,
    ScrollText,
    ArrowRight,
    Check,
    Download,
    Loader2,
    Trash2,
    RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { savedReports } from "@/lib/mockData/analytics";
import { cn } from "@/lib/utils";

const reportTypes = [
    { id: "invoice-summary", name: "Invoice Summary", icon: FileText, description: "Summary of all invoices in period" },
    { id: "customer-activity", name: "Customer Activity", icon: Users, description: "Customer transaction history" },
    { id: "tax-compliance", name: "Tax Compliance", icon: ShieldCheck, description: "ZATCA compliance metrics" },
    { id: "performance", name: "Performance Metrics", icon: BarChart2, description: "Processing times and success rates" },
    { id: "audit-trail", name: "Audit Trail", icon: ScrollText, description: "Complete activity log" },
];

const formats = [
    { id: "pdf", name: "PDF", description: "Formatted document" },
    { id: "excel", name: "Excel", description: "With formulas" },
    { id: "csv", name: "CSV", description: "Raw data" },
];

export default function CustomReportsPage() {
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [format, setFormat] = useState("pdf");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        await new Promise((r) => setTimeout(r, 2000));
        setIsGenerating(false);
        setIsComplete(true);
    };

    const resetForm = () => {
        setStep(1);
        setSelectedType(null);
        setFormat("pdf");
        setIsComplete(false);
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 max-w-4xl"
            >
                {/* Header */}
                <div>
                    <Link
                        href="/dashboard/reports"
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600 mb-2"
                    >
                        <ArrowLeft size={16} />
                        Back to Reports
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">Custom Report Builder</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Create customized reports for your needs
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                step > s && "bg-green-500 text-white",
                                step === s && "bg-amber-500 text-white",
                                step < s && "bg-slate-200 text-slate-500"
                            )}>
                                {step > s ? <Check size={16} /> : s}
                            </div>
                            {s < 4 && (
                                <div className={cn(
                                    "flex-1 h-1 mx-2",
                                    step > s ? "bg-green-500" : "bg-slate-200"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <Card className="border-slate-200">
                    <CardContent className="pt-6">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Select Type */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-lg font-semibold mb-4">Select Report Type</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {reportTypes.map((type) => {
                                            const Icon = type.icon;
                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setSelectedType(type.id)}
                                                    className={cn(
                                                        "p-4 rounded-lg border-2 text-left transition-all",
                                                        selectedType === type.id
                                                            ? "border-amber-500 bg-amber-50"
                                                            : "border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-lg flex items-center justify-center",
                                                            selectedType === type.id ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"
                                                        )}>
                                                            <Icon size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{type.name}</p>
                                                            <p className="text-xs text-slate-500">{type.description}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Configure */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <h2 className="text-lg font-semibold mb-4">Configure Parameters</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Start Date</Label>
                                            <Input type="date" className="mt-1" defaultValue="2026-01-01" />
                                        </div>
                                        <div>
                                            <Label>End Date</Label>
                                            <Input type="date" className="mt-1" defaultValue="2026-01-23" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Invoice Status</Label>
                                        <select className="w-full h-10 px-3 mt-1 rounded-md border border-slate-200">
                                            <option value="all">All Statuses</option>
                                            <option value="cleared">Cleared</option>
                                            <option value="pending">Pending</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Group By</Label>
                                        <select className="w-full h-10 px-3 mt-1 rounded-md border border-slate-200">
                                            <option value="day">Day</option>
                                            <option value="week">Week</option>
                                            <option value="month">Month</option>
                                            <option value="quarter">Quarter</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Format */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-lg font-semibold mb-4">Choose Output Format</h2>
                                    <div className="grid grid-cols-3 gap-4">
                                        {formats.map((f) => (
                                            <button
                                                key={f.id}
                                                onClick={() => setFormat(f.id)}
                                                className={cn(
                                                    "p-4 rounded-lg border-2 text-center transition-all",
                                                    format === f.id
                                                        ? "border-amber-500 bg-amber-50"
                                                        : "border-slate-200 hover:border-slate-300"
                                                )}
                                            >
                                                <p className="font-medium">{f.name}</p>
                                                <p className="text-xs text-slate-500">{f.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Generate */}
                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="text-center py-8"
                                >
                                    {isGenerating && (
                                        <div>
                                            <Loader2 size={48} className="text-amber-500 animate-spin mx-auto mb-4" />
                                            <p className="text-lg font-medium">Generating Report...</p>
                                            <p className="text-sm text-slate-500">This may take a moment</p>
                                        </div>
                                    )}
                                    {!isGenerating && !isComplete && (
                                        <div>
                                            <FileText size={48} className="text-amber-500 mx-auto mb-4" />
                                            <p className="text-lg font-medium mb-2">Ready to Generate</p>
                                            <p className="text-sm text-slate-500 mb-6">
                                                Your {reportTypes.find(t => t.id === selectedType)?.name} report is configured
                                            </p>
                                            <Button onClick={handleGenerate} className="bg-amber-500 hover:bg-amber-600 text-white">
                                                Generate Report
                                            </Button>
                                        </div>
                                    )}
                                    {isComplete && (
                                        <div>
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                            >
                                                <Check size={32} className="text-green-600" />
                                            </motion.div>
                                            <p className="text-lg font-medium mb-2">Report Ready!</p>
                                            <div className="flex justify-center gap-2">
                                                <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                                                    <Download size={16} />
                                                    Download {format.toUpperCase()}
                                                </Button>
                                                <Button variant="outline" onClick={resetForm}>
                                                    Create Another
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Navigation */}
                {step < 4 && (
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                            disabled={step === 1}
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Previous
                        </Button>
                        <Button
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && !selectedType}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            Next
                            <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </div>
                )}

                {/* Saved Reports */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>Saved Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {savedReports.map((report) => (
                                <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm">{report.name}</p>
                                        <p className="text-xs text-slate-500">
                                            Generated {report.createdAt.toLocaleDateString()} • {report.format.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm">
                                            <Download size={14} />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <RefreshCw size={14} />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-600">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </DashboardLayout>
    );
}
