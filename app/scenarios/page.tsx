"use client";

import { useState, useEffect, use } from "react";
import { generateScenariosAction, getSearchSummaryAction, getScenarioResultsAction, getInitialDashboardAction } from "@/app/actions";
import { ScenarioCard } from "@/components/scenario-card";
import { ScenarioFilters } from "@/components/scenario-filters";
import { SearchSummary } from "@/components/search-summary";
import { ResultView, getReason } from "@/components/result-view";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Loader2, ArrowLeft, Globe, CalendarClock, Luggage, CheckCircle2 } from "lucide-react";

// Helper function to safely render any value as a string
function safeRender(value: any): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (typeof value === "object") {
        // If object has common text properties, use them
        if (value.text) return value.text;
        if (value.summary) return value.summary;
        if (value.description) return value.description;
        // For objects with country names as keys (like {Italy, Switzerland}), join the keys
        const keys = Object.keys(value);
        if (keys.length > 0 && keys.every(k => typeof value[k] !== 'object')) {
            return keys.join(", ");
        }
        return JSON.stringify(value);
    }
    return String(value);
}

export default function ScenariosPage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ q?: string; companion?: string; theme?: string; age?: string; travelType?: string }>;
}) {
    const searchParams = use(searchParamsPromise);
    const { q: query, companion, theme, age, travelType } = searchParams;
    const router = useRouter();

    const [scenarios, setScenarios] = useState<any[]>([]);
    const [summary, setSummary] = useState<string>("");
    const [initialData, setInitialData] = useState<any>(null);
    const [results, setResults] = useState<any>(null);
    const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

    const [isLoadingInit, setIsLoadingInit] = useState(true);
    const [isLoadingResults, setIsLoadingResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            if (!query) {
                router.push("/");
                return;
            }

            // Only show full-screen loader on initial load
            const isFirstLoad = !initialData;
            if (isFirstLoad) {
                setIsLoadingInit(true);
            } else {
                setIsLoadingResults(true);
            }

            // Reset scenario results when filters change to show "Global" recommendations for new filters
            setSelectedScenario(null);
            setResults(null);

            setError(null);
            try {
                const [summaryData, scenariosData, dashboardData] = await Promise.all([
                    getSearchSummaryAction(query),
                    generateScenariosAction(query, { companion, theme, age, travelType }),
                    getInitialDashboardAction(query, { companion, theme, age, travelType })
                ]);
                setSummary(summaryData);
                setScenarios(scenariosData);
                console.log("[Scenarios Page] initialData received:", JSON.stringify(dashboardData, null, 2));
                setInitialData(dashboardData);
            } catch (err) {
                console.error("Init Error:", err);
                setError("데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setIsLoadingInit(false);
                setIsLoadingResults(false);
            }
        };
        init();
    }, [query, companion, theme, age, travelType, router]);

    const handleScenarioSelect = async (scenarioText: string) => {
        if (selectedScenario === scenarioText) return;

        setSelectedScenario(scenarioText);
        setIsLoadingResults(true);
        try {
            const data = await getScenarioResultsAction(query as string, scenarioText, { companion, theme, age, travelType });
            setResults(data);
        } catch (err) {
            console.error("Results Error:", err);
        } finally {
            setIsLoadingResults(false);
        }
    };

    // Handle filter application - only re-render results, not the whole page
    const [isFilterPending, setIsFilterPending] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<{ companion?: string; theme?: string; age?: string; travelType?: string } | null>(null);

    const handleFilterApply = async (filters: { companion?: string; theme?: string; age?: string; travelType?: string }) => {
        setIsFilterPending(true);
        setIsLoadingResults(true);
        setSelectedScenario(null); // Clear selected scenario
        setAppliedFilters(filters); // Store applied filters for display

        try {
            // Call API with the selected filters (not URL params)
            const data = await getInitialDashboardAction(query as string, filters);
            if (data) {
                // Update only the results, not scenarios or summary
                setResults(null); // Clear scenario-specific results
                setInitialData(data); // Update with filter-based results
            }
        } catch (err) {
            console.error("Filter Apply Error:", err);
        } finally {
            setIsFilterPending(false);
            setIsLoadingResults(false);
            // Keep appliedFilters for title display (don't clear it here)
        }
    };

    if (isLoadingInit) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="mt-4 text-slate-600 font-medium">검색 결과를 정리하는 중입니다...</p>
            </div>
        );
    }

    if (error || !scenarios || scenarios.length === 0) {
        return (
            <div className="flex h-screen flex-col items-center justify-center p-4 text-center bg-slate-50">
                <div className="rounded-full bg-red-50 p-4">
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-800">죄송합니다. 결과를 찾을 수 없습니다.</h2>
                <p className="mt-2 text-slate-600 max-w-md">
                    일시적인 오류이거나 검색어에 맞는 추천 시나리오를 찾지 못했습니다.
                </p>
                <button onClick={() => router.push("/")} className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 font-medium font-bold">
                    다시 검색하기
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-12 md:px-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 flex items-center gap-4">
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center justify-center h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                        title="다시 검색하기"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        "<span className="text-blue-600">{query}</span>" 검색 결과
                    </h1>
                </header>

                {/* Role 1: Summary */}
                <SearchSummary summary={summary} />



                {/* Scenario Title - Moved Outside */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        이런 여행은 어떠세요?
                    </h2>
                </div>

                {/* Role 2: Scenarios as 3x2 Grid Cards with Emojis */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-100 mb-12">
                    <div className="bg-white p-6 md:p-8">
                        <div className="overflow-x-auto pb-2 scrollbar-hide">
                            <div className="grid grid-cols-3 gap-4 min-w-[600px]">
                                {scenarios.map((scenario, index) => {
                                    // Assign emojis based on scenario content
                                    const getScenarioEmoji = (text: string) => {
                                        if (text.includes('만원') || text.includes('가성비') || text.includes('예산') || text.includes('알뜰')) return '💰';
                                        if (text.includes('가족') || text.includes('부모님') || text.includes('아이')) return '👨‍👩‍👧‍👦';
                                        if (text.includes('혼자') || text.includes('솔로') || text.includes('혼행')) return '🎒';
                                        if (text.includes('힐링') || text.includes('휴양') || text.includes('휴가') || text.includes('재충전')) return '🌴';
                                        if (text.includes('액티비티') || text.includes('모험') || text.includes('스포츠')) return '🏄';
                                        if (text.includes('박') || text.includes('일정') || text.includes('주말')) return '📅';
                                        if (text.includes('맛집') || text.includes('미식') || text.includes('먹방') || text.includes('음식')) return '🍜';
                                        if (text.includes('커플') || text.includes('연인') || text.includes('허니문') || text.includes('로맨틱')) return '💑';
                                        if (text.includes('MZ') || text.includes('젊') || text.includes('핫플')) return '🎉';
                                        return '✈️';
                                    };
                                    const emoji = getScenarioEmoji(scenario.text);

                                    return (
                                        <button
                                            key={scenario.id || index}
                                            onClick={() => handleScenarioSelect(scenario.text)}
                                            className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-200 flex flex-row items-center gap-3 min-h-[80px] ${selectedScenario === scenario.text
                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-400 scale-[1.02]'
                                                : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 hover:from-blue-50 hover:to-blue-100 hover:shadow-md border border-slate-200'
                                                }`}
                                        >
                                            <span className="text-xl flex-shrink-0">{emoji}</span>
                                            <span className={`text-sm font-semibold leading-tight text-left ${selectedScenario === scenario.text ? 'text-white' : 'text-slate-800'
                                                }`}>
                                                {scenario.text}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 bg-slate-50/50">
                        <ScenarioFilters onApplyFilters={handleFilterApply} isPending={isFilterPending} />
                    </div>
                </div>

                {/* Stage 2: Dynamic Results */}
                <div className="min-h-[400px]">
                    {isLoadingResults ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mb-4" />
                            <p className="text-slate-500 font-medium">상세한 여행 계획을 세우는 중입니다...</p>
                        </div>
                    ) : (results || (initialData?.results && !selectedScenario)) ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                            <div className="mb-8 flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold shadow-lg shadow-blue-100">
                                    {selectedScenario ? "★" : "✨"}
                                </span>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {selectedScenario ? (
                                        `"${selectedScenario}" 맞춤 추천`
                                    ) : appliedFilters && (appliedFilters.companion || appliedFilters.theme || appliedFilters.age || appliedFilters.travelType) ? (
                                        <span className="flex flex-wrap gap-1">
                                            {[appliedFilters.companion, appliedFilters.theme, appliedFilters.age, appliedFilters.travelType].filter(Boolean).map(val => (
                                                <span key={val} className="text-blue-600">#{val}</span>
                                            ))}
                                            <span className="ml-1 font-bold text-slate-900">관련 추천 정보</span>
                                        </span>
                                    ) : (companion || theme || age || travelType) ? (
                                        <span className="flex flex-wrap gap-1">
                                            {[companion, theme, age, travelType].filter(Boolean).map(val => (
                                                <span key={val} className="text-blue-600">#{val}</span>
                                            ))}
                                            <span className="ml-1 font-bold text-slate-900">관련 추천 정보</span>
                                        </span>
                                    ) : (
                                        `"${query}" 관련 추천 정보`
                                    )}
                                </h2>
                            </div>

                            {/* Initial Info Dashboard (Redesigned for fit) */}
                            {initialData && (initialData.country || initialData.prep || initialData.immigration) && (
                                <div className="mb-12 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {initialData.country && (
                                            <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                                                <div className="p-6">
                                                    <h3 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                            <Globe className="h-4 w-4" />
                                                        </span>
                                                        기초 여행 정보
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                            <span className="text-sm font-semibold text-slate-500">언어/문화</span>
                                                            <span className="text-sm font-bold text-slate-800">{safeRender(initialData.country.language)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                            <span className="text-sm font-semibold text-slate-500">전압</span>
                                                            <span className="text-sm font-bold text-slate-800">{safeRender(initialData.country.voltage)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                            <span className="text-sm font-semibold text-slate-500">비행 시간</span>
                                                            <span className="text-sm font-bold text-slate-800">{safeRender(initialData.country.flight_distance)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between py-2">
                                                            <span className="text-sm font-semibold text-slate-500">시차</span>
                                                            <span className="text-sm font-bold text-slate-800">GMT {safeRender(initialData.country.timezone)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-auto bg-slate-50 p-4 border-t border-slate-100">
                                                    <p className="text-xs text-slate-500 line-clamp-1">{safeRender(initialData.country.culture)}</p>
                                                </div>
                                            </div>
                                        )}
                                        {initialData.prep && (
                                            <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                                                <div className="p-6">
                                                    <h3 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                            <CalendarClock className="h-4 w-4" />
                                                        </span>
                                                        여행 준비 체크
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                            <span className="text-sm font-semibold text-slate-500">현재 날씨</span>
                                                            <span className="text-sm font-bold text-slate-800">{safeRender(initialData.prep.weather)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                            <span className="text-sm font-semibold text-slate-500">실시간 환율</span>
                                                            <span className="text-sm font-bold text-slate-800">{safeRender(initialData.prep.exchange_rate)}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-2 py-2">
                                                            <span className="text-sm font-semibold text-slate-500">추천 결제수단</span>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {Array.isArray(initialData.prep.payment_methods) ? (
                                                                    initialData.prep.payment_methods.map((m: string) => (
                                                                        <span key={m} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md">
                                                                            {m}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-sm font-bold text-slate-800">{safeRender(initialData.prep.payment_methods)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-auto bg-indigo-50/50 p-4 border-t border-indigo-100">
                                                    <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        여행자 보험 가입 {initialData.prep.insurance ? "권장" : "불필요"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {initialData.immigration && (
                                            <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:col-span-1 md:col-span-2 lg:col-span-1">
                                                <div className="p-6">
                                                    <h3 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                                            <Luggage className="h-4 w-4" />
                                                        </span>
                                                        입국 및 비자 정보
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                            <span className="text-sm font-semibold text-slate-500">비자 필요 여부</span>
                                                            <span className={`text-sm font-bold ${initialData.immigration.visa_required ? 'text-red-600' : 'text-green-600'}`}>
                                                                {initialData.immigration.visa_required ? '필요' : '불필요 (무비자)'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                            <span className="text-sm font-semibold text-slate-500">비자 유형</span>
                                                            <span className="text-sm font-bold text-slate-800">{initialData.immigration.visa_type}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-2 py-2">
                                                            <span className="text-sm font-semibold text-slate-500">필수 준비 서류</span>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {Array.isArray(initialData.immigration.required_documents) ? (
                                                                    initialData.immigration.required_documents.map((d: string) => (
                                                                        <span key={d} className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold rounded-md">
                                                                            {d}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-sm font-bold text-slate-800">{safeRender(initialData.immigration.required_documents)}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-auto bg-orange-50/50 p-4 border-t border-orange-100">
                                                    <p className="text-xs text-orange-600 font-medium">실시간 규정에 따라 변동될 수 있습니다.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <ResultView data={results || initialData.results} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                            <p className="text-slate-400 font-medium">시나리오를 선택하면 더 상세한 맞춤형 일정이 여기에 표시됩니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
