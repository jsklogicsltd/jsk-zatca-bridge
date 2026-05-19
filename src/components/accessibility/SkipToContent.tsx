"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SkipToContent() {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Link
            href="#main-content"
            className={`
        fixed top-4 left-4 z-[100]
        bg-amber-600 text-white
        px-4 py-2 rounded-md
        font-medium text-sm
        flex items-center gap-2
        shadow-lg
        transition-transform duration-200
        ${isFocused ? "translate-y-0" : "-translate-y-20"}
        focus:translate-y-0
        outline-none ring-2 ring-amber-400 ring-offset-2
      `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onClick={() => {
                const mainContent = document.getElementById("main-content");
                if (mainContent) {
                    mainContent.focus();
                    mainContent.scrollIntoView({ behavior: "smooth" });
                }
            }}
        >
            Skip to main content
            <ChevronRight className="h-4 w-4" />
        </Link>
    );
}
