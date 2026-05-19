"use client";

import { Info, AlertTriangle, AlertCircle, CheckCircle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "warning" | "danger" | "success";

interface CalloutProps {
    type: CalloutType;
    title?: string;
    children: React.ReactNode;
}

const config: Record<CalloutType, { icon: LucideIcon; bg: string; border: string; title: string }> = {
    info: { icon: Info, bg: "bg-blue-50", border: "border-blue-200", title: "text-blue-700" },
    warning: { icon: AlertTriangle, bg: "bg-amber-50", border: "border-amber-200", title: "text-amber-700" },
    danger: { icon: AlertCircle, bg: "bg-red-50", border: "border-red-200", title: "text-red-700" },
    success: { icon: CheckCircle, bg: "bg-green-50", border: "border-green-200", title: "text-green-700" },
};

export function Callout({ type, title, children }: CalloutProps) {
    const { icon: Icon, bg, border, title: titleColor } = config[type];

    return (
        <div className={cn("my-4 p-4 rounded-lg border", bg, border)}>
            <div className="flex gap-3">
                <Icon size={20} className={titleColor} />
                <div>
                    {title && <p className={cn("font-medium mb-1", titleColor)}>{title}</p>}
                    <div className="text-sm text-slate-700">{children}</div>
                </div>
            </div>
        </div>
    );
}
