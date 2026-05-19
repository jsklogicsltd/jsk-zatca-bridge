"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: LucideIcon;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, icon: Icon, className, ...props }, ref) => {
        return (
            <div className="space-y-2">
                <Label htmlFor={props.id} className="text-sm font-medium text-slate-700">
                    {label}
                </Label>
                <div className="relative">
                    {Icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Icon size={18} />
                        </div>
                    )}
                    <Input
                        ref={ref}
                        className={cn(
                            "h-10 transition-colors",
                            Icon && "pl-10",
                            error && "border-red-500 focus-visible:ring-red-500",
                            className
                        )}
                        {...props}
                    />
                </div>
                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs text-red-600"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

FormInput.displayName = "FormInput";
