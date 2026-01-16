import { getScenarioResultsAction } from "@/app/actions";
import { ResultView } from "@/components/result-view";
import { redirect } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function ResultPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; scenario?: string }>;
}) {
    const { q, scenario } = await searchParams;
    if (!q || !scenario) redirect("/");

    let data = null;
    try {
        data = await getScenarioResultsAction(q, scenario);
    } catch (error) {
        console.error("Result Error:", error);
        return (
            <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
                <div className="rounded-full bg-red-50 p-4">
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-800">결과를 불러오지 못했습니다</h2>
                <p className="mt-2 text-slate-600">다시 시도하거나 다른 시나리오를 선택해주세요.</p>
                <Link href={`/scenarios?q=${q}`} className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 font-medium">
                    이전으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex items-center p-4">
                    <Link href={`/scenarios?q=${q}`} className="mr-4 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">Selected Scenario</p>
                        <h1 className="truncate text-lg font-bold text-slate-900 md:text-xl" title={scenario}>
                            {scenario}
                        </h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto max-w-6xl p-4 py-8">
                <ResultView data={data} />
            </div>
        </main>
    );
}
