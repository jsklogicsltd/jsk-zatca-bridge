"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2,
    FileText,
    Bell,
    Key,
    Shield,
    Save,
    Upload,
    Eye,
    EyeOff,
    Copy,
    CheckCircle,
    RefreshCw,
    Smartphone,
    Monitor,
    Globe,
    LogOut,
    Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    companySettings,
    invoiceDefaults,
    notificationPrefs,
    apiSettings,
    activeSessions,
    webhookLogs,
} from "@/lib/mockData/csid";
import { cn } from "@/lib/utils";

const tabs = [
    { id: "company", label: "Company Profile", icon: Building2 },
    { id: "invoices", label: "Invoice Defaults", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "api", label: "API Access", icon: Key },
    { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("company");
    const [showApiKey, setShowApiKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 1000));
        setSaving(false);
    };

    const maskApiKey = (key: string) => {
        return key.slice(0, 8) + "••••••••••••" + key.slice(-4);
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage your account and application preferences
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Tab Navigation */}
                    <div className="lg:w-56 flex-shrink-0">
                        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                                            activeTab === tab.id
                                                ? "bg-amber-500/10 text-amber-600 font-medium"
                                                : "text-slate-600 hover:bg-slate-100"
                                        )}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {/* Company Profile */}
                            {activeTab === "company" && (
                                <motion.div
                                    key="company"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Card className="border-slate-200">
                                        <CardHeader>
                                            <CardTitle>Company Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Legal Name</Label>
                                                    <Input defaultValue={companySettings.legalName} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label>Commercial Registration</Label>
                                                    <Input defaultValue={companySettings.commercialRegNumber} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label>VAT Number</Label>
                                                    <Input defaultValue={companySettings.vatNumber} disabled className="mt-1 bg-slate-100" />
                                                    <p className="text-xs text-slate-500 mt-1">Locked after verification</p>
                                                </div>
                                                <div>
                                                    <Label>Contact Email</Label>
                                                    <Input defaultValue={companySettings.email} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label>Phone</Label>
                                                    <Input defaultValue={companySettings.phone} className="mt-1" />
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Street Address</Label>
                                                <Input defaultValue={companySettings.address.street} className="mt-1" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label>City</Label>
                                                    <Input defaultValue={companySettings.address.city} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label>Postal Code</Label>
                                                    <Input defaultValue={companySettings.address.postalCode} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label>Country</Label>
                                                    <Input defaultValue={companySettings.address.country} className="mt-1" />
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Company Logo</Label>
                                                <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                                                    <Upload size={24} className="text-slate-400 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-500">Drag and drop or click to upload</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Invoice Defaults */}
                            {activeTab === "invoices" && (
                                <motion.div
                                    key="invoices"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Card className="border-slate-200">
                                        <CardHeader>
                                            <CardTitle>Invoice Defaults</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Payment Terms</Label>
                                                    <select defaultValue={invoiceDefaults.paymentTerms} className="w-full h-10 px-3 mt-1 rounded-md border border-slate-200">
                                                        <option value="immediate">Due on Receipt</option>
                                                        <option value="net15">Net 15</option>
                                                        <option value="net30">Net 30</option>
                                                        <option value="net60">Net 60</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label>Currency</Label>
                                                    <Input value="SAR" disabled className="mt-1 bg-slate-100" />
                                                </div>
                                                <div>
                                                    <Label>Default Tax Rate</Label>
                                                    <select defaultValue={String(invoiceDefaults.defaultTaxRate)} className="w-full h-10 px-3 mt-1 rounded-md border border-slate-200">
                                                        <option value="15">15% VAT</option>
                                                        <option value="0">0% (Zero-rated)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label>Invoice Prefix</Label>
                                                    <Input defaultValue={invoiceDefaults.invoicePrefix} className="mt-1" />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label>Invoice Number Pattern</Label>
                                                    <Input defaultValue={invoiceDefaults.invoicePattern} className="mt-1" />
                                                    <p className="text-xs text-slate-500 mt-1">Use {"{YYYY}"} for year, {"{######}"} for sequence</p>
                                                </div>
                                                <div>
                                                    <Label>Starting Number</Label>
                                                    <Input type="number" defaultValue={invoiceDefaults.startingNumber} className="mt-1" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Notifications */}
                            {activeTab === "notifications" && (
                                <motion.div
                                    key="notifications"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Card className="border-slate-200">
                                        <CardHeader>
                                            <CardTitle>Email Notifications</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-4">
                                                {[
                                                    { key: "invoiceCleared", label: "Invoice cleared successfully" },
                                                    { key: "invoiceFailed", label: "Invoice failed validation" },
                                                    { key: "csidExpiring", label: "CSID certificate expiring soon" },
                                                    { key: "weeklySummary", label: "Weekly summary report" },
                                                    { key: "maintenanceAlerts", label: "System maintenance alerts" },
                                                ].map((item) => (
                                                    <label key={item.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                        <span className="text-sm">{item.label}</span>
                                                        <input
                                                            type="checkbox"
                                                            defaultChecked={(notificationPrefs as Record<string, unknown>)[item.key] as boolean}
                                                            className="accent-amber-500 w-4 h-4"
                                                        />
                                                    </label>
                                                ))}
                                            </div>

                                            <div>
                                                <Label>Notification Timing</Label>
                                                <div className="flex gap-4 mt-2">
                                                    <label className="flex items-center gap-2">
                                                        <input type="radio" name="timing" defaultChecked={notificationPrefs.timing === "realtime"} className="accent-amber-500" />
                                                        <span className="text-sm">Real-time</span>
                                                    </label>
                                                    <label className="flex items-center gap-2">
                                                        <input type="radio" name="timing" defaultChecked={notificationPrefs.timing === "digest"} className="accent-amber-500" />
                                                        <span className="text-sm">Daily Digest</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Notification Email</Label>
                                                <Input defaultValue={notificationPrefs.notificationEmail} className="mt-1" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* API Access */}
                            {activeTab === "api" && (
                                <motion.div
                                    key="api"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <Card className="border-slate-200">
                                        <CardHeader>
                                            <CardTitle>API Key</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-slate-100 px-4 py-2 rounded-lg font-mono text-sm">
                                                    {showApiKey ? apiSettings.apiKey : maskApiKey(apiSettings.apiKey)}
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                                                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleCopy(apiSettings.apiKey)}>
                                                    {copied ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                                                </Button>
                                            </div>
                                            <p className="text-xs text-amber-600">⚠️ Keep your API key secure. Never share it publicly.</p>
                                            <Button variant="outline">
                                                <RefreshCw size={16} className="mr-2" />
                                                Regenerate Key
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-slate-200">
                                        <CardHeader>
                                            <CardTitle>Webhook Configuration</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label>Webhook URL</Label>
                                                <Input defaultValue={apiSettings.webhookUrl} className="mt-1" />
                                            </div>
                                            <div>
                                                <Label>Events</Label>
                                                <div className="space-y-2 mt-2">
                                                    {["invoice.cleared", "invoice.failed", "csid.expiring"].map((event) => (
                                                        <label key={event} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                defaultChecked={apiSettings.webhookEvents.includes(event)}
                                                                className="accent-amber-500"
                                                            />
                                                            <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{event}</code>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">Test Webhook</Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Security */}
                            {activeTab === "security" && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <Card className="border-slate-200">
                                        <CardHeader>
                                            <CardTitle>Two-Factor Authentication</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Enable 2FA</p>
                                                    <p className="text-sm text-slate-500">Add extra security to your account</p>
                                                </div>
                                                <input type="checkbox" className="accent-amber-500 w-5 h-5" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-slate-200">
                                        <CardHeader>
                                            <CardTitle>Active Sessions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {activeSessions.map((session) => (
                                                    <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            {session.device.includes("iPhone") ? <Smartphone size={20} /> : <Monitor size={20} />}
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {session.device} • {session.browser}
                                                                    {session.isCurrent && (
                                                                        <span className="ml-2 text-xs text-green-600">(Current)</span>
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    <Globe size={10} className="inline mr-1" />
                                                                    {session.location} • {session.ip}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {!session.isCurrent && (
                                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                                <LogOut size={14} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <Button variant="outline" className="w-full mt-4">Sign out all other sessions</Button>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-slate-200">
                                        <CardHeader>
                                            <CardTitle>Change Password</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label>Current Password</Label>
                                                <Input type="password" className="mt-1" />
                                            </div>
                                            <div>
                                                <Label>New Password</Label>
                                                <Input type="password" className="mt-1" />
                                            </div>
                                            <div>
                                                <Label>Confirm New Password</Label>
                                                <Input type="password" className="mt-1" />
                                            </div>
                                            <Button>Update Password</Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Save Button */}
                        <div className="sticky bottom-0 bg-stone-50 py-4 border-t border-slate-200 mt-6 -mx-6 px-6">
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 size={16} className="mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} className="mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
