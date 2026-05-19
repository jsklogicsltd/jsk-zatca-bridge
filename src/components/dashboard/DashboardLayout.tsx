"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardContextType {
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    mobileSidebarOpen: boolean;
    setMobileSidebarOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboard must be used within DashboardLayout");
    }
    return context;
}

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <DashboardContext.Provider
            value={{
                sidebarCollapsed,
                setSidebarCollapsed,
                mobileSidebarOpen,
                setMobileSidebarOpen,
            }}
        >
            <div className="min-h-screen bg-stone-50">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div
                    className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[240px]"
                        }`}
                >
                    {/* Header */}
                    <Header />

                    {/* Page Content */}
                    <main className="p-6">{children}</main>
                </div>

                {/* Mobile Sidebar Overlay */}
                {mobileSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}
            </div>
        </DashboardContext.Provider>
    );
}
