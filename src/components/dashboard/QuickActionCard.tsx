"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, CheckCircle, Download, BookOpen, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickActionCardProps {
    id: string;
    label: string;
    description: string;
    icon: "Upload" | "CheckCircle" | "Download" | "BookOpen";
    href: string;
    index?: number;
}

const iconMap = {
    Upload,
    CheckCircle,
    Download,
    BookOpen,
};

export function QuickActionCard({ label, description, icon, href, index = 0 }: QuickActionCardProps) {
    const Icon = iconMap[icon];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <Link href={href}>
                <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 hover:border-amber-400 transition-all duration-200 border-slate-200 group cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                        <ArrowRight size={16} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="mt-3">
                        <p className="font-semibold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
}
