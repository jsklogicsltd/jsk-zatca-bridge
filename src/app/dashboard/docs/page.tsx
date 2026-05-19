"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    BookOpen,
    Search,
    ArrowRight,
    FileText,
    Code2,
    Shield,
    Zap,
    ExternalLink,
} from "lucide-react";
import Link from "next/link";

const docCategories = [
    {
        title: "Getting Started",
        icon: Zap,
        description: "Quick start guides and tutorials",
        articles: [
            { title: "Introduction to ZATCA Bridge", href: "#" },
            { title: "Setting Up Your Account", href: "#" },
            { title: "First Invoice Submission", href: "#" },
        ],
    },
    {
        title: "Invoice Management",
        icon: FileText,
        description: "Creating and managing invoices",
        articles: [
            { title: "Creating Tax Invoices", href: "#" },
            { title: "Simplified Invoices", href: "#" },
            { title: "Batch Processing", href: "#" },
        ],
    },
    {
        title: "API Integration",
        icon: Code2,
        description: "Developer documentation and SDKs",
        articles: [
            { title: "REST API Overview", href: "#" },
            { title: "Authentication", href: "#" },
            { title: "Webhooks", href: "#" },
        ],
    },
    {
        title: "Compliance",
        icon: Shield,
        description: "ZATCA requirements and validation",
        articles: [
            { title: "ZATCA Phase 2 Requirements", href: "#" },
            { title: "XML Schema Reference", href: "#" },
            { title: "QR Code Specification", href: "#" },
        ],
    },
];

export default function DocsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-stone-900 mb-2">
                    Documentation
                </h1>
                <p className="text-stone-500">
                    Everything you need to integrate with ZATCA and manage e-invoices
                </p>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                    type="text"
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {docCategories.map((category, index) => (
                    <motion.div
                        key={category.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-amber-200 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                                <category.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-stone-900">
                                    {category.title}
                                </h3>
                                <p className="text-sm text-stone-500">
                                    {category.description}
                                </p>
                            </div>
                        </div>

                        <ul className="space-y-2">
                            {category.articles.map((article) => (
                                <li key={article.title}>
                                    <Link
                                        href={article.href}
                                        className="flex items-center gap-2 text-stone-600 hover:text-amber-600 transition-colors group"
                                    >
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span>{article.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="w-6 h-6 text-amber-600" />
                    <h3 className="text-lg font-semibold text-stone-900">
                        Quick Links
                    </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                    {["API Reference", "ZATCA Guidelines", "Sample Code", "FAQ"].map((link) => (
                        <Link
                            key={link}
                            href="#"
                            className="px-4 py-2 bg-white rounded-lg border border-amber-200 text-stone-700 hover:bg-amber-50 transition-colors flex items-center gap-2"
                        >
                            {link}
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
