"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    UserPlus,
    FileText,
    ShieldCheck,
    Code,
    Puzzle,
    BarChart2,
    CreditCard,
    Lock,
    ArrowRight,
    Rocket,
    Wrench,
    LayoutGrid,
    Home,
    HelpCircle,
} from "lucide-react";
import { DocsSearchBar } from "@/components/docs/DocsSearchBar";
import { Card } from "@/components/ui/card";
import { docCategories } from "@/lib/mockData/docs";

const iconMap: Record<string, React.ElementType> = {
    UserPlus,
    FileText,
    ShieldCheck,
    Code,
    Puzzle,
    BarChart2,
    CreditCard,
    Lock,
};

const quickStartCards = [
    {
        title: "Getting Started",
        description: "Set up your first invoice in 5 minutes",
        icon: Rocket,
        link: "/docs/getting-started/create-account",
    },
    {
        title: "API Integration",
        description: "Connect your ERP system",
        icon: Code,
        link: "/docs/api",
    },
    {
        title: "Troubleshooting",
        description: "Common issues and solutions",
        icon: Wrench,
        link: "/help",
    },
];

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Top Navigation */}
            <nav className="bg-slate-900 border-b border-slate-800">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-white font-semibold">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Z</span>
                        </div>
                        ZATCA Bridge
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm">
                            <Home size={16} />
                            Home
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm">
                            <LayoutGrid size={16} />
                            Dashboard
                        </Link>
                        <Link href="/help" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm">
                            <HelpCircle size={16} />
                            Help
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Header */}
            <div className="bg-slate-900 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-4"
                    >
                        How can we help you?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 mb-8"
                    >
                        Search our documentation for guides, tutorials, and API reference
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-xl mx-auto"
                    >
                        <DocsSearchBar large />
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Quick Start Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {quickStartCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <Link href={card.link}>
                                    <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-slate-200 cursor-pointer">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                                            <Icon className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <h3 className="font-semibold text-lg text-slate-900 mb-2">{card.title}</h3>
                                        <p className="text-sm text-slate-500 mb-4">{card.description}</p>
                                        <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                                            Read Guide <ArrowRight size={14} />
                                        </span>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Documentation Categories */}
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Browse by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {docCategories.map((category, index) => {
                        const Icon = iconMap[category.icon] || FileText;
                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index }}
                            >
                                <Link href={`/docs/${category.id}`}>
                                    <Card className="p-5 hover:shadow-md transition-all border-slate-200 cursor-pointer h-full">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Icon className="h-5 w-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900">{category.title}</h3>
                                                <p className="text-xs text-slate-500 mt-1">{category.description}</p>
                                                <span className="text-xs text-amber-600 mt-2 block">
                                                    {category.articleCount} articles
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Quick Links */}
                <div className="mt-12 p-6 bg-slate-100 rounded-xl">
                    <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/docs/api" className="px-4 py-2 bg-white rounded-lg text-sm text-slate-600 hover:text-amber-600 shadow-sm">
                            API Reference
                        </Link>
                        <Link href="/help" className="px-4 py-2 bg-white rounded-lg text-sm text-slate-600 hover:text-amber-600 shadow-sm">
                            Help Center
                        </Link>
                        <Link href="/docs/getting-started/create-account" className="px-4 py-2 bg-white rounded-lg text-sm text-slate-600 hover:text-amber-600 shadow-sm">
                            Quick Start Guide
                        </Link>
                        <Link href="/docs/compliance/ubl-format" className="px-4 py-2 bg-white rounded-lg text-sm text-slate-600 hover:text-amber-600 shadow-sm">
                            UBL XML Format
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
