"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Plus,
    Trash2,
    User,
    FileText,
    ShoppingCart,
    Send,
    Loader2,
    CheckCircle,
    XCircle,
    Code,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { mockCustomers } from "@/lib/mockData/invoices";
import { cn } from "@/lib/utils";
import { signInvoice, validateXmlWithSdk, type SignedInvoice } from "@/lib/api";

const steps = [
    { id: 1, label: "Customer", icon: User },
    { id: 2, label: "Details", icon: FileText },
    { id: 3, label: "Items", icon: ShoppingCart },
    { id: 4, label: "Review", icon: Send },
];

interface LineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

export default function NewInvoicePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [submitResult, setSubmitResult] = useState<"success" | "error" | null>(null);
    const [signedInvoice, setSignedInvoice] = useState<SignedInvoice | null>(null);
    const [validationResult, setValidationResult] = useState<{
        valid: boolean;
        summary: string;
        errors: string[];
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showXml, setShowXml] = useState(false);

    // Form state
    const [selectedCustomer, setSelectedCustomer] = useState<string>("");
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: "", vatNumber: "", address: "", street: "", city: "" });
    const [customerType, setCustomerType] = useState<"B2B" | "B2C">("B2B");

    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
    const [dueDate, setDueDate] = useState("");
    const [paymentTerms, setPaymentTerms] = useState("net30");
    const [reference, setReference] = useState("");

    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: "1", description: "", quantity: 1, unitPrice: 0, taxRate: 15 },
    ]);

    // Supplier info (would come from settings)
    const supplierInfo = {
        trn: "310122393500003",
        name: "JSK Logics Trading Co.",
        street: "King Fahd Road",
        building_number: "1234",
        city: "Riyadh",
        district: "Al Olaya",
        postal_code: "12345",
        country_code: "SA",
    };

    const addLineItem = () => {
        setLineItems([
            ...lineItems,
            { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0, taxRate: 15 },
        ]);
    };

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter((item) => item.id !== id));
        }
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
        setLineItems(
            lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    const calculateItemTotal = (item: LineItem) => {
        const subtotal = item.quantity * item.unitPrice;
        return subtotal + (subtotal * item.taxRate) / 100;
    };

    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = lineItems.reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate) / 100,
        0
    );
    const total = subtotal + taxAmount;

    const customer = mockCustomers.find((c) => c.id === selectedCustomer);

    const buildInvoicePayload = () => {
        const customerData = customer || {
            name: newCustomer.name,
            vatNumber: newCustomer.vatNumber,
            address: newCustomer.address || "N/A",
        };

        return {
            invoice_type: customerType === "B2B" ? "Tax" as const : "Simplified" as const,
            invoice_number: `INV-${Date.now().toString().slice(-8)}`,
            issue_date: invoiceDate,
            supplier: supplierInfo,
            customer: {
                trn: customerData.vatNumber || "300000000000003",
                name: customerData.name,
                street: newCustomer.street || customerData.address || "Customer Street",
                building_number: "1000",
                city: newCustomer.city || "Riyadh",
                district: "Business District",
                postal_code: "12345",
                country_code: "SA",
            },
            line_items: lineItems.map((item) => ({
                name: item.description,
                quantity: item.quantity,
                price: item.unitPrice,
                vat_rate: item.taxRate,
                tax_code: item.taxRate === 0 ? "Z" : "S",
            })),
            currency_code: "SAR",
        };
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        setSubmitResult(null);

        try {
            const payload = buildInvoicePayload();
            const response = await signInvoice(payload);

            if (response.success && response.data) {
                setSignedInvoice(response.data);
                setSubmitResult("success");

                // Auto-validate with ZATCA SDK
                setIsValidating(true);
                const validationResponse = await validateXmlWithSdk(response.data.signed_xml);
                if (validationResponse.success && validationResponse.data) {
                    setValidationResult({
                        valid: validationResponse.data.valid,
                        summary: validationResponse.data.summary,
                        errors: validationResponse.data.errors,
                    });
                }
                setIsValidating(false);
            } else {
                setError(response.error?.detail || "Failed to sign invoice");
                setSubmitResult("error");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Network error");
            setSubmitResult("error");
        }

        setIsSubmitting(false);
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return selectedCustomer || (isNewCustomer && newCustomer.name && newCustomer.vatNumber);
            case 2:
                return invoiceDate && dueDate;
            case 3:
                return lineItems.every((item) => item.description && item.quantity > 0 && item.unitPrice > 0);
            default:
                return true;
        }
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/dashboard/invoices"
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600"
                    >
                        <ArrowLeft size={16} />
                        Back to Invoices
                    </Link>
                </div>

                <h1 className="text-2xl font-bold text-slate-900">Create New Invoice</h1>

                {/* Progress Steps */}
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;
                        return (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                            isCompleted && "bg-green-500 text-white",
                                            isCurrent && "bg-amber-500 text-white",
                                            !isCompleted && !isCurrent && "bg-slate-200 text-slate-500"
                                        )}
                                    >
                                        {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-xs mt-2",
                                            isCurrent ? "text-amber-600 font-medium" : "text-slate-500"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "flex-1 h-0.5 mx-4",
                                            isCompleted ? "bg-green-500" : "bg-slate-200"
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <Card className="border-slate-200">
                    <CardContent className="pt-6">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Customer */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-lg font-semibold">Customer Information</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <Label>Select Customer</Label>
                                            <select
                                                value={selectedCustomer}
                                                onChange={(e) => {
                                                    setSelectedCustomer(e.target.value);
                                                    setIsNewCustomer(false);
                                                }}
                                                disabled={isNewCustomer}
                                                className="w-full h-10 px-3 mt-1 rounded-md border border-slate-200 bg-white"
                                            >
                                                <option value="">Choose existing customer...</option>
                                                {mockCustomers.map((cust) => (
                                                    <option key={cust.id} value={cust.id}>
                                                        {cust.name} ({cust.vatNumber})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant={isNewCustomer ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    setIsNewCustomer(!isNewCustomer);
                                                    setSelectedCustomer("");
                                                }}
                                            >
                                                <Plus size={14} className="mr-1" />
                                                Add New Customer
                                            </Button>
                                        </div>

                                        {isNewCustomer && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="space-y-4 p-4 bg-slate-50 rounded-lg"
                                            >
                                                <div>
                                                    <Label>Company Name *</Label>
                                                    <Input
                                                        value={newCustomer.name}
                                                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                                        placeholder="Company Ltd."
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>VAT Number (15 digits) *</Label>
                                                    <Input
                                                        value={newCustomer.vatNumber}
                                                        onChange={(e) => setNewCustomer({ ...newCustomer, vatNumber: e.target.value })}
                                                        placeholder="300000000000003"
                                                        maxLength={15}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Street</Label>
                                                        <Input
                                                            value={newCustomer.street}
                                                            onChange={(e) => setNewCustomer({ ...newCustomer, street: e.target.value })}
                                                            placeholder="Main Street"
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>City</Label>
                                                        <Input
                                                            value={newCustomer.city}
                                                            onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                                                            placeholder="Riyadh"
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div>
                                            <Label>Invoice Type</Label>
                                            <div className="flex gap-4 mt-2">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        checked={customerType === "B2B"}
                                                        onChange={() => setCustomerType("B2B")}
                                                        className="accent-amber-500"
                                                    />
                                                    <span>Tax Invoice (B2B)</span>
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        checked={customerType === "B2C"}
                                                        onChange={() => setCustomerType("B2C")}
                                                        className="accent-amber-500"
                                                    />
                                                    <span>Simplified (B2C)</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Details */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-lg font-semibold">Invoice Details</h2>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Invoice Date *</Label>
                                            <Input
                                                type="date"
                                                value={invoiceDate}
                                                onChange={(e) => setInvoiceDate(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Due Date *</Label>
                                            <Input
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Payment Terms</Label>
                                            <select
                                                value={paymentTerms}
                                                onChange={(e) => setPaymentTerms(e.target.value)}
                                                className="w-full h-10 px-3 mt-1 rounded-md border border-slate-200 bg-white"
                                            >
                                                <option value="immediate">Due on Receipt</option>
                                                <option value="net15">Net 15</option>
                                                <option value="net30">Net 30</option>
                                                <option value="net60">Net 60</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Currency</Label>
                                            <Input value="SAR" disabled className="mt-1 bg-slate-100" />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>Reference / PO Number (Optional)</Label>
                                            <Input
                                                value={reference}
                                                onChange={(e) => setReference(e.target.value)}
                                                placeholder="PO-2026-0001"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Line Items */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-lg font-semibold">Invoice Items</h2>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-b border-slate-200">
                                                <tr className="text-slate-500">
                                                    <th className="text-left py-2 font-medium">Description</th>
                                                    <th className="text-right py-2 font-medium w-20">Qty</th>
                                                    <th className="text-right py-2 font-medium w-32">Unit Price</th>
                                                    <th className="text-right py-2 font-medium w-24">Tax</th>
                                                    <th className="text-right py-2 font-medium w-28">Total</th>
                                                    <th className="w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lineItems.map((item) => (
                                                    <tr key={item.id} className="border-b border-slate-100">
                                                        <td className="py-2 pr-2">
                                                            <Input
                                                                value={item.description}
                                                                onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                                                                placeholder="Product or service"
                                                                className="h-9"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                                                                className="h-9 text-right"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.unitPrice}
                                                                onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                                                className="h-9 text-right"
                                                            />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <select
                                                                value={item.taxRate}
                                                                onChange={(e) => updateLineItem(item.id, "taxRate", parseInt(e.target.value))}
                                                                className="h-9 w-full px-2 rounded border border-slate-200 text-right"
                                                            >
                                                                <option value={15}>15%</option>
                                                                <option value={0}>0%</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-2 px-2 text-right font-medium">
                                                            SAR {calculateItemTotal(item).toFixed(2)}
                                                        </td>
                                                        <td className="py-2 pl-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeLineItem(item.id)}
                                                                disabled={lineItems.length === 1}
                                                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                                        <Plus size={14} className="mr-1" /> Add Item
                                    </Button>

                                    <div className="flex justify-end">
                                        <div className="w-64 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Subtotal</span>
                                                <span>SAR {subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Tax</span>
                                                <span>SAR {taxAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                                <span>Total</span>
                                                <span className="text-amber-600">SAR {total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Review */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-lg font-semibold">Review & Submit</h2>

                                    {/* Success Result */}
                                    {submitResult === "success" && signedInvoice && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-6 bg-green-50 border border-green-200 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <CheckCircle className="w-8 h-8 text-green-500" />
                                                <div>
                                                    <h3 className="font-bold text-green-900">Invoice Signed Successfully!</h3>
                                                    <p className="text-sm text-green-700">Your invoice has been processed by the backend.</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-green-700">Invoice Number:</span>
                                                    <span className="ml-2 font-mono">{signedInvoice.invoice_number}</span>
                                                </div>
                                                <div>
                                                    <span className="text-green-700">UUID:</span>
                                                    <span className="ml-2 font-mono text-xs">{signedInvoice.invoice_uuid.substring(0, 8)}...</span>
                                                </div>
                                                <div>
                                                    <span className="text-green-700">Hash:</span>
                                                    <span className="ml-2 font-mono text-xs">{signedInvoice.hash.substring(0, 20)}...</span>
                                                </div>
                                                <div>
                                                    <span className="text-green-700">QR Code:</span>
                                                    <span className="ml-2">{signedInvoice.qr_code.length} chars</span>
                                                </div>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-4"
                                                onClick={() => setShowXml(!showXml)}
                                            >
                                                <Code size={14} className="mr-2" />
                                                {showXml ? "Hide" : "Show"} Signed XML
                                            </Button>

                                            {showXml && (
                                                <pre className="mt-4 p-4 bg-slate-900 text-green-400 rounded-lg overflow-x-auto text-xs max-h-64">
                                                    {signedInvoice.signed_xml}
                                                </pre>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* ZATCA SDK Validation Result */}
                                    {isValidating && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                            <span className="text-blue-700">Validating with ZATCA SDK...</span>
                                        </div>
                                    )}

                                    {validationResult && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={cn(
                                                "p-4 rounded-lg border",
                                                validationResult.valid
                                                    ? "bg-green-50 border-green-200"
                                                    : "bg-yellow-50 border-yellow-200"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                {validationResult.valid ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-yellow-500" />
                                                )}
                                                <span className={cn(
                                                    "font-medium",
                                                    validationResult.valid ? "text-green-700" : "text-yellow-700"
                                                )}>
                                                    ZATCA SDK Validation: {validationResult.valid ? "PASS" : "Needs Review"}
                                                </span>
                                            </div>
                                            <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                                                {validationResult.summary}
                                            </pre>
                                        </motion.div>
                                    )}

                                    {/* Error Result */}
                                    {submitResult === "error" && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-6 bg-red-50 border border-red-200 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <XCircle className="w-8 h-8 text-red-500" />
                                                <div>
                                                    <h3 className="font-bold text-red-900">Submission Failed</h3>
                                                    <p className="text-sm text-red-700">{error}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Review Info (only show before submission) */}
                                    {!submitResult && (
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="p-4 bg-slate-50 rounded-lg">
                                                    <h3 className="font-medium text-slate-900 mb-2">Customer</h3>
                                                    <p className="text-sm text-slate-600">
                                                        {customer?.name || newCustomer.name}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        VAT: {customer?.vatNumber || newCustomer.vatNumber}
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-lg">
                                                    <h3 className="font-medium text-slate-900 mb-2">Dates</h3>
                                                    <p className="text-sm text-slate-600">Issue: {invoiceDate}</p>
                                                    <p className="text-sm text-slate-600">Due: {dueDate}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-lg">
                                                <h3 className="font-medium text-slate-900 mb-2">Summary</h3>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Items</span>
                                                        <span>{lineItems.length}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Subtotal</span>
                                                        <span>SAR {subtotal.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Tax</span>
                                                        <span>SAR {taxAmount.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200">
                                                        <span>Total</span>
                                                        <span className="text-amber-600">SAR {total.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (submitResult) {
                                setSubmitResult(null);
                                setSignedInvoice(null);
                                setValidationResult(null);
                            } else {
                                setCurrentStep(currentStep - 1);
                            }
                        }}
                        disabled={currentStep === 1 && !submitResult}
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        {submitResult ? "Create Another" : "Previous"}
                    </Button>

                    <div className="flex gap-2">
                        {submitResult === "success" && (
                            <Button
                                onClick={() => router.push("/dashboard/invoices")}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                            >
                                View All Invoices
                            </Button>
                        )}

                        {!submitResult && currentStep === 4 && (
                            <Button variant="outline">Save as Draft</Button>
                        )}

                        {currentStep < 4 ? (
                            <Button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={!canProceed()}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                            >
                                Next
                                <ArrowRight size={16} className="ml-2" />
                            </Button>
                        ) : (
                            !submitResult && (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="mr-2 animate-spin" />
                                            Signing Invoice...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} className="mr-2" />
                                            Sign & Submit to ZATCA
                                        </>
                                    )}
                                </Button>
                            )
                        )}
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
