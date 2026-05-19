"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Play, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { fadeIn, slideInUp, staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/hooks/useTranslation";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    const { t } = useTranslation();

    return (
        <section
            id="home"
            ref={ref}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50/30 pt-16"
        >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-[0.08]">
                <motion.div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,158,11,0.3),transparent_50%)]"
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
                    className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#f59e0b_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b_1px,transparent_1px)] bg-[size:4rem_4rem]"
                    animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            </div>

            <div className="container mx-auto max-w-6xl px-6 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate={isInView ? "animate" : "initial"}
                    className="text-center space-y-8"
                >
                    {/* Badge */}
                    <motion.div variants={slideInUp}>
                        <Badge variant="outline" className="border-amber-500/50 text-amber-600 bg-amber-50/50">
                            {t.hero.badge}
                        </Badge>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={slideInUp}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight"
                    >
                        {t.hero.headline}
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500">
                            {t.hero.headlineHighlight}
                        </span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        variants={slideInUp}
                        className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
                    >
                        {t.hero.subheading}{" "}
                        <span className="font-semibold text-amber-600">{t.hero.subheadingHighlight}</span>
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        variants={fadeIn}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/auth/signup">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all h-12 px-8"
                            >
                                {t.hero.ctaPrimary}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/docs">
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-slate-300 hover:border-amber-500 hover:text-amber-600 h-12 px-8"
                            >
                                <Play className="mr-2 h-5 w-5" />
                                {t.hero.ctaSecondary}
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Dashboard Preview Mockup */}
                    <motion.div
                        variants={fadeIn}
                        className="pt-12"
                    >
                        <motion.div
                            className="relative max-w-4xl mx-auto"
                            initial={{ y: 40, opacity: 0, rotateX: 15 }}
                            animate={isInView ? { y: 0, opacity: 1, rotateX: 0 } : {}}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-2 transform rotate-[-0.5deg] hover:rotate-0 transition-transform duration-300">
                                <div className="aspect-video bg-gradient-to-br from-slate-100 to-stone-100 rounded-lg border border-slate-200 overflow-hidden">
                                    <Link href="/dashboard" className="block h-full">
                                        <div className="relative h-full cursor-pointer group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/5 group-hover:from-amber-500/10 group-hover:to-amber-600/10 transition-all" />
                                            <div className="text-center flex items-center justify-center h-full p-8">
                                                <div className="space-y-3">
                                                    <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                                                        <div className="w-8 h-8 bg-amber-500 rounded-full" />
                                                    </div>
                                                    <p className="text-sm text-slate-500 font-mono">
                                                        {t.hero.dashboardPreview}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        Click to view dashboard
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
