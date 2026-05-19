"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock, ThumbsUp, ThumbsDown, LayoutGrid, Home, HelpCircle } from "lucide-react";
import { docArticles, docCategories } from "@/lib/mockData/docs";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Simple markdown-like renderer
function renderContent(content: string) {
    const lines = content.trim().split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;
    let codeBuffer: string[] = [];
    let inCodeBlock = false;
    let codeLang = "";

    while (i < lines.length) {
        const line = lines[i];

        // Code blocks
        if (line.startsWith("```")) {
            if (inCodeBlock) {
                elements.push(<CodeBlock key={i} code={codeBuffer.join("\n")} language={codeLang} />);
                codeBuffer = [];
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
                codeLang = line.slice(3) || "text";
            }
            i++;
            continue;
        }

        if (inCodeBlock) {
            codeBuffer.push(line);
            i++;
            continue;
        }

        // Callouts
        if (line.startsWith("> **Note:**") || line.startsWith("> **Info:**")) {
            elements.push(<Callout key={i} type="info">{line.replace(/> \*\*(Note|Info):\*\*/, "").trim()}</Callout>);
            i++;
            continue;
        }
        if (line.startsWith("> **Warning:**")) {
            elements.push(<Callout key={i} type="warning">{line.replace("> **Warning:**", "").trim()}</Callout>);
            i++;
            continue;
        }
        if (line.startsWith("> **Important:**")) {
            elements.push(<Callout key={i} type="danger">{line.replace("> **Important:**", "").trim()}</Callout>);
            i++;
            continue;
        }

        // Headings
        if (line.startsWith("# ")) {
            elements.push(<h1 key={i} className="text-3xl font-bold text-slate-900 mt-8 mb-4">{line.slice(2)}</h1>);
        } else if (line.startsWith("## ")) {
            elements.push(<h2 key={i} id={line.slice(3).toLowerCase().replace(/\s+/g, "-")} className="text-xl font-bold text-slate-900 mt-8 mb-3">{line.slice(3)}</h2>);
        } else if (line.startsWith("### ")) {
            elements.push(<h3 key={i} className="text-lg font-semibold text-slate-900 mt-6 mb-2">{line.slice(4)}</h3>);
        }
        // Lists
        else if (line.match(/^\d+\. /)) {
            elements.push(<li key={i} className="ml-6 mb-1 text-slate-700">{line.replace(/^\d+\. /, "")}</li>);
        } else if (line.startsWith("- ")) {
            elements.push(<li key={i} className="ml-6 mb-1 text-slate-700 list-disc">{line.slice(2)}</li>);
        }
        // Regular paragraphs
        else if (line.trim()) {
            elements.push(<p key={i} className="text-slate-700 my-3 leading-relaxed">{line}</p>);
        }

        i++;
    }

    return elements;
}

export default function ArticlePage({ params }: { params: Promise<{ category: string; article: string }> }) {
    const { category, article: articleId } = use(params);

    const article = docArticles.find((a) => a.id === articleId && a.categoryId === category);
    const categoryInfo = docCategories.find((c) => c.id === category);
    const categoryArticles = docArticles.filter((a) => a.categoryId === category);

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Article Not Found</h1>
                    <Link href="/docs" className="text-amber-600 mt-4 block">Back to Documentation</Link>
                </div>
            </div>
        );
    }

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
                <aside className="w-64 flex-shrink-0 border-r border-slate-200 py-8 px-4 sticky top-0 h-screen overflow-y-auto hidden lg:block">
                    <Link href="/docs" className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600 mb-6">
                        <ArrowLeft size={14} />
                        All docs
                    </Link>

                    <h3 className="font-semibold text-slate-900 mb-4">{categoryInfo?.title}</h3>
                    <nav className="space-y-1">
                        {categoryArticles.map((a) => (
                            <Link
                                key={a.id}
                                href={`/docs/${a.categoryId}/${a.id}`}
                                className={cn(
                                    "block px-3 py-2 rounded-lg text-sm transition-colors",
                                    a.id === articleId
                                        ? "bg-amber-500/10 text-amber-600 font-medium"
                                        : "text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                {a.title}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 py-8 px-6 lg:px-12">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                        <Link href="/docs" className="hover:text-amber-600">Docs</Link>
                        <ChevronRight size={14} />
                        <Link href={`/docs/${category}`} className="hover:text-amber-600">{categoryInfo?.title}</Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-900">{article.title}</span>
                    </nav>

                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">{article.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-8">
                            <span>Last updated: {formatDate(article.lastUpdated)}</span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {article.readingTime} min read
                            </span>
                        </div>

                        <div className="prose max-w-none">
                            {renderContent(article.content)}
                        </div>

                        {/* Feedback */}
                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <p className="text-sm text-slate-600 mb-3">Was this article helpful?</p>
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-green-50 hover:border-green-200 text-sm">
                                    <ThumbsUp size={14} /> Yes
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 text-sm">
                                    <ThumbsDown size={14} /> No
                                </button>
                            </div>
                        </div>
                    </motion.article>
                </main>
            </div>
        </div>
    );
}
