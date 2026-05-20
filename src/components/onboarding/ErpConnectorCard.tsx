"use client";

import { motion } from "framer-motion";
import { Check, Clock, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DIFFICULTY_LABELS,
    type ErpConnector,
} from "@/lib/erpConnectors";

interface ErpConnectorCardProps {
    connector: ErpConnector;
    selected: boolean;
    onClick: () => void;
    index?: number;
}

export function ErpConnectorCard({
    connector,
    selected,
    onClick,
    index = 0,
}: ErpConnectorCardProps) {
    const difficulty = DIFFICULTY_LABELS[connector.difficulty];

    return (
        <motion.button
            type="button"
            onClick={onClick}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.32,
                delay: 0.04 * index,
                ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "group relative text-left rounded-2xl border-2 bg-white p-5 transition-all overflow-hidden",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                selected
                    ? "border-amber-500 shadow-[0_10px_28px_-12px_rgba(217,119,6,0.5)] ring-2 ring-amber-200"
                    : "border-slate-200 hover:border-amber-300 hover:shadow-md"
            )}
        >
            {/* Recommended ribbon */}
            {connector.recommended && !selected && (
                <div className="absolute -right-9 top-3 rotate-45 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-semibold tracking-wider px-9 py-0.5 shadow-sm">
                    POPULAR
                </div>
            )}

            {/* Selected check pill */}
            {selected && (
                <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 360, damping: 18 }}
                    className="absolute top-3 right-3 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-md"
                >
                    <Check size={14} className="text-white" strokeWidth={3} />
                </motion.div>
            )}

            <div className="flex items-start gap-4">
                {/* Brand monogram */}
                <div
                    className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg transition-transform group-hover:scale-105",
                        connector.color,
                        connector.textColor
                    )}
                >
                    {connector.monogram}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 leading-tight">
                        {connector.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {connector.description}
                    </p>

                    {/* Metadata pills */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        <span
                            className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
                                difficulty.color
                            )}
                        >
                            {connector.difficulty === "easy" ? (
                                <Zap size={10} className="mr-1" />
                            ) : connector.difficulty === "custom" ? (
                                <Sparkles size={10} className="mr-1" />
                            ) : null}
                            {difficulty.label}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            <Clock size={10} className="mr-1" />
                            {connector.setupTime}
                        </span>
                        {connector.supportsLiveUpdates && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                                Live status
                            </span>
                        )}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2">
                        Best for: <span className="text-slate-600">{connector.recommendedFor}</span>
                    </p>
                </div>
            </div>
        </motion.button>
    );
}
