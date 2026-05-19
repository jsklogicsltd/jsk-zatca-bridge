"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Code2,
    Copy,
    Check,
    ChevronRight,
    Terminal,
    Key,
    FileJson,
    Send,
} from "lucide-react";

const endpoints = [
    {
        method: "POST",
        path: "/api/v1/invoices/sign-invoice",
        description: "Sign and validate an invoice",
        tag: "Invoices",
    },
    {
        method: "POST",
        path: "/api/v1/invoices/submit-to-zatca",
        description: "Submit invoice to ZATCA",
        tag: "Invoices",
    },
    {
        method: "GET",
        path: "/api/v1/invoices",
        description: "List all invoices",
        tag: "Invoices",
    },
    {
        method: "POST",
        path: "/api/v1/upload/batch",
        description: "Batch upload invoices",
        tag: "Upload",
    },
    {
        method: "POST",
        path: "/api/v1/upload/pdf",
        description: "Parse PDF invoice",
        tag: "Upload",
    },
    {
        method: "GET",
        path: "/api/v1/stats",
        description: "Get dashboard statistics",
        tag: "Dashboard",
    },
];

const codeExample = `curl -X POST "https://api.zatca-bridge.sa/v1/invoices/sign" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "invoice_number": "INV-2026-001",
    "issue_date": "2026-01-30",
    "supplier": {
      "trn": "310122393500003",
      "name": "ABC Trading Company"
    },
    "line_items": [...]
  }'`;

export default function ApiReferencePage() {
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(codeExample);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case "GET":
                return "bg-emerald-100 text-emerald-700";
            case "POST":
                return "bg-blue-100 text-blue-700";
            case "PUT":
                return "bg-amber-100 text-amber-700";
            case "DELETE":
                return "bg-red-100 text-red-700";
            default:
                return "bg-stone-100 text-stone-700";
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-stone-900 mb-2">
                    API Reference
                </h1>
                <p className="text-stone-500">
                    Complete API documentation for ZATCA Bridge integration
                </p>
            </div>

            {/* Quick Start */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-900 rounded-2xl p-6 mb-8"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-amber-400" />
                        <span className="text-white font-medium">Quick Start Example</span>
                    </div>
                    <button
                        onClick={copyCode}
                        className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 rounded-lg text-stone-300 hover:text-white transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span className="text-sm">Copy</span>
                            </>
                        )}
                    </button>
                </div>
                <pre className="text-sm text-stone-300 overflow-x-auto">
                    <code>{codeExample}</code>
                </pre>
            </motion.div>

            {/* Authentication */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-stone-200 p-6 mb-8"
            >
                <div className="flex items-center gap-3 mb-4">
                    <Key className="w-5 h-5 text-amber-600" />
                    <h2 className="text-lg font-semibold text-stone-900">Authentication</h2>
                </div>
                <p className="text-stone-600 mb-4">
                    All API requests require a Bearer token in the Authorization header.
                </p>
                <div className="bg-stone-50 rounded-lg p-4 font-mono text-sm">
                    Authorization: Bearer {'<'}your-api-key{'>'}
                </div>
            </motion.div>

            {/* Endpoints */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
            >
                <div className="p-6 border-b border-stone-200">
                    <div className="flex items-center gap-3">
                        <FileJson className="w-5 h-5 text-amber-600" />
                        <h2 className="text-lg font-semibold text-stone-900">Endpoints</h2>
                    </div>
                </div>

                <div className="divide-y divide-stone-100">
                    {endpoints.map((endpoint, index) => (
                        <div
                            key={index}
                            className="p-4 hover:bg-stone-50 transition-colors cursor-pointer flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <span
                                    className={`px-2 py-1 rounded text-xs font-mono font-semibold ${getMethodColor(
                                        endpoint.method
                                    )}`}
                                >
                                    {endpoint.method}
                                </span>
                                <span className="font-mono text-sm text-stone-700">
                                    {endpoint.path}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-stone-500 hidden md:block">
                                    {endpoint.description}
                                </span>
                                <span className="px-2 py-0.5 bg-stone-100 rounded text-xs text-stone-600">
                                    {endpoint.tag}
                                </span>
                                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Base URL */}
            <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                <Send className="w-5 h-5 text-amber-600" />
                <div>
                    <span className="text-stone-600">Base URL: </span>
                    <code className="text-amber-700 font-mono">
                        http://localhost:8000/api/v1
                    </code>
                </div>
            </div>
        </div>
    );
}
