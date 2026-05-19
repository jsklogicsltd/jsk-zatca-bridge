"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    CheckCircle,
    AlertCircle,
    XCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Mail,
    Lock,
    User,
    Search,
} from "lucide-react";

export default function StyleGuidePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Design System</h1>
                    <p className="text-lg text-slate-600">
                        ZATCA Bridge component library and design guidelines
                    </p>
                </div>

                {/* Color Palette */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Color Palette</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="h-24 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 mb-2" />
                            <p className="text-sm font-medium">Primary Amber</p>
                            <p className="text-xs text-slate-500">#f59e0b → #d97706</p>
                        </div>
                        <div>
                            <div className="h-24 rounded-lg bg-slate-900 mb-2" />
                            <p className="text-sm font-medium">Slate 900</p>
                            <p className="text-xs text-slate-500">#0f172a</p>
                        </div>
                        <div>
                            <div className="h-24 rounded-lg bg-green-600 mb-2" />
                            <p className="text-sm font-medium">Success</p>
                            <p className="text-xs text-slate-500">#16a34a</p>
                        </div>
                        <div>
                            <div className="h-24 rounded-lg bg-red-600 mb-2" />
                            <p className="text-sm font-medium">Error</p>
                            <p className="text-xs text-slate-500">#dc2626</p>
                        </div>
                    </div>
                </section>

                {/* Typography */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Typography</h2>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <h1 className="text-4xl font-bold">Heading 1</h1>
                                <code className="text-xs text-slate-500">text-4xl font-bold</code>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">Heading 2</h2>
                                <code className="text-xs text-slate-500">text-3xl font-bold</code>
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold">Heading 3</h3>
                                <code className="text-xs text-slate-500">text-2xl font-semibold</code>
                            </div>
                            <div>
                                <p className="text-base">Body text - Inter font family</p>
                                <code className="text-xs text-slate-500">text-base</code>
                            </div>
                            <div>
                                <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                                    Monospace - JetBrains Mono
                                </code>
                                <code className="text-xs text-slate-500 block mt-1">
                                    font-mono
                                </code>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Buttons */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Buttons</h2>
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-3">Primary</p>
                                    <div className="flex flex-wrap gap-3">
                                        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                                            Primary Button
                                        </Button>
                                        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white" size="sm">
                                            Small
                                        </Button>
                                        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white" size="lg">
                                            Large
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-3">Secondary</p>
                                    <div className="flex flex-wrap gap-3">
                                        <Button variant="outline">Secondary Button</Button>
                                        <Button variant="outline" size="sm">Small</Button>
                                        <Button variant="outline" size="lg">Large</Button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-3">Ghost</p>
                                    <div className="flex flex-wrap gap-3">
                                        <Button variant="ghost">Ghost Button</Button>
                                        <Button variant="ghost" size="sm">Small</Button>
                                        <Button variant="ghost" size="lg">Large</Button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-3">Destructive</p>
                                    <div className="flex flex-wrap gap-3">
                                        <Button variant="destructive">Delete</Button>
                                        <Button variant="destructive" size="sm">Remove</Button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-3">With Icons</p>
                                    <div className="flex flex-wrap gap-3">
                                        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                                            <FileText className="mr-2 h-4 w-4" />
                                            New Invoice
                                        </Button>
                                        <Button variant="outline">
                                            <Search className="mr-2 h-4 w-4" />
                                            Search
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Form Inputs */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Form Inputs</h2>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Text Input
                                </label>
                                <Input placeholder="Enter text..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email Input
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input placeholder="email@example.com" className="pl-10" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Password Input
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input type="password" placeholder="••••••••" className="pl-10" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Search Input
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input placeholder="Search..." className="pl-10" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Badges */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Badges</h2>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap gap-3">
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Success
                                </Badge>
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Pending
                                </Badge>
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Failed
                                </Badge>
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    Info
                                </Badge>
                                <Badge variant="outline">Default</Badge>
                                <Badge className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800">
                                    Premium
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Icons */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Icons (Lucide)</h2>
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
                                {[
                                    { Icon: FileText, label: "FileText" },
                                    { Icon: CheckCircle, label: "CheckCircle" },
                                    { Icon: XCircle, label: "XCircle" },
                                    { Icon: AlertCircle, label: "AlertCircle" },
                                    { Icon: Clock, label: "Clock" },
                                    { Icon: TrendingUp, label: "TrendingUp" },
                                    { Icon: TrendingDown, label: "TrendingDown" },
                                    { Icon: Mail, label: "Mail" },
                                    { Icon: Lock, label: "Lock" },
                                    { Icon: User, label: "User" },
                                    { Icon: Search, label: "Search" },
                                ].map(({ Icon, label }) => (
                                    <div key={label} className="flex flex-col items-center gap-2">
                                        <Icon className="h-6 w-6 text-slate-700" />
                                        <span className="text-xs text-slate-500">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Cards */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Cards</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Default Card</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">
                                    This is a basic card component with header and content sections.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-transparent">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                    Highlighted Card
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600">
                                    Card with amber accent for important information.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Spacing System */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Spacing Scale</h2>
                    <Card>
                        <CardContent className="p-6 space-y-3">
                            {[1, 2, 3, 4, 6, 8, 12, 16].map((size) => (
                                <div key={size} className="flex items-center gap-4">
                                    <code className="text-sm w-16">p-{size}</code>
                                    <div
                                        className="bg-amber-200 h-8"
                                        style={{ width: `${size * 4}px` }}
                                    />
                                    <span className="text-sm text-slate-500">{size * 4}px</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}
