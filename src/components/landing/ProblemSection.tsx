"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Server, FileX, DollarSign } from "lucide-react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slideInUp, staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/hooks/useTranslation";

export function ProblemSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const { t } = useTranslation();

    const painPoints = [
        {
            icon: Server,
            title: t.problem.cards.legacy.title,
            description: t.problem.cards.legacy.description,
        },
        {
            icon: FileX,
            title: t.problem.cards.regulations.title,
            description: t.problem.cards.regulations.description,
        },
        {
            icon: DollarSign,
            title: t.problem.cards.expensive.title,
            description: t.problem.cards.expensive.description,
        },
    ];

    return (
        <SectionContainer variant="light" id="problems">
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
                        {t.problem.heading}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        {t.problem.subheading}
                    </p>
                </motion.div>

                {/* Pain Point Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {painPoints.map((point, index) => (
                        <motion.div
                            key={point.title}
                            variants={slideInUp}
                            custom={index}
                        >
                            <Card className="h-full border-slate-200 hover:border-amber-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                <CardHeader className="pb-3">
                                    <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3 group-hover:bg-amber-500/20 transition-colors">
                                        <point.icon className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <CardTitle className="text-xl">{point.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {point.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </SectionContainer>
    );
}
