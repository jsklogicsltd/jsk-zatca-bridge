"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Send, FileCode, ShieldCheck, CheckCircle, ArrowRight } from "lucide-react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { slideInUp, staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/hooks/useTranslation";

export function SolutionSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const { t } = useTranslation();

    const steps = [
        {
            icon: Send,
            title: t.solution.steps.send.title,
            description: t.solution.steps.send.description,
        },
        {
            icon: FileCode,
            title: t.solution.steps.transform.title,
            description: t.solution.steps.transform.description,
        },
        {
            icon: ShieldCheck,
            title: t.solution.steps.sign.title,
            description: t.solution.steps.sign.description,
        },
        {
            icon: CheckCircle,
            title: t.solution.steps.receive.title,
            description: t.solution.steps.receive.description,
        },
    ];

    return (
        <SectionContainer variant="default" id="solution">
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
                        {t.solution.heading}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        {t.solution.subheading}
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="relative">
                    {/* Connector Line - Desktop Only */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                variants={slideInUp}
                                custom={index}
                                className="relative"
                            >
                                {/* Step Number Badge */}
                                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-sm flex items-center justify-center shadow-md z-10">
                                    {index + 1}
                                </div>

                                <div className="bg-white rounded-lg p-6 border-2 border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 h-full">
                                    <div className="space-y-4">
                                        <div className="w-14 h-14 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                            <step.icon className="h-7 w-7 text-amber-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Arrow Connector - Desktop Only */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-12 -right-4 z-20">
                                        <ArrowRight className="h-6 w-6 text-amber-500" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </SectionContainer>
    );
}
