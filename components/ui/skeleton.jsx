export function Skeleton({ className = "", ...props }) {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200 ${className}`}
            {...props}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white rounded-lg border shadow-sm p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-full" />
        </div>
    );
}

export function InsightSkeleton() {
    return (
        <div className="bg-white rounded-lg border p-4">
            <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-white rounded-lg border p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
}
