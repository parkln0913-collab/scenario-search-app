import { generateScenariosAction } from "@/app/actions";
import { ScenarioCard } from "@/components/scenario-card";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export default async function ScenariosPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q: query } = await searchParams;
    if (!query) redirect("/");

    let scenarios: string[] = [];
    try {
        scenarios = await generateScenariosAction(query);
    } catch (error) {
        console.error("Scenario Error:", error);
        return (
            <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
                <div className="rounded-full bg-red-50 p-4">
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-800">오류가 발생했습니다</h2>
                <p className="mt-2 text-slate-600 max-w-md">
                    AI 여행 시나리오를 생성하는 중 문제가 발생했습니다.<br />
                    서버 연결 상태를 확인하거나 잠시 후 다시 시도해주세요.
                </p>
                <a href="/" className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 font-medium">
                    처음으로 돌아가기
                </a>
            </div>
        );
    }

    // Handle case where scenarios might be empty or invalid
    if (!scenarios || scenarios.length === 0) {
        return (
            <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
                <h2 className="text-xl font-bold text-slate-800">적절한 시나리오를 찾지 못했습니다</h2>
                <p className="mt-2 text-slate-600">더 구체적인 키워드로 검색해보세요.</p>
                <a href="/" className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 font-medium">
                    다시 검색하기
                </a>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-slate-50 p-4 md:p-8">
            <header className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-slate-900">
                    "<span className="text-blue-600">{query}</span>" 맞춤 여행 시나리오
                </h1>
                <p className="mt-3 text-lg text-slate-600">
                    가장 마음에 드는 여행 이야기를 선택해주세요.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {scenarios.map((scenario, index) => (
                    <ScenarioCard key={index} scenario={scenario} query={query} />
                ))}
            </div>
        </main>
    );
}
