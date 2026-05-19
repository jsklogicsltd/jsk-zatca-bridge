"use client";

import { motion } from "framer-motion";
import { Check, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    selected: boolean;
    onClick: () => void;
    badge?: string;
    recommended?: boolean;
}

export function OptionCard({ title, description, icon: Icon, selected, onClick, badge, recommended }: OptionCardProps) {
    return (
        <motion.button
            onClick={onClick}
            className={cn(
                "relative p-6 rounded-xl border-2 text-left transition-all w-full",
                selected
                    ? "border-amber-500 bg-amber-50/50 shadow-md"
                    : "border-slate-200 bg-white hover:border-amber-300 hover:shadow-sm"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {recommended && (
                <span className="absolute -top-3 left-4 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                    Recommended
                </span>
            )}

            <div className="flex items-start gap-4">
                <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                    selected ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"
                )}>
                    <Icon size={24} />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{title}</h3>
                        {badge && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-600">{description}</p>
                </div>

                {selected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    >
                        <Check size={16} />
                    </motion.div>
                )}
            </div>
        </motion.button>
    );
}
