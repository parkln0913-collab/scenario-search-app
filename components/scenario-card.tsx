"use client";

import { useRouter } from "next/navigation";

export function ScenarioCard({
    scenario,
    query,
    onSelect,
    isSelected
}: {
    scenario: { id: string; text: string; summary: string; icon?: string };
    query: string;
    onSelect?: (scenarioText: string) => void;
    isSelected?: boolean;
}) {
    const router = useRouter();

    const handleClick = () => {
        if (onSelect) {
            onSelect(scenario.text);
        } else {
            const params = new URLSearchParams();
            params.set("q", query);
            params.set("scenario", scenario.text);
            router.push(`/result?${params.toString()}`);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all active:scale-95 shadow-sm ring-1 ${isSelected
                    ? "bg-blue-600 text-white ring-blue-600 shadow-md transform -translate-y-0.5"
                    : "bg-white text-slate-700 ring-slate-200 hover:-translate-y-0.5 hover:bg-white hover:text-blue-700 hover:ring-blue-400"
                }`}
        >
            <span className="text-lg">{scenario.icon || "✈️"}</span>
            <span className="truncate max-w-[300px] md:max-w-none">{scenario.text}</span>
            <span className={`transition-opacity ${isSelected ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}>
                {isSelected ? "✓" : "→"}
            </span>
        </button>
    );
}
