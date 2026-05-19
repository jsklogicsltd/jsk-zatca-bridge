"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Bell, Plus, ChevronRight, Command } from "lucide-react";
import { useDashboard } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const breadcrumbMap: Record<string, string> = {
    dashboard: "Dashboard",
    invoices: "Invoices",
    reports: "Reports",
    csid: "CSID Management",
    logs: "Validation Logs",
    settings: "Settings",
    docs: "Documentation",
    api: "API Reference",
    help: "Help Center",
};

export function Header() {
    const pathname = usePathname();
    const { setMobileSidebarOpen } = useDashboard();
    const [quickActionsOpen, setQuickActionsOpen] = useState(false);

    // Generate breadcrumbs from pathname
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => ({
        name: breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: "/" + pathSegments.slice(0, index + 1).join("/"),
        isLast: index === pathSegments.length - 1,
    }));

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
            {/* Left: Mobile Menu + Breadcrumbs */}
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setMobileSidebarOpen(true)}
                >
                    <Menu size={20} />
                </Button>

                {/* Breadcrumbs */}
                <nav className="hidden md:flex items-center gap-1 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.href} className="flex items-center gap-1">
                            {index > 0 && <ChevronRight size={14} className="text-slate-400" />}
                            {crumb.isLast ? (
                                <span className="text-slate-900 font-medium">{crumb.name}</span>
                            ) : (
                                <Link href={crumb.href} className="text-slate-500 hover:text-slate-700">
                                    {crumb.name}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search invoices, customers..."
                        className="pl-9 pr-20 h-9 bg-slate-50 border-slate-200"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        <Command size={12} />
                        <span>K</span>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Mobile Search */}
                <Button variant="ghost" size="sm" className="md:hidden">
                    <Search size={20} />
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        3
                    </span>
                </Button>

                {/* Quick Actions */}
                <div className="relative">
                    <Button
                        onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2"
                        size="sm"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">New</span>
                    </Button>

                    <AnimatePresence>
                        {quickActionsOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setQuickActionsOpen(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
                                >
                                    <Link
                                        href="/dashboard/invoices/new"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                        onClick={() => setQuickActionsOpen(false)}
                                    >
                                        New Invoice
                                    </Link>
                                    <Link
                                        href="/dashboard/invoices/batch"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                        onClick={() => setQuickActionsOpen(false)}
                                    >
                                        Upload Batch
                                    </Link>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
