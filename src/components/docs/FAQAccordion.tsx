"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FAQItem } from "@/lib/mockData/docs";

interface FAQAccordionProps {
    items: FAQItem[];
    category?: string;
}

export function FAQAccordion({ items, category }: FAQAccordionProps) {
    const [openId, setOpenId] = useState<string | null>(null);
    const [helpful, setHelpful] = useState<Record<string, boolean | null>>({});

    const filteredItems = category ? items.filter((i) => i.category === category) : items;

    return (
        <div className="space-y-3">
            {filteredItems.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setOpenId(openId === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50"
                    >
                        <span className="font-medium text-slate-900">{item.question}</span>
                        <ChevronDown
                            size={20}
                            className={cn(
                                "text-slate-400 transition-transform",
                                openId === item.id && "rotate-180"
                            )}
                        />
                    </button>

                    <AnimatePresence>
                        {openId === item.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="px-4 pb-4">
                                    <p className="text-sm text-slate-600 mb-4">{item.answer}</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span>Was this helpful?</span>
                                        <button
                                            onClick={() => setHelpful({ ...helpful, [item.id]: true })}
                                            className={cn(
                                                "p-1.5 rounded hover:bg-green-100",
                                                helpful[item.id] === true && "bg-green-100 text-green-600"
                                            )}
                                        >
                                            <ThumbsUp size={14} />
                                        </button>
                                        <button
                                            onClick={() => setHelpful({ ...helpful, [item.id]: false })}
                                            className={cn(
                                                "p-1.5 rounded hover:bg-red-100",
                                                helpful[item.id] === false && "bg-red-100 text-red-600"
                                            )}
                                        >
                                            <ThumbsDown size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
