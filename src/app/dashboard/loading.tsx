import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Title */}
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 rounded-lg border border-slate-200 bg-white">
                            <div className="flex items-start justify-between mb-3">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                            <Skeleton className="h-8 w-20 mb-1" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-6 rounded-lg border border-slate-200 bg-white">
                            <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <SkeletonCard />
                    </div>

                    {/* Sidebar */}
                    <div>
                        <SkeletonCard />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
