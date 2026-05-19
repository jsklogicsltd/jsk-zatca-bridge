import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 flex items-center justify-center">
            <div className="text-center">
                <div className="relative inline-block mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 opacity-20 blur-xl absolute inset-0" />
                    <Loader2 className="h-12 w-12 text-amber-600 animate-spin relative" />
                </div>
                <p className="text-sm text-slate-600 font-medium">Loading...</p>
            </div>
        </div>
    );
}
