"use client";
import { Clock, Plane, DollarSign, CheckCircle2, MapPin, Building, Star, Wifi, CalendarClock, Luggage } from "lucide-react";

interface ResultData {
    packages?: Array<{
        product_name: string;
        schedule_summary: string;
        flight_info: string;
        price: string;
        reason: any;
    }>;
    itineraries?: Array<{
        title: string;
        reason: any;
        days: Array<{ day_title: string; detail: string }>;
    }>;
    destinations?: Array<{
        name: string;
        reason: any;
    }>;
    hotels?: Array<{
        name: string;
        location: string;
        rating: string;
        price_per_night: string;
        features: string;
    }>;
    flights?: Array<{
        airline: string;
        route: string;
        departure_time: string;
        arrival_time: string;
        duration: string;
        price: string;
        flight_type: string;
    }>;
    public_transport?: Array<{
        type: string;
        title: string;
        route?: string;
        price?: string;
        duration?: string;
        reason?: any;
    }>;
    local_tours?: Array<{
        title: string;
        location: string;
        price: string;
        reason?: any;
    }>;
}

// Helper to safely render reason values
export function getReason(value: any): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (typeof value === "object") {
        if (value.text) return value.text;
        if (value.summary) return value.summary;
        if (value.description) return value.description;

        // For objects with multiple values, join the keys (useful for location-specific data)
        const keys = Object.keys(value);
        if (keys.length > 0 && keys.every(k => typeof value[k] !== 'object')) {
            return keys.join(", ");
        }
        return JSON.stringify(value);
    }
    return String(value);
}

export function ResultView({ data }: { data: any }) {
    if (!data || Object.keys(data).length === 0) return null;

    return (
        <div className="space-y-12">
            {/* Packages */}
            {data.get_packages?.packages && (
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 flex items-center">
                        <Plane className="mr-2 h-6 w-6 text-blue-600" />
                        추천 패키지
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {data.get_packages.packages.map((pkg: any, idx: number) => (
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
            )}

            {/* Itineraries */}
            {data.get_itineraries?.itineraries && (
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 text-slate-900">여행 일정</h2>
                    <div className="relative">
                        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                            {data.get_itineraries.itineraries.map((itinerary: any, idx: number) => (
                                <div key={idx} className="flex-shrink-0 w-[480px] snap-start rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-slate-900">{itinerary.title}</h3>
                                        <div className="mt-2 flex items-start rounded-lg bg-blue-50 p-3">
                                            <CheckCircle2 className="mr-2 h-5 w-5 shrink-0 text-blue-600" />
                                            <p className="text-sm font-medium text-blue-800">{getReason(itinerary.reason)}</p>
                                        </div>
                                    </div>
                                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8 py-2">
                                        {itinerary.days?.map((day: any, dayIdx: number) => (
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
                    </div>
                </section>
            )}

            {/* Hotels */}
            {data.get_hotels?.hotels && (
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 flex items-center">
                        <Building className="mr-2 h-6 w-6 text-blue-600" />
                        추천 호텔
                    </h2>
                    <div className="relative">
                        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                            {data.get_hotels.hotels.map((hotel: any, idx: number) => (
                                <div key={idx} className="flex-shrink-0 w-[360px] snap-start flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-slate-900">{hotel.name}</h3>
                                            <span className="flex items-center text-sm font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                                <Star className="mr-1 h-3 w-3 fill-yellow-600" />
                                                {hotel.rating}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-500 mb-4">
                                            <MapPin className="mr-1 h-3 w-3" />
                                            {hotel.location}
                                        </div>
                                        <div className="space-y-2 text-sm text-slate-600 mb-4">
                                            <div className="flex items-center">
                                                <Wifi className="mr-2 h-4 w-4 text-slate-400" />
                                                {hotel.features}
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                                            <div className="flex items-center font-bold text-lg text-blue-600">
                                                {hotel.price_per_night} <span className="text-xs text-slate-400 ml-1 font-normal">/ 1박</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Flights */}
            {data.get_flights?.flights && (
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 flex items-center">
                        <Plane className="mr-2 h-6 w-6 text-blue-600" />
                        추천 항공권
                    </h2>
                    <div className="relative">
                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                            {data.get_flights.flights.map((flight: any, idx: number) => (
                                <div key={idx} className="flex-shrink-0 w-[300px] snap-start rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                                    {/* Header: Airline + Type */}
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-bold text-slate-900">{flight.airline}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${flight.flight_type === '직항' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {flight.flight_type}
                                        </span>
                                    </div>
                                    {/* Time Row */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-slate-800">{flight.departure_time}</div>
                                            <div className="text-xs text-slate-500">출발</div>
                                        </div>
                                        <div className="flex-1 px-3 flex flex-col items-center">
                                            <div className="text-xs text-slate-400">{flight.duration}</div>
                                            <div className="w-full h-px bg-slate-200 my-1 relative">
                                                <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-blue-400 rotate-90" />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-slate-800">{flight.arrival_time}</div>
                                            <div className="text-xs text-slate-500">도착</div>
                                        </div>
                                    </div>
                                    {/* Route + Price */}
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                        <span className="text-xs text-slate-500">{flight.route}</span>
                                        <span className="font-bold text-blue-600">{flight.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Destinations */}
            {data.get_destinations?.destinations && (
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 text-slate-900">추천 여행지</h2>
                    <div className="space-y-4">
                        {data.get_destinations.destinations.map((dest: any, idx: number) => {
                            // Placeholder images from Unsplash
                            const imageUrls = [
                                'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&h=200&fit=crop',
                                'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&h=200&fit=crop',
                                'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=200&h=200&fit=crop'
                            ];
                            return (
                                <div key={idx} className="flex gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                                    {/* Left: Image */}
                                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200">
                                        <img
                                            src={imageUrls[idx % imageUrls.length]}
                                            alt={dest.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    {/* Right: Title and Reason */}
                                    <div className="flex flex-col justify-center flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{dest.name}</h3>
                                        <div className="flex items-start rounded-lg bg-blue-50 p-3">
                                            <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                                            <p className="text-sm text-blue-800 line-clamp-2">{getReason(dest.reason)}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}



            {/* Local Tour */}
            {(() => {
                // MCP 도구 구조에 따른 데이터 추출 최적화
                const localTourData = data.get_local_tour_info?.local_tours ||
                    data.local_tours ||
                    data.get_local_tour_info;
                const products = localTourData?.products;
                return products && Array.isArray(products) && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 flex items-center">
                            <MapPin className="mr-2 h-6 w-6 text-blue-600" />
                            현지 투어 및 입장권
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                            {products.map((product: any, idx: number) => (
                                <div key={idx} className="flex-shrink-0 w-[280px] snap-start flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                                    <div className="p-5 space-y-3">
                                        <h4 className="text-base font-bold text-slate-900 line-clamp-1">{product.product_name}</h4>
                                        <div className="flex items-center justify-between py-2 border-y border-slate-100">
                                            <span className="text-xs text-slate-500">상품가격</span>
                                            <span className="font-bold text-lg text-blue-600">{product.price}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">상품구분</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${product.product_type === '투어상품' ? 'bg-orange-100 text-orange-700' :
                                                product.product_type === '입장권' ? 'bg-green-100 text-green-700' :
                                                    'bg-purple-100 text-purple-700'
                                                }`}>{product.product_type}</span>
                                        </div>
                                        {product.validity_period && (
                                            <div className="flex items-center text-xs text-slate-500">
                                                <CalendarClock className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                                                <span>{product.validity_period}</span>
                                            </div>
                                        )}
                                        {product.description && (
                                            <div className="rounded-lg bg-slate-50 p-2.5">
                                                <p className="text-[10px] font-semibold text-slate-500 mb-0.5">이용 안내</p>
                                                <p className="text-xs text-slate-600 line-clamp-2">{product.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })()}

            {/* Public Transport */}
            {
                (data.get_public_transport_info?.public_transport || data.get_public_transport_info) && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 flex items-center">
                            <Luggage className="mr-2 h-6 w-6 text-blue-600" />
                            현지 교통 정보
                        </h2>
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed">
                                {(() => {
                                    const pt = data.get_public_transport_info?.public_transport || data.get_public_transport_info;
                                    if (Array.isArray(pt)) {
                                        return (
                                            <div className="grid gap-4">
                                                {pt.map((item: any, idx: number) => (
                                                    <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                                                        <h4 className="font-bold text-slate-800 mb-1">{item.title || item.type}</h4>
                                                        <p>{item.route || item.description || getReason(item.reason)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return typeof pt === 'string' ? pt : JSON.stringify(pt, null, 2);
                                })()}
                            </div>
                        </div>
                    </section>
                )
            }
        </div >
    );
}
