"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    HelpCircle,
    Search,
    MessageCircle,
    Book,
    Video,
    Mail,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from "lucide-react";

const faqs = [
    {
        question: "How do I get started with ZATCA Bridge?",
        answer:
            "Sign up for an account, complete the onboarding process to register your CSID with ZATCA, and you can start submitting invoices immediately. Our wizard will guide you through each step.",
    },
    {
        question: "What invoice types are supported?",
        answer:
            "ZATCA Bridge supports both Standard (B2B) and Simplified (B2C) tax invoices, as well as Credit Notes and Debit Notes. All invoice types comply with ZATCA Phase 2 requirements.",
    },
    {
        question: "How do I submit invoices in bulk?",
        answer:
            "Use our Batch Upload feature to upload Excel, CSV, or PDF files. The system will parse, validate, and submit all invoices to ZATCA automatically.",
    },
    {
        question: "What happens if an invoice is rejected by ZATCA?",
        answer:
            "Rejected invoices are flagged in your dashboard with detailed error messages. You can correct the issues and resubmit. Our validation prevents most rejections before submission.",
    },
    {
        question: "How do I renew my CSID certificate?",
        answer:
            "Navigate to CSID Management, and you'll see your certificate's expiry date. Click 'Renew' before expiration to maintain compliance with ZATCA.",
    },
];

const resources = [
    {
        title: "Video Tutorials",
        description: "Step-by-step video guides",
        icon: Video,
        href: "#",
    },
    {
        title: "Knowledge Base",
        description: "Detailed articles and guides",
        icon: Book,
        href: "#",
    },
    {
        title: "Contact Support",
        description: "Get help from our team",
        icon: Mail,
        href: "#",
    },
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-stone-900 mb-2">
                    Help Center
                </h1>
                <p className="text-stone-500">
                    Find answers to common questions and get support
                </p>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                    type="text"
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
            </div>

            {/* Resources */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {resources.map((resource, index) => (
                    <motion.a
                        key={resource.title}
                        href={resource.href}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-200 hover:shadow-md transition-all flex items-center gap-4"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                            <resource.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-medium text-stone-900">
                                {resource.title}
                            </h3>
                            <p className="text-sm text-stone-500">
                                {resource.description}
                            </p>
                        </div>
                    </motion.a>
                ))}
            </div>

            {/* FAQs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
            >
                <div className="p-6 border-b border-stone-200">
                    <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-amber-600" />
                        <h2 className="text-lg font-semibold text-stone-900">
                            Frequently Asked Questions
                        </h2>
                    </div>
                </div>

                <div className="divide-y divide-stone-100">
                    {faqs.map((faq, index) => (
                        <div key={index} className="p-4">
                            <button
                                onClick={() =>
                                    setExpandedFaq(expandedFaq === index ? null : index)
                                }
                                className="w-full flex items-center justify-between text-left"
                            >
                                <span className="font-medium text-stone-900">
                                    {faq.question}
                                </span>
                                {expandedFaq === index ? (
                                    <ChevronUp className="w-5 h-5 text-stone-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-stone-400" />
                                )}
                            </button>
                            {expandedFaq === index && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mt-3 text-stone-600"
                                >
                                    {faq.answer}
                                </motion.p>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Contact */}
            <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 text-center">
                <MessageCircle className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    Still need help?
                </h3>
                <p className="text-stone-600 mb-4">
                    Our support team is available 24/7 to assist you
                </p>
                <button className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all">
                    Contact Support
                </button>
            </div>
        </div>
    );
}
