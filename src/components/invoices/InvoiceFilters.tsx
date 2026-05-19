"use client";

import { Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { InvoiceStatus } from "@/lib/mockData/invoices";

interface InvoiceFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: InvoiceStatus | "all";
    onStatusChange: (value: InvoiceStatus | "all") => void;
    startDate: string;
    onStartDateChange: (value: string) => void;
    endDate: string;
    onEndDateChange: (value: string) => void;
}

export function InvoiceFilters({
    search,
    onSearchChange,
    status,
    onStatusChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
}: InvoiceFiltersProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search by invoice number, customer..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value as InvoiceStatus | "all")}
                    className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                    <option value="all">All Statuses</option>
                    <option value="cleared">Cleared</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="rejected">Rejected</option>
                </select>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="gap-2">
                    <Download size={16} />
                    Export
                </Button>
                <Link href="/dashboard/invoices/new">
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                        New Invoice
                    </Button>
                </Link>
            </div>
        </div>
    );
}
