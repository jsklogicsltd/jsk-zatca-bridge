"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/lib/api";
import {
    LayoutDashboard,
    FileText,
    BarChart3,
    ShieldCheck,
    ScrollText,
    Settings,
    BookOpen,
    Code2,
    HelpCircle,
    ChevronLeft,
    LogOut,
    User,
    CreditCard,
    ChevronDown,
} from "lucide-react";
import { useDashboard } from "./DashboardLayout";
import { navigationItems } from "@/lib/mockData";
import { useCurrentUser } from "@/lib/hooks/useApi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = {
    LayoutDashboard,
    FileText,
    BarChart3,
    ShieldCheck,
    ScrollText,
    Settings,
    BookOpen,
    Code2,
    HelpCircle,
};

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useDashboard();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const { data: user } = useCurrentUser();

    const isActive = (href: string) => pathname === href;

    const displayName = user?.full_name?.trim() || user?.email?.split("@")[0] || "Account";
    const displayCompany = user?.company_name?.trim() || "Your company";
    const displayRole = user?.is_verified ? "Admin" : "Pending verification";
    const complianceStatus: "compliant" | "warning" = user?.has_zatca_csid ? "compliant" : "warning";

    const handleSignOut = async () => {
        if (signingOut) return;
        setSigningOut(true);
        try {
            await logout();
        } finally {
            // Wipe onboarding / integration state so the next sign-in starts clean.
            if (typeof window !== "undefined") {
                ["onboarding_company", "onboarding_zatca", "onboarding_integration",
                    "onboarding_preferences", "zatca_csid"].forEach((k) =>
                        localStorage.removeItem(k)
                    );
            }
            setUserMenuOpen(false);
            router.push("/auth/signin");
        }
    };

    const NavGroup = ({ title, items }: { title: string; items: typeof navigationItems.main }) => (
        <div className="space-y-1">
            {!sidebarCollapsed && (
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {title}
                </p>
            )}
            {items.map((item) => {
                const Icon = iconMap[item.icon];
                const active = isActive(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                            active
                                ? "bg-amber-500/10 text-amber-600 border-l-2 border-amber-500"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                    >
                        <Icon size={20} />
                        {!sidebarCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                    </Link>
                );
            })}
        </div>
    );

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="p-4 border-b border-slate-200">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">JL</span>
                    </div>
                    {!sidebarCollapsed && (
                        <div>
                            <p className="font-bold text-slate-900 text-sm">{displayCompany}</p>
                            <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded-full",
                                complianceStatus === "compliant" && "bg-green-100 text-green-700",
                                complianceStatus === "warning" && "bg-amber-100 text-amber-700"
                            )}>
                                {complianceStatus === "compliant" ? "Compliant" : "Attention"}
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                <NavGroup title="Main" items={navigationItems.main} />
                <NavGroup title="Compliance" items={navigationItems.compliance} />
                <NavGroup title="Support" items={navigationItems.support} />
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-slate-200">
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User size={16} className="text-slate-600" />
                        </div>
                        {!sidebarCollapsed && (
                            <>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-slate-900">{displayName}</p>
                                    <p className="text-xs text-slate-500">{displayRole}</p>
                                </div>
                                <ChevronDown size={16} className={cn("text-slate-400 transition-transform", userMenuOpen && "rotate-180")} />
                            </>
                        )}
                    </button>

                    <AnimatePresence>
                        {userMenuOpen && !sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 py-1"
                            >
                                <Link href="/dashboard/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                                    <User size={16} /> Profile
                                </Link>
                                <Link href="/dashboard/billing" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                                    <CreditCard size={16} /> Billing
                                </Link>
                                <hr className="my-1" />
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    disabled={signingOut}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-wait"
                                >
                                    <LogOut size={16} />
                                    {signingOut ? "Signing out…" : "Sign Out"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Collapse Button (Desktop only) */}
            <div className="hidden lg:block p-4 border-t border-slate-200">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="w-full justify-center"
                >
                    <ChevronLeft size={20} className={cn("transition-transform", sidebarCollapsed && "rotate-180")} />
                </Button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                className="hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex-col z-50"
                animate={{ width: sidebarCollapsed ? 72 : 240 }}
                transition={{ duration: 0.3 }}
            >
                {sidebarContent}
            </motion.aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <motion.aside
                        initial={{ x: -240 }}
                        animate={{ x: 0 }}
                        exit={{ x: -240 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-slate-200 flex flex-col z-50"
                    >
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
