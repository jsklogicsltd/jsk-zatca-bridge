"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { searchDocs, docCategories } from "@/lib/mockData/docs";

interface DocsSearchBarProps {
    large?: boolean;
}

const popularSearches = ["CSID", "invoice", "API", "VAT", "integration"];

export function DocsSearchBar({ large }: DocsSearchBarProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<ReturnType<typeof searchDocs>>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (query.length > 1) {
            const searchResults = searchDocs(query);
            setResults(searchResults);
            setIsOpen(true);
        } else {
            setResults([]);
            setIsOpen(query.length > 0);
        }
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === "Escape") {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="relative">
            <div className="relative">
                <Search
                    size={large ? 20 : 16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search documentation..."
                    className={`w-full ${large ? "h-14 text-lg pl-12 pr-12" : "h-10 text-sm pl-10 pr-10"
                        } rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setIsOpen(false);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X size={16} />
                    </button>
                )}
                {!query && !large && (
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs bg-slate-100 text-slate-500 rounded">
                        /
                    </kbd>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50"
                    >
                        {results.length > 0 ? (
                            <div className="p-2 max-h-80 overflow-y-auto">
                                {results.map((article, index) => (
                                    <motion.div
                                        key={article.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            href={`/docs/${article.categoryId}/${article.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="block p-3 rounded-lg hover:bg-slate-50"
                                        >
                                            <p className="font-medium text-slate-900 text-sm">{article.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{article.description}</p>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        ) : query.length > 1 ? (
                            <div className="p-4 text-center text-sm text-slate-500">
                                No results found for "{query}"
                            </div>
                        ) : (
                            <div className="p-4">
                                <p className="text-xs text-slate-500 mb-2">Popular searches</p>
                                <div className="flex flex-wrap gap-2">
                                    {popularSearches.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => setQuery(term)}
                                            className="px-3 py-1 text-sm bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
