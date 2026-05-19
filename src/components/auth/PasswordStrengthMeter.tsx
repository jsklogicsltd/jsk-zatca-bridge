"use client";

import { motion } from "framer-motion";
import { calculatePasswordStrength } from "@/lib/validationSchemas";

interface PasswordStrengthMeterProps {
    password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
    if (!password) return null;

    const { score, label, color } = calculatePasswordStrength(password);

    return (
        <div className="space-y-2 mt-2">
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
            <p className="text-xs text-slate-600">
                Password strength: <span className="font-medium">{label}</span>
            </p>
        </div>
    );
}
