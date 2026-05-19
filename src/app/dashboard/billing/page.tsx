"use client";

import { motion } from "framer-motion";
import {
    CreditCard,
    Receipt,
    Download,
    CheckCircle,
    AlertCircle,
    Calendar,
    Building2,
} from "lucide-react";

const invoices = [
    { id: "INV-001", date: "2026-01-01", amount: 299, status: "paid" },
    { id: "INV-002", date: "2025-12-01", amount: 299, status: "paid" },
    { id: "INV-003", date: "2025-11-01", amount: 299, status: "paid" },
];

export default function BillingPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-stone-900 mb-2">
                    Billing & Subscription
                </h1>
                <p className="text-stone-500">
                    Manage your subscription and payment methods
                </p>
            </div>

            {/* Current Plan */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 mb-6 text-white"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-amber-100 text-sm mb-1">Current Plan</p>
                        <h2 className="text-2xl font-bold mb-2">Business Pro</h2>
                        <p className="text-amber-100">
                            Unlimited invoices • Priority support • API access
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold">SAR 299</p>
                        <p className="text-amber-100">per month</p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Next billing: February 1, 2026</span>
                    </div>
                    <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                        Change Plan
                    </button>
                </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-stone-200 p-6 mb-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-stone-900">
                        Payment Method
                    </h3>
                    <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                        Update
                    </button>
                </div>
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="font-medium text-stone-900">•••• •••• •••• 4242</p>
                        <p className="text-sm text-stone-500">Expires 12/2028</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                </div>
            </motion.div>

            {/* Billing Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-stone-200 p-6 mb-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-stone-900">
                        Billing Details
                    </h3>
                    <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                        Edit
                    </button>
                </div>
                <div className="flex items-start gap-4">
                    <Building2 className="w-5 h-5 text-stone-400 mt-0.5" />
                    <div>
                        <p className="font-medium text-stone-900">JSK Logics Ltd.</p>
                        <p className="text-stone-500">
                            King Fahd Road, Building 1234
                            <br />
                            Riyadh 12211, Saudi Arabia
                            <br />
                            VAT: 310122393500003
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Invoice History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
            >
                <div className="p-6 border-b border-stone-200">
                    <div className="flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-semibold text-stone-900">
                            Invoice History
                        </h3>
                    </div>
                </div>
                <div className="divide-y divide-stone-100">
                    {invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="font-medium text-stone-900">{invoice.id}</p>
                                    <p className="text-sm text-stone-500">{invoice.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-medium text-stone-900">
                                    SAR {invoice.amount}
                                </span>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">
                                    Paid
                                </span>
                                <button className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
                                    <Download className="w-4 h-4 text-stone-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
