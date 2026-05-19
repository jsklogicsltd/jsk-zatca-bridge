"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Send, LayoutGrid, Home, HelpCircle } from "lucide-react";
import { apiEndpoints } from "@/lib/mockData/docs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const methodColors = {
    GET: "bg-green-100 text-green-700",
    POST: "bg-amber-100 text-amber-700",
    PUT: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
};

const categories = [...new Set(apiEndpoints.map((e) => e.category))];

export default function APIReferencePage() {
    const [selectedEndpoint, setSelectedEndpoint] = useState(apiEndpoints[0]);
    const [activeTab, setActiveTab] = useState<"curl" | "javascript" | "python">("curl");
    const [copied, setCopied] = useState(false);

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const curlExample = `curl -X ${selectedEndpoint.method} \\
  https://api.zatcabridge.com${selectedEndpoint.path} \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"${selectedEndpoint.requestBody ? ` \\
  -d '${selectedEndpoint.requestBody}'` : ""}`;

    const jsExample = `const response = await fetch('https://api.zatcabridge.com${selectedEndpoint.path}', {
  method: '${selectedEndpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }${selectedEndpoint.requestBody ? `,
  body: JSON.stringify(${selectedEndpoint.requestBody})` : ""}
});`;

    return (
        <div className="min-h-screen bg-white">
            {/* Top Navigation */}
            <nav className="bg-slate-900 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-white font-semibold">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Z</span>
                        </div>
                        ZATCA Bridge
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm">
                            <Home size={16} />
                            Home
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm">
                            <LayoutGrid size={16} />
                            Dashboard
                        </Link>
                        <Link href="/help" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm">
                            <HelpCircle size={16} />
                            Help
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto flex">
                {/* Sidebar */}
                <aside className="w-72 flex-shrink-0 border-r border-slate-200 py-8 px-4 sticky top-0 h-screen overflow-y-auto hidden lg:block">
                    <Link href="/docs" className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600 mb-6">
                        <ArrowLeft size={14} />
                        Back to docs
                    </Link>

                    <h2 className="text-lg font-bold text-slate-900 mb-4">API Reference</h2>

                    {categories.map((cat) => (
                        <div key={cat} className="mb-6">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">{cat}</h3>
                            <nav className="space-y-1">
                                {apiEndpoints
                                    .filter((e) => e.category === cat)
                                    .map((endpoint) => (
                                        <button
                                            key={endpoint.id}
                                            onClick={() => setSelectedEndpoint(endpoint)}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                                                selectedEndpoint.id === endpoint.id
                                                    ? "bg-amber-500/10 text-amber-600"
                                                    : "text-slate-600 hover:bg-slate-100"
                                            )}
                                        >
                                            <span className={cn("px-1.5 py-0.5 text-xs font-mono rounded", methodColors[endpoint.method])}>
                                                {endpoint.method}
                                            </span>
                                            <span className="truncate">{endpoint.path}</span>
                                        </button>
                                    ))}
                            </nav>
                        </div>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 py-8 px-6 lg:px-12">
                    <motion.div
                        key={selectedEndpoint.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Endpoint Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className={cn("px-2 py-1 text-sm font-mono rounded", methodColors[selectedEndpoint.method])}>
                                {selectedEndpoint.method}
                            </span>
                            <code className="text-lg font-mono text-slate-900">{selectedEndpoint.path}</code>
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{selectedEndpoint.title}</h1>
                        <p className="text-slate-600 mb-8">{selectedEndpoint.description}</p>

                        {/* Parameters */}
                        {selectedEndpoint.parameters.length > 0 && (
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-base">Parameters</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <table className="w-full text-sm">
                                        <thead className="border-b border-slate-200">
                                            <tr className="text-slate-500 text-left">
                                                <th className="py-2 font-medium">Name</th>
                                                <th className="py-2 font-medium">Type</th>
                                                <th className="py-2 font-medium">Required</th>
                                                <th className="py-2 font-medium">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedEndpoint.parameters.map((param) => (
                                                <tr key={param.name}>
                                                    <td className="py-2 font-mono text-amber-600">{param.name}</td>
                                                    <td className="py-2 text-slate-500">{param.type}</td>
                                                    <td className="py-2">
                                                        {param.required ? (
                                                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">required</span>
                                                        ) : (
                                                            <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">optional</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 text-slate-600">{param.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        )}

                        {/* Request Body */}
                        {selectedEndpoint.requestBody && (
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-base">Request Body</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-sm text-slate-100 font-mono">{selectedEndpoint.requestBody}</pre>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Code Examples */}
                        <Card className="border-slate-200 mb-6">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Example Request</CardTitle>
                                <div className="flex bg-slate-100 rounded-lg p-1">
                                    {(["curl", "javascript", "python"] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={cn(
                                                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                                                activeTab === tab
                                                    ? "bg-white text-slate-900 shadow-sm"
                                                    : "text-slate-600 hover:text-slate-900"
                                            )}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <button
                                        onClick={() => handleCopy(activeTab === "curl" ? curlExample : jsExample)}
                                        className="absolute right-2 top-2 p-2 rounded-lg bg-slate-700 text-slate-400 hover:text-white"
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-sm text-slate-100 font-mono whitespace-pre">
                                            {activeTab === "curl" ? curlExample : jsExample}
                                        </pre>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Response */}
                        <Card className="border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-base">Response</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-slate-100 font-mono">{selectedEndpoint.responseExample}</pre>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
