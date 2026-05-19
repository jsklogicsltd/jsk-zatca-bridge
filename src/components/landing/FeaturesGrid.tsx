"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    Zap,
    Lock,
    RefreshCw,
    TestTube,
    BarChart3,
    Code2,
    ArrowRight,
} from "lucide-react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slideInUp, staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/hooks/useTranslation";

export function FeaturesGrid() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });
    const { t } = useTranslation();

    const features = [
        {
            icon: Zap,
            title: t.features.cards.realtime.title,
            description: t.features.cards.realtime.description,
            link: "#",
        },
        {
            icon: Lock,
            title: t.features.cards.crypto.title,
            description: t.features.cards.crypto.description,
            link: "#",
        },
        {
            icon: RefreshCw,
            title: t.features.cards.renewal.title,
            description: t.features.cards.renewal.description,
            link: "#",
        },
        {
            icon: TestTube,
            title: t.features.cards.sandbox.title,
            description: t.features.cards.sandbox.description,
            link: "#",
        },
        {
            icon: BarChart3,
            title: t.features.cards.analytics.title,
            description: t.features.cards.analytics.description,
            link: "#",
        },
        {
            icon: Code2,
            title: t.features.cards.api.title,
            description: t.features.cards.api.description,
            link: "#",
        },
    ];

    return (
        <SectionContainer variant="light" id="features">
            <motion.div
                ref={ref}
                variants={staggerContainer}
                initial="initial"
                animate={isInView ? "animate" : "initial"}
                className="space-y-12"
            >
                {/* Heading */}
                <motion.div variants={slideInUp} className="text-center space-y-3">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                        {t.features.heading}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        {t.features.subheading}
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            variants={slideInUp}
                            custom={index}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full border-slate-200 hover:border-amber-400 hover:bg-white/60 hover:shadow-lg transition-all duration-300 group">
                                <CardHeader className="pb-3">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-3 shadow-md">
                                        <feature.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                    <a
                                        href={feature.link}
                                        className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700 group-hover:translate-x-1 transition-transform"
                                    >
                                        {t.features.learnMore}
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </a>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </SectionContainer>
    );
}
