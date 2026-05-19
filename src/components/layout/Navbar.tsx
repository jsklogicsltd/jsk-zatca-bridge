"use client";

import { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import { Menu, X, Languages } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const { t, toggleLanguage, language } = useTranslation();

    const navLinks = [
        { name: t.navbar.home, href: "#home" },
        { name: t.navbar.features, href: "#features" },
        { name: t.navbar.documentation, href: "#docs" },
        { name: t.navbar.pricing, href: "#pricing" },
    ];

    useEffect(() => {
        return scrollY.on("change", (latest) => {
            setIsScrolled(latest > 50);
        });
    }, [scrollY]);

    return (
        <motion.nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
                isScrolled
                    ? "bg-background/80 backdrop-blur-xl shadow-md border-b border-slate-200/50"
                    : "bg-transparent"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="container mx-auto max-w-7xl px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <motion.a
                    href="#home"
                    className="relative group"
                    whileHover={{ scale: 1.02 }}
                >
                    <span className="text-xl font-bold text-slate-900">
                        {t.navbar.logo}
                    </span>
                    <motion.div
                        className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    />
                </motion.a>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors duration-200"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* Action Buttons - Desktop */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Language Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleLanguage}
                        className="text-slate-600 gap-2"
                    >
                        <Languages size={16} />
                        <span className="text-xs font-semibold">{language.toUpperCase()}</span>
                    </Button>

                    <Link href="/auth/signin">
                        <Button variant="ghost" size="sm" className="text-slate-600">
                            {t.navbar.signIn}
                        </Button>
                    </Link>
                    <Link href="/auth/signup">
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md"
                        >
                            {t.navbar.getStarted}
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-600"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <motion.div
                className={cn(
                    "md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-slate-200 shadow-lg",
                    isMobileMenuOpen ? "block" : "hidden"
                )}
                initial={{ opacity: 0, y: -20 }}
                animate={isMobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
            >
                <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-base font-medium text-slate-600 hover:text-amber-600 transition-colors py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
                        {/* Language Toggle Mobile */}
                        <Button
                            variant="outline"
                            onClick={toggleLanguage}
                            className="w-full gap-2"
                        >
                            <Languages size={16} />
                            <span>{language === 'en' ? 'العربية' : 'English'}</span>
                        </Button>

                        <Link href="/auth/signin" className="w-full">
                            <Button variant="ghost" className="w-full">
                                {t.navbar.signIn}
                            </Button>
                        </Link>
                        <Link href="/auth/signup" className="w-full">
                            <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                                {t.navbar.getStarted}
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </motion.nav>
    );
}
