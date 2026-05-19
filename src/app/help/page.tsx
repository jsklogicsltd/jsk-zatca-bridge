"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    MessageCircle,
    Mail,
    Phone,
    CheckCircle,
    AlertTriangle,
    Clock,
    Send,
    Search,
    Upload,
    Loader2,
    LayoutGrid,
    Home,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FAQAccordion } from "@/components/docs/FAQAccordion";
import { faqItems, systemStatus } from "@/lib/mockData/docs";
import { cn } from "@/lib/utils";

const contactOptions = [
    {
        title: "Live Chat",
        description: "Get instant help",
        availability: "9 AM - 6 PM GST",
        responseTime: "~2 minutes",
        icon: MessageCircle,
        action: "Start Chat",
        color: "bg-green-500",
    },
    {
        title: "Email Support",
        description: "support@jsklogics.com",
        availability: "24/7",
        responseTime: "Within 24 hours",
        icon: Mail,
        action: "Send Email",
        color: "bg-blue-500",
    },
    {
        title: "WhatsApp",
        description: "+966 50 123 4567",
        availability: "Quick responses",
        responseTime: "For urgent issues",
        icon: Phone,
        action: "Open WhatsApp",
        color: "bg-green-600",
    },
];

const faqCategories = ["General", "Technical", "Billing", "Compliance"];

export default function HelpPage() {
    const [selectedCategory, setSelectedCategory] = useState("General");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ticketSubmitted, setTicketSubmitted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise((r) => setTimeout(r, 1500));
        setIsSubmitting(false);
        setTicketSubmitted(true);
    };

    const filteredFAQs = searchQuery
        ? faqItems.filter(
            (f) =>
                f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : faqItems.filter((f) => f.category === selectedCategory);

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
                        <Link href="/docs" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm">
                            <FileText size={16} />
                            Docs
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Header */}
            <div className="bg-slate-900 text-white py-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold mb-3"
                    >
                        Help Center
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400"
                    >
                        Get support and find answers to your questions
                    </motion.p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
                {/* Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {contactOptions.map((option, index) => {
                        const Icon = option.icon;
                        return (
                            <motion.div
                                key={option.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-slate-200 h-full">
                                    <CardContent className="pt-6 text-center">
                                        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4", option.color)}>
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-lg text-slate-900 mb-1">{option.title}</h3>
                                        <p className="text-sm text-slate-600 mb-2">{option.description}</p>
                                        <p className="text-xs text-slate-500 mb-1">{option.availability}</p>
                                        <p className="text-xs text-amber-600 mb-4">{option.responseTime}</p>
                                        <Button className="w-full">{option.action}</Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* System Status */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-700">API</p>
                                    <p className="text-xs text-green-600">Operational • {systemStatus.api.uptime}% uptime</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-700">ZATCA Portal</p>
                                    <p className="text-xs text-green-600">Connected • {systemStatus.zatca.latency}ms</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-700">Dashboard</p>
                                    <p className="text-xs text-green-600">Operational</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* FAQ Section */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search FAQs..."
                            className="pl-10"
                        />
                    </div>

                    {/* Category Tabs */}
                    {!searchQuery && (
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {faqCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        selectedCategory === cat
                                            ? "bg-amber-500 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    <FAQAccordion items={filteredFAQs} />
                </div>

                {/* Submit Ticket */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>Submit a Ticket</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {ticketSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Ticket Submitted!</h3>
                                <p className="text-sm text-slate-600 mb-4">Your ticket #TKT-2026-0145 has been created</p>
                                <Button onClick={() => setTicketSubmitted(false)} variant="outline">
                                    Submit Another
                                </Button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmitTicket} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Priority</Label>
                                        <select className="w-full h-10 px-3 mt-1 rounded-md border border-slate-200">
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Category</Label>
                                        <select className="w-full h-10 px-3 mt-1 rounded-md border border-slate-200">
                                            <option value="general">General</option>
                                            <option value="technical">Technical</option>
                                            <option value="billing">Billing</option>
                                            <option value="compliance">Compliance</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <Label>Subject</Label>
                                    <Input placeholder="Brief description of your issue" className="mt-1" />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <textarea
                                        placeholder="Please describe your issue in detail..."
                                        className="w-full h-32 px-3 py-2 mt-1 rounded-md border border-slate-200 resize-none"
                                    />
                                </div>
                                <div>
                                    <Label>Attachments (optional)</Label>
                                    <div className="mt-1 border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                                        <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500">Drag files here or click to upload</p>
                                    </div>
                                </div>
                                <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Submit Ticket
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Back to docs link */}
                <div className="text-center">
                    <Link href="/docs" className="text-amber-600 hover:underline">
                        ← Back to Documentation
                    </Link>
                </div>
            </div>
        </div>
    );
}
