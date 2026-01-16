"use client";
import { Clock, Plane, DollarSign, CheckCircle2, MapPin } from "lucide-react";

interface ResultData {
    packages: Array<{
        product_name: string;
        schedule_summary: string;
        flight_info: string;
        price: string;
        reason: any; // can be string or object
    }>;
    itineraries: Array<{
        title: string;
        reason: any; // can be string or object
        days: Array<{ day_title: string; detail: string }>;
    }>;
    destinations: Array<{
        name: string;
        reason: any; // can be string or object
    }>;
}

// Helper to safely render reason values
function getReason(reason: any): string {
    if (typeof reason === 'object' && reason !== null) {
        return reason.text ?? JSON.stringify(reason);
    }
    return String(reason);
}

export function ResultView({ data }: { data: ResultData }) {
    return (
        <div>
            {/* Packages */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900">추천 패키지</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {data.packages?.map((pkg, idx) => (
                        <div key={idx} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                            <div className="flex-1 p-6">
                                <h3 className="mb-2 text-lg font-bold text-slate-900">{pkg.product_name}</h3>
                                <div className="mb-4 space-y-2 text-sm text-slate-600">
                                    <div className="flex items-center"><Clock className="mr-2 h-4 w-4 text-slate-400" /> {getReason(pkg.schedule_summary)}</div>
                                    <div className="flex items-center"><Plane className="mr-2 h-4 w-4 text-slate-400" /> {getReason(pkg.flight_info)}</div>
                                    <div className="flex items-center font-semibold text-blue-600"><DollarSign className="mr-2 h-4 w-4" /> {getReason(pkg.price)}</div>
                                </div>
                            </div>
                            <div className="bg-blue-50 p-4">
                                <div className="flex items-start">
                                    <CheckCircle2 className="mr-2 h-5 w-5 shrink-0 text-blue-600" />
                                    <p className="text-sm font-medium text-blue-800">{getReason(pkg.reason)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Itineraries */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-900">여행 일정</h2>
                <div className="space-y-8">
                    {data.itineraries?.map((itinerary, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-900">{itinerary.title}</h3>
                                <div className="mt-2 flex items-start rounded-lg bg-blue-50 p-3">
                                    <CheckCircle2 className="mr-2 h-5 w-5 shrink-0 text-blue-600" />
                                    <p className="text-sm font-medium text-blue-800">{getReason(itinerary.reason)}</p>
                                </div>
                            </div>
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8 py-2">
                                {itinerary.days?.map((day, dayIdx) => (
                                    <div key={dayIdx} className="relative">
                                        <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white bg-blue-600 ring-1 ring-slate-200" />
                                        <h4 className="text-lg font-bold text-slate-900">{day.day_title}</h4>
                                        <p className="mt-1 text-slate-600 whitespace-pre-line">{day.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Destinations */}
            <section>
                <h2 className="text-2xl font-bold mb-4 text-slate-900">추천 여행지</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {data.destinations?.map((dest, idx) => (
                        <div key={idx} className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md">
                            <div className="h-40 bg-slate-200 group-hover:bg-slate-300 transition-colors flex items-center justify-center">
                                <MapPin className="h-12 w-12 text-slate-400" />
                            </div>
                            <div className="p-5">
                                <h3 className="mb-3 text-xl font-bold text-slate-900">{dest.name}</h3>
                                <div className="flex items-start rounded-lg bg-indigo-50 p-3">
                                    <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                                    <p className="text-sm font-medium text-indigo-900">{getReason(dest.reason)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
