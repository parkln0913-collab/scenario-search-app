"use client";

import { useRouter } from "next/navigation";

export function ScenarioCard({ scenario, query }: { scenario: string; query: string }) {
    const router = useRouter();

    const handleClick = () => {
        // Navigate to result, passing query and scenario
        const params = new URLSearchParams();
        params.set("q", query);
        params.set("scenario", scenario);
        router.push(`/result?${params.toString()}`);
    };

    return (
        <div
            onClick={handleClick}
            className="group relative flex h-full min-h-[200px] cursor-pointer flex-col justify-between overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ring-1 ring-slate-100"
        >
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />

            <p className="text-lg font-medium leading-relaxed text-slate-700 group-hover:text-slate-900 break-keep">
                {scenario}
            </p>

            <div className="mt-6 flex items-center justify-end text-sm font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                여행 계획 보기 &rarr;
            </div>
        </div>
    );
}
