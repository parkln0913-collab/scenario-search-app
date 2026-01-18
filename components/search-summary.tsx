"use client";
import { Sparkles } from "lucide-react";

export function SearchSummary({ summary }: { summary: string }) {
    if (!summary) return null;

    return (
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-px shadow-lg shadow-blue-100">
            <div className="rounded-[15px] bg-white/95 p-6 md:p-8 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Sparkles className="h-5 w-5 fill-blue-600" />
                    </div>
                    <div>
                        <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-600">핵심 브리핑</h3>
                        <p className="text-base font-medium leading-relaxed text-slate-800 md:text-lg break-keep">
                            {summary}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
