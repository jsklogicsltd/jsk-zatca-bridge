"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineNotice() {
    const [isOnline, setIsOnline] = useState(true);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        // Set initial state
        setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

        const handleOnline = () => {
            setIsOnline(true);
            setShowReconnected(true);
            // Hide reconnected message after 3 seconds
            setTimeout(() => setShowReconnected(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowReconnected(false);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-3 px-4 shadow-lg"
                >
                    <div className="container mx-auto flex items-center justify-center gap-2">
                        <WifiOff className="h-5 w-5" />
                        <p className="text-sm font-medium">
                            No internet connection. Some features may be unavailable.
                        </p>
                    </div>
                </motion.div>
            )}

            {showReconnected && isOnline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white py-3 px-4 shadow-lg"
                >
                    <div className="container mx-auto flex items-center justify-center gap-2">
                        <Wifi className="h-5 w-5" />
                        <p className="text-sm font-medium">
                            Back online! Your connection has been restored.
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
