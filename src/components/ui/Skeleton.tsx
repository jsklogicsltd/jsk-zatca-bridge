import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "circular" | "rounded";
}

export function Skeleton({
    className,
    variant = "default",
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-slate-200",
                variant === "circular" && "rounded-full",
                variant === "rounded" && "rounded-lg",
                variant === "default" && "rounded",
                className
            )}
            {...props}
        />
    );
}

// Skeleton variants for common UI patterns
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        "h-4",
                        i === lines - 1 ? "w-4/5" : "w-full"
                    )}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("p-6 rounded-lg border border-slate-200 bg-white", className)}>
            <Skeleton className="h-6 w-1/3 mb-4" />
            <SkeletonText lines={3} />
        </div>
    );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4 pb-3 border-b border-slate-200">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 items-center">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            className={cn(
                                "h-4 flex-1",
                                colIndex === 0 && "h-10 w-10 rounded-full"
                            )}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonButton({ className }: { className?: string }) {
    return <Skeleton className={cn("h-10 w-24 rounded-md", className)} />;
}

export function SkeletonAvatar({ className }: { className?: string }) {
    return <Skeleton variant="circular" className={cn("h-10 w-10", className)} />;
}
