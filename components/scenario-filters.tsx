"use client";

import { useState } from "react";
import { X } from "lucide-react";

const FILTERS = {
    companion: {
        label: "동행자 (Who)",
        options: ["나혼자", "아이와", "친구와", "부모님과", "연인과"],
    },
    theme: {
        label: "테마 (Theme)",
        options: ["여유로운", "볼거리가득", "미식탐방", "체험·액티비티"],
    },
    ageGroup: {
        label: "연령대 (Age)",
        options: ["10~20대", "30~40대", "50~60대", "70대 이상"],
    },
    travelType: {
        label: "여행 종류 (Type)",
        options: ["자유여행", "패키지"],
    },
};

interface ScenarioFiltersProps {
    onApplyFilters?: (filters: { companion?: string; theme?: string; age?: string; travelType?: string }) => void;
    isPending?: boolean;
}

export function ScenarioFilters({ onApplyFilters, isPending: externalPending }: ScenarioFiltersProps) {
    // Local state for filter selections (not tied to URL)
    const [selectedCompanion, setSelectedCompanion] = useState<string>("");
    const [selectedTheme, setSelectedTheme] = useState<string>("");
    const [selectedAge, setSelectedAge] = useState<string>("");
    const [selectedTravelType, setSelectedTravelType] = useState<string>("");
    const [isPending, setIsPending] = useState(false);

    const [isOpen, setIsOpen] = useState(false);

    const handleApply = () => {
        if (onApplyFilters) {
            // Call the parent's callback with selected filters
            onApplyFilters({
                companion: selectedCompanion || undefined,
                theme: selectedTheme || undefined,
                age: selectedAge || undefined,
                travelType: selectedTravelType || undefined,
            });
            // Reset filter selections after applying
            setSelectedCompanion("");
            setSelectedTheme("");
            setSelectedAge("");
            setSelectedTravelType("");
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        setSelectedCompanion("");
        setSelectedTheme("");
        setSelectedAge("");
        setSelectedTravelType("");
    };

    const isLoading = externalPending || isPending;

    return (
        <div className="overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all"
            >
                <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] text-white font-bold">
                        {selectedCompanion || selectedTheme || selectedAge || selectedTravelType ? "!" : "+"}
                    </span>
                    다른 조건으로 다시 추천받기
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
                    <span>{isOpen ? "접어두기" : "상세보기"}</span>
                    <span className={`transition-transform duration-300 transform ${isOpen ? "rotate-180" : ""}`}>
                        ▼
                    </span>
                </div>
            </button>

            {isOpen && (
                <div className="border-t border-slate-100 bg-white p-6 md:p-8 animate-in slide-in-from-top-2 duration-300">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">어떤 여행을 계획하시나요?</h3>
                        <button
                            onClick={handleClear}
                            className="text-xs text-slate-400 hover:text-slate-800 underline decoration-slate-200 underline-offset-4 transition-colors"
                        >
                            필터 초기화
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Companion Filter */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{FILTERS.companion.label}</span>
                            <div className="flex flex-wrap gap-1.5">
                                {FILTERS.companion.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setSelectedCompanion(selectedCompanion === option ? "" : option)}
                                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${selectedCompanion === option
                                            ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-600"
                                            : "bg-slate-50 text-slate-500 hover:bg-slate-200"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme Filter */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{FILTERS.theme.label}</span>
                            <div className="flex flex-wrap gap-1.5">
                                {FILTERS.theme.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setSelectedTheme(selectedTheme === option ? "" : option)}
                                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${selectedTheme === option
                                            ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-600"
                                            : "bg-slate-50 text-slate-500 hover:bg-slate-200"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Age Filter */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{FILTERS.ageGroup.label}</span>
                            <div className="flex flex-wrap gap-1.5">
                                {FILTERS.ageGroup.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setSelectedAge(selectedAge === option ? "" : option)}
                                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${selectedAge === option
                                            ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-600"
                                            : "bg-slate-50 text-slate-500 hover:bg-slate-200"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Travel Type Filter */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{FILTERS.travelType.label}</span>
                            <div className="flex flex-wrap gap-1.5">
                                {FILTERS.travelType.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setSelectedTravelType(selectedTravelType === option ? "" : option)}
                                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${selectedTravelType === option
                                            ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-600"
                                            : "bg-slate-50 text-slate-500 hover:bg-slate-200"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-50 pt-6">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={isLoading || (!selectedCompanion && !selectedTheme && !selectedAge && !selectedTravelType)}
                            className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            {isLoading ? "반영 중..." : "새로운 추천 받기"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
