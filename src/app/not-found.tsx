"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Search, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
    const router = useRouter();

    const suggestions = [
        {
            title: "Dashboard",
            description: "View your ZATCA compliance overview",
            href: "/dashboard",
            icon: Home,
        },
        {
            title: "Documentation",
            description: "Learn about ZATCA Bridge features",
            href: "/docs",
            icon: BookOpen,
        },
        {
            title: "Search",
            description: "Find invoices and reports",
            href: "/dashboard/invoices",
            icon: Search,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* 404 Illustration */}
                <div className="text-center mb-8">
                    <div className="relative inline-block">
                        <h1 className="text-9xl font-bold text-slate-200 select-none">404</h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 opacity-20 blur-2xl" />
                        </div>
                    </div>
                </div>

                <Card className="p-8 text-center mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">
                        Page Not Found
                    </h2>
                    <p className="text-slate-600 mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go Back
                        </Button>

                        <Link href="/dashboard">
                            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                                <Home className="mr-2 h-4 w-4" />
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Helpful Suggestions */}
                <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700 text-center mb-4">
                        Here are some helpful links:
                    </p>

                    <div className="grid gap-3 md:grid-cols-3">
                        {suggestions.map((suggestion) => (
                            <Link key={suggestion.href} href={suggestion.href}>
                                <Card className="p-4 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group h-full">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                                            <suggestion.icon className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 mb-1 text-sm">
                                            {suggestion.title}
                                        </h3>
                                        <p className="text-xs text-slate-600">
                                            {suggestion.description}
                                        </p>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
