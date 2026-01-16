import { ScenarioCardSkeleton } from "@/components/skeleton";

export default function Loading() {
    return (
        <main className="min-h-screen bg-slate-50 p-4 md:p-8">
            <header className="mb-8 text-center space-y-4">
                <div className="mx-auto h-10 w-64 animate-pulse rounded bg-slate-200" />
                <div className="mx-auto h-5 w-48 animate-pulse rounded bg-slate-200" />
            </header>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <ScenarioCardSkeleton key={i} />
                ))}
            </div>
        </main>
    );
}
