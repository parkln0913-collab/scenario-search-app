"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    router.push(`/scenarios?q=${encodeURIComponent(query)}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          당신의 여행을 <br className="hidden sm:inline" />
          <span className="text-blue-600">시나리오</span>로 만들어 드립니다
        </h1>
        <p className="mx-auto max-w-xl text-lg text-slate-600">
          가고 싶은 여행의 느낌만 말해주세요. 구체적인 시나리오와 일정을 제안해 드립니다.
        </p>

        <form onSubmit={handleSearch} className="relative mx-auto mt-8 max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: 부모님과 함께하는 힐링 여행, 혼자 떠나는 제주도 도보 여행..."
              className="w-full rounded-full border border-slate-200 bg-white py-4 pl-6 pr-14 text-lg shadow-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:shadow-2xl"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
