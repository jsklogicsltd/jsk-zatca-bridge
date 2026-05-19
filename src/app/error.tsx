"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to console (prepare for future error tracking service)
        console.error("Application Error:", {
            message: error.message,
            digest: error.digest,
            stack: error.stack,
            timestamp: new Date().toISOString(),
        });
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-10 w-10 text-red-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Something went wrong
                </h1>

                <p className="text-slate-600 mb-6">
                    We encountered an unexpected error. Don't worry, our team has been notified and we're working on it.
                </p>

                {/* Show error message in development */}
                {process.env.NODE_ENV === "development" && error.message && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                        <p className="text-sm font-mono text-red-800 break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={reset}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>

                    <Link href="/dashboard">
                        <Button variant="outline">
                            <Home className="mr-2 h-4 w-4" />
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-sm text-slate-500">
                        Need help?{" "}
                        <Link
                            href="/support"
                            className="text-amber-600 hover:text-amber-700 underline"
                        >
                            Contact Support
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
}
