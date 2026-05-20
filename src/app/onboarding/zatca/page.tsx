"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cloud, CheckCircle2, Loader2, Shield, AlertCircle } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { zatcaOnboard, type OnboardResponse } from "@/lib/api";

export default function OnboardingZATCAPage() {
    const router = useRouter();
    const [environment, setEnvironment] = useState<"sandbox" | "production">("sandbox");
    const [step, setStep] = useState<"select" | "company-info" | "otp-request" | "otp-verify" | "generating" | "complete" | "error">("select");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [csidData, setCsidData] = useState<OnboardResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Company info from previous step
    const [companyInfo, setCompanyInfo] = useState({
        organization_name: "",
        tax_id: "",
        email: ""
    });

    // Load company info from localStorage
    useEffect(() => {
        const savedCompany = localStorage.getItem("onboarding_company");
        if (savedCompany) {
            try {
                const data = JSON.parse(savedCompany);
                setCompanyInfo({
                    organization_name: data.name || data.organization_name || "",
                    tax_id: data.taxId || data.tax_id || "",
                    email: data.email || "company@example.com"
                });
            } catch {
                // Use defaults
            }
        }
    }, []);

    // ZATCA does not expose an "issue OTP" API — taxpayers have to log into
    // their own Fatoora portal at fatoora.zatca.gov.sa, choose the EGS unit
    // they want to register, and copy the 6-digit code displayed there. This
    // handler just moves the wizard forward; the OTP entered is sent later
    // with the real /compliance call.
    const handleRequestOTP = () => {
        setStep("otp-verify");
    };

    const handleVerifyOTP = async () => {
        setIsProcessing(true);
        setStep("generating");
        setError(null);

        try {
            // Call the real ZATCA onboard API
            const response = await zatcaOnboard({
                organization_name: companyInfo.organization_name || "Demo Company",
                tax_id: companyInfo.tax_id || "310122393500003",
                business_category: "General",
                otp_code: otp.join("")
            });

            if (response.success && response.data) {
                setCsidData(response.data);
                setStep("complete");
            } else {
                // error.detail can come back as an object from FastAPI (e.g.
                // when the real backend bubbles a structured failure body).
                // Coerce it to a readable string so we never render an object
                // as a React child.
                const detail = response.error?.detail as unknown;
                const message =
                    typeof detail === "string"
                        ? detail
                        : detail && typeof detail === "object"
                            ? (detail as { message?: string }).message ??
                              JSON.stringify(detail)
                            : "Failed to generate CSID";
                setError(message);
                setStep("error");
            }
        } catch (err) {
            const msg =
                err instanceof Error
                    ? err.message
                    : typeof err === "object" && err !== null
                        ? JSON.stringify(err)
                        : "Network error";
            setError(msg);
            setStep("error");
        }

        setIsProcessing(false);
    };

    const handleContinue = () => {
        // Save CSID data to localStorage
        if (csidData) {
            localStorage.setItem("zatca_csid", JSON.stringify({
                csid: csidData.csid,
                secret: csidData.secret,
                issued_at: csidData.issued_at,
                expires_at: csidData.expires_at,
                environment
            }));
        }
        localStorage.setItem("onboarding_zatca", JSON.stringify({ environment, verified: true }));
        router.push("/onboarding/preferences");
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    return (
        <OnboardingLayout currentStep={3}>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">ZATCA Connection</h1>
                    <p className="text-slate-600">Connect to ZATCA for e-invoice clearance</p>
                </div>

                <AnimatePresence mode="wait">
                    {step === "select" && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <OptionCard
                                    title="Sandbox Environment"
                                    description="Test your integration safely. Switch to production anytime."
                                    icon={Cloud}
                                    selected={environment === "sandbox"}
                                    onClick={() => setEnvironment("sandbox")}
                                    recommended
                                />
                                <OptionCard
                                    title="Production Environment"
                                    description="Go live immediately with valid credentials."
                                    icon={Shield}
                                    selected={environment === "production"}
                                    onClick={() => setEnvironment("production")}
                                    badge="Requires valid credentials"
                                />
                            </div>

                            <div className="flex justify-between pt-4">
                                <Link href="/onboarding/company">
                                    <Button variant="outline">Back</Button>
                                </Link>
                                <Button
                                    onClick={() => setStep("otp-request")}
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                                >
                                    Continue
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === "otp-request" && (
                        <motion.div
                            key="otp-request"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <Card className="p-8 border-slate-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">Generate OTP in your Fatoora portal</h2>
                                        <p className="text-sm text-slate-500">
                                            ZATCA does not issue OTPs through us — fetch one from their portal first.
                                        </p>
                                    </div>
                                </div>

                                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 mb-6">
                                    <li>
                                        Open{" "}
                                        <a
                                            href="https://fatoora.zatca.gov.sa"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-amber-600 hover:underline font-medium"
                                        >
                                            fatoora.zatca.gov.sa
                                        </a>{" "}
                                        and sign in with your ERAD / TIN credentials.
                                    </li>
                                    <li>
                                        Choose <strong>Onboard New Solution Unit / Device</strong>.
                                    </li>
                                    <li>
                                        Enter the EGS unit details and click <strong>Generate OTP</strong> —
                                        ZATCA will show a 6-digit code on screen, valid for ~60 minutes.
                                    </li>
                                    <li>
                                        Copy that OTP and paste it on the next step. We'll generate a
                                        CSR, post it to <code className="bg-slate-100 px-1 rounded">/compliance</code>,
                                        and store the returned CSID.
                                    </li>
                                </ol>

                                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg mb-6 text-xs text-slate-600">
                                    <strong>Sandbox shortcut:</strong> on the{" "}
                                    <a
                                        href="https://sandbox.zatca.gov.sa/IntegrationSandbox"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-600 hover:underline"
                                    >
                                        Integration Sandbox
                                    </a>{" "}
                                    you can request a sample OTP without a real Fatoora account — it's
                                    valid only against the developer-portal URL.
                                </div>

                                {companyInfo.organization_name && (
                                    <div className="bg-slate-100 p-3 rounded-lg mb-6 text-sm">
                                        <p className="text-slate-600">
                                            Onboarding{" "}
                                            <strong>{companyInfo.organization_name}</strong>
                                            {companyInfo.tax_id && (
                                                <span className="text-slate-500"> • VAT {companyInfo.tax_id}</span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    onClick={handleRequestOTP}
                                    className="bg-amber-500 hover:bg-amber-600 text-white w-full"
                                >
                                    I have the OTP — continue
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {step === "otp-verify" && (
                        <motion.div
                            key="otp-verify"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <Card className="p-8 border-slate-200 text-center">
                                <h2 className="text-xl font-semibold mb-4">Enter OTP from Fatoora portal</h2>
                                <p className="text-sm text-slate-600 mb-4">
                                    Paste the 6-digit code from fatoora.zatca.gov.sa. We'll generate a
                                    CSR (secp256k1) and POST it to ZATCA's <code>/compliance</code> endpoint.
                                </p>
                                <div className="flex justify-center gap-2 mb-6">
                                    {otp.map((digit, i) => (
                                        <Input
                                            key={i}
                                            value={digit}
                                            onChange={(e) => {
                                                const newOtp = [...otp];
                                                newOtp[i] = e.target.value.slice(-1);
                                                setOtp(newOtp);
                                                // Auto-focus next input
                                                if (e.target.value && i < 5) {
                                                    const nextInput = document.querySelector<HTMLInputElement>(
                                                        `input[data-index="${i + 1}"]`
                                                    );
                                                    nextInput?.focus();
                                                }
                                            }}
                                            data-index={i}
                                            maxLength={1}
                                            className="w-12 h-12 text-center text-lg font-semibold"
                                        />
                                    ))}
                                </div>
                                <Button
                                    onClick={handleVerifyOTP}
                                    disabled={otp.join("").length !== 6}
                                    className="bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                    Verify & Generate CSID
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {step === "generating" && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <Card className="p-8 border-slate-200 text-center">
                                <Loader2 className="w-16 h-16 mx-auto text-amber-500 animate-spin mb-4" />
                                <h2 className="text-xl font-semibold mb-4">Generating CSID...</h2>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <p>⚡ Generating cryptographic keys...</p>
                                    <p>🔐 Requesting certificate from ZATCA...</p>
                                    <p>📦 Installing certificate...</p>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {step === "error" && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <Card className="p-8 border-red-200 bg-red-50 text-center">
                                <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-red-900 mb-2">Connection Failed</h2>
                                <p className="text-red-700 mb-6">{error}</p>
                                <div className="flex justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep("otp-verify")}
                                    >
                                        Try Again
                                    </Button>
                                    <Button
                                        onClick={() => setStep("select")}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        Start Over
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {step === "complete" && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <Card className="p-8 border-green-200 bg-green-50 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                    className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4"
                                >
                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-green-900 mb-2">Connection Established!</h2>
                                <p className="text-green-700 mb-6">Your company is now connected to ZATCA</p>
                                <div className="bg-white p-4 rounded-lg text-left mb-6">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-slate-600">Environment:</span>
                                        <span className="font-medium">{environment === "sandbox" ? "Sandbox" : "Production"}</span>
                                        <span className="text-slate-600">Status:</span>
                                        <span className="text-green-600 font-medium">Active</span>
                                        <span className="text-slate-600">Issued:</span>
                                        <span className="font-medium">{csidData ? formatDate(csidData.issued_at) : "Today"}</span>
                                        <span className="text-slate-600">Expires:</span>
                                        <span className="font-medium">{csidData ? formatDate(csidData.expires_at) : "365 days"}</span>
                                    </div>
                                    {csidData && (
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            <p className="text-xs text-slate-500 mb-2">CSID (first 20 chars):</p>
                                            <code className="text-xs bg-slate-100 p-2 rounded block break-all">
                                                {csidData.csid.substring(0, 20)}...
                                            </code>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={handleContinue}
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                                >
                                    Continue to Preferences
                                </Button>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </OnboardingLayout>
    );
}
