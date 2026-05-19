"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    disabled?: boolean;
}

export function OTPInput({ length = 6, onComplete, disabled }: OTPInputProps) {
    const [values, setValues] = useState<string[]>(Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only digits

        const newValues = [...values];
        newValues[index] = value.slice(-1); // Take last digit
        setValues(newValues);

        // Auto-advance to next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check completion
        const otp = newValues.join("");
        if (otp.length === length && !newValues.includes("")) {
            onComplete(otp);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !values[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);

        if (pastedData) {
            const newValues = [...values];
            for (let i = 0; i < pastedData.length; i++) {
                newValues[i] = pastedData[i];
            }
            setValues(newValues);

            // Focus appropriate input
            const nextIndex = Math.min(pastedData.length, length - 1);
            inputRefs.current[nextIndex]?.focus();

            if (pastedData.length === length) {
                onComplete(pastedData);
            }
        }
    };

    return (
        <div className="flex justify-center gap-3">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={values[index]}
                    disabled={disabled}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={cn(
                        "w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all",
                        "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500",
                        "disabled:bg-slate-100 disabled:cursor-not-allowed",
                        values[index] ? "border-amber-400 bg-amber-50" : "border-slate-300"
                    )}
                />
            ))}
        </div>
    );
}
