"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { slideInUp, staggerContainer } from "@/lib/animations";
import { useTranslation } from "@/hooks/useTranslation";

export function CTASection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    const { t } = useTranslation();

    return (
        <SectionContainer variant="gradient" id="cta">
            <motion.div
                ref={ref}
                variants={staggerContainer}
                initial="initial"
                animate={isInView ? "animate" : "initial"}
                className="text-center space-y-8 text-white"
            >
                {/* Heading */}
                <motion.div variants={slideInUp} className="space-y-4">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                        {t.cta.heading}
                    </h2>
                    <p className="text-lg md:text-xl text-amber-50 max-w-2xl mx-auto">
                        {t.cta.socialProof} <span className="font-bold">{t.cta.socialProofHighlight}</span> already using ZATCA Bridge
                    </p>
                </motion.div>

                {/* CTA Button */}
                <motion.div variants={slideInUp}>
                    <Button
                        size="lg"
                        className="bg-white text-amber-600 hover:bg-amber-50 shadow-xl hover:shadow-2xl transition-all h-14 px-10 text-lg font-semibold"
                    >
                        {t.cta.button}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </motion.div>

                {/* Reassurance Text */}
                <motion.div
                    variants={slideInUp}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-amber-50"
                >
                    <div className="flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        <span>{t.cta.reassurance1}</span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-amber-200" />
                    <div className="flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        <span>{t.cta.reassurance2}</span>
                    </div>
                </motion.div>
            </motion.div>
        </SectionContainer>
    );
}
