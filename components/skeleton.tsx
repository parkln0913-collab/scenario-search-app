import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-200", className)}
            {...props}
        />
    );
}

export function ScenarioCardSkeleton() {
    return (
        <div className="flex h-64 flex-col justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-10 w-24 rounded-full" />
        </div>
    );
}
