"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    Building2,
    MapPin,
    Key,
    Bell,
    Shield,
    Save,
    Camera,
} from "lucide-react";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-stone-900 mb-2">
                    Profile Settings
                </h1>
                <p className="text-stone-500">
                    Manage your account information and preferences
                </p>
            </div>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-stone-200 p-6 mb-6"
            >
                <div className="flex items-start gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                            AA
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-sm hover:bg-stone-50 transition-colors">
                            <Camera className="w-4 h-4 text-stone-500" />
                        </button>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-stone-900">Ahmed Al-Rashid</h2>
                        <p className="text-stone-500">Administrator</p>
                        <div className="mt-3 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">
                                Verified
                            </span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                                Pro Plan
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                    >
                        {isEditing ? "Cancel" : "Edit Profile"}
                    </button>
                </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-stone-200 p-6 mb-6"
            >
                <h3 className="text-lg font-semibold text-stone-900 mb-4">
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-stone-500 mb-1">Full Name</label>
                        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                            <User className="w-5 h-5 text-stone-400" />
                            <input
                                type="text"
                                defaultValue="Ahmed Al-Rashid"
                                disabled={!isEditing}
                                className="flex-1 bg-transparent outline-none text-stone-900 disabled:text-stone-600"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-stone-500 mb-1">Email</label>
                        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                            <Mail className="w-5 h-5 text-stone-400" />
                            <input
                                type="email"
                                defaultValue="ahmed@company.sa"
                                disabled={!isEditing}
                                className="flex-1 bg-transparent outline-none text-stone-900 disabled:text-stone-600"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-stone-500 mb-1">Phone</label>
                        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                            <Phone className="w-5 h-5 text-stone-400" />
                            <input
                                type="tel"
                                defaultValue="+966 50 123 4567"
                                disabled={!isEditing}
                                className="flex-1 bg-transparent outline-none text-stone-900 disabled:text-stone-600"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-stone-500 mb-1">Company</label>
                        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                            <Building2 className="w-5 h-5 text-stone-400" />
                            <input
                                type="text"
                                defaultValue="JSK Logics Ltd."
                                disabled={!isEditing}
                                className="flex-1 bg-transparent outline-none text-stone-900 disabled:text-stone-600"
                            />
                        </div>
                    </div>
                </div>
                {isEditing && (
                    <div className="mt-4 flex justify-end">
                        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Security */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-stone-200 p-6 mb-6"
            >
                <h3 className="text-lg font-semibold text-stone-900 mb-4">Security</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-stone-400" />
                            <div>
                                <p className="font-medium text-stone-900">Password</p>
                                <p className="text-sm text-stone-500">Last changed 30 days ago</p>
                            </div>
                        </div>
                        <button className="text-amber-600 hover:text-amber-700 font-medium text-sm">
                            Change
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-stone-400" />
                            <div>
                                <p className="font-medium text-stone-900">Two-Factor Authentication</p>
                                <p className="text-sm text-stone-500">Extra layer of security</p>
                            </div>
                        </div>
                        <button className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                            Enabled
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-stone-200 p-6"
            >
                <h3 className="text-lg font-semibold text-stone-900 mb-4">
                    Notification Preferences
                </h3>
                <div className="space-y-4">
                    {[
                        { label: "Invoice status updates", enabled: true },
                        { label: "CSID expiry reminders", enabled: true },
                        { label: "Weekly summary reports", enabled: false },
                        { label: "Product announcements", enabled: true },
                    ].map((pref, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
                        >
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-stone-400" />
                                <span className="text-stone-900">{pref.label}</span>
                            </div>
                            <button
                                className={`w-12 h-6 rounded-full transition-colors ${pref.enabled ? "bg-amber-500" : "bg-stone-300"
                                    }`}
                            >
                                <div
                                    className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${pref.enabled ? "translate-x-6" : "translate-x-0.5"
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
