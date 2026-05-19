"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

interface SocialButtonProps {
    provider: "google" | "microsoft";
    onClick?: () => void;
}

export function SocialButton({ provider, onClick }: SocialButtonProps) {
    const config = {
        google: {
            icon: <FcGoogle size={20} />,
            label: "Continue with Google",
        },
        microsoft: {
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                    <path d="M0 0h11v11H0z" fill="#f25022" />
                    <path d="M12 0h11v11H12z" fill="#00a4ef" />
                    <path d="M0 12h11v11H0z" fill="#ffb900" />
                    <path d="M12 12h11v11H12z" fill="#7fba00" />
                </svg>
            ),
            label: "Continue with Microsoft",
        },
    };

    const { icon, label } = config[provider];

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full h-10 gap-2 hover:bg-slate-50"
            onClick={onClick}
        >
            {icon}
            <span className="text-sm">{label}</span>
        </Button>
    );
}
