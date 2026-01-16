import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
            <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-75"></div>
                    <Loader2 className="relative h-16 w-16 animate-spin text-blue-600" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 animate-pulse">여행 계획을 설계 중입니다...</h2>
                    <p className="text-slate-500">AI가 시나리오에 맞는 최적의 일정과 상품을 찾고 있습니다.</p>
                </div>
            </div>
        </div>
    );
}
