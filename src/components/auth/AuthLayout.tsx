"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface AuthLayoutProps {
    children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen grid lg:grid-cols-[60%_40%] bg-gradient-to-br from-stone-50 to-amber-50/30">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-6 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link href="/" className="inline-block mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">JL</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900">JSK Logics</span>
                        </div>
                    </Link>

                    {/* Form Content */}
                    {children}
                </motion.div>
            </div>

            {/* Right Side - Branded Visual */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600 rounded-full blur-3xl"
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                        }}
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center px-12 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Enterprise Tax Compliance
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            Connect your legacy ERP to Saudi tax authorities with ZATCA Bridge.
                            Secure, compliant, and effortless.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-slate-400">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-amber-500">500+</div>
                                <div>Companies</div>
                            </div>
                            <div className="h-12 w-px bg-slate-700" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-amber-500">99.9%</div>
                                <div>Uptime</div>
                            </div>
                            <div className="h-12 w-px bg-slate-700" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-amber-500">24/7</div>
                                <div>Support</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
