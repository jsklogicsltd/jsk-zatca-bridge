"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
    code: string;
    language?: string;
}

export function CodeBlock({ code, language = "javascript" }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-4">
            <div className="absolute right-2 top-2 z-10">
                <button
                    onClick={handleCopy}
                    className={cn(
                        "p-2 rounded-lg transition-all",
                        copied
                            ? "bg-green-500 text-white"
                            : "bg-slate-700 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100"
                    )}
                >
                    {copied ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check size={14} />
                        </motion.div>
                    ) : (
                        <Copy size={14} />
                    )}
                </button>
            </div>
            <div className="bg-slate-900 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>{language}</span>
                </div>
                <pre className="p-4 overflow-x-auto">
                    <code className="text-sm text-slate-100 font-mono whitespace-pre">
                        {code}
                    </code>
                </pre>
            </div>
        </div>
    );
}
