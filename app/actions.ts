"use server";

import { callOpenAI } from "@/lib/openai";
import { callMcpTool } from "@/lib/mcp";

interface QueryClassification {
    locations: string[];
    isDomestic: boolean;
    isInternational: boolean;
    isDeparture: boolean;
    intent: string;
}

async function classifyQuery(query: string): Promise<QueryClassification> {
    const classificationPrompt = `
    사용자의 여행 검색 쿼리를 분석하여 다음 규칙에 따라 분류하세요:
    - locations: 지리적 장소 목록 (도시, 국가, 주, '유럽'이나 '동남아시아'와 같은 지역).
    - isDomestic: 모든 장소가 대한민국 내(예: 제주, 서울, 강릉, 울릉도 등)인 경우 true.
    - isInternational: 장소 중 하나라도 외국 국가나 지역인 경우 true.
    - isDeparture: 장소가 출발점으로 지정된 경우(예: '인천 출발', '부산에서') true.
    - intent: 여행 목적이나 기간에 대한 짧은 요약(예: '2박 3일', '가족 여행').

    쿼리: "${query}"

    반드시 다음 JSON 형식을 엄수하여 응답하세요:
    {
        "locations": ["장소1", ...],
        "isDomestic": boolean,
        "isInternational": boolean,
        "isDeparture": boolean,
        "intent": "string"
    }
    `;

    try {
        const response = await callOpenAI([
            { role: "system", content: "귀하는 여행 검색어 분류 전문가입니다." },
            { role: "user", content: classificationPrompt }
        ], { type: "json_object" });

        return JSON.parse(response);
    } catch (error) {
        console.error("Classification Error:", error);
        return { locations: [], isDomestic: false, isInternational: false, isDeparture: false, intent: "" };
    }
}

export async function getSearchSummaryAction(query: string) {
    if (!query) throw new Error("Query is required");
    try {
        const result: any = await callMcpTool("get_search_summary", { user_query: query });
        if (result && result.content && result.content[0] && result.content[0].type === 'text') {
            const text = result.content[0].text;
            // Handle both raw text and JSON strings
            try {
                const cleaned = text.replace(/```json\s*|```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                return parsed.summary || text;
            } catch {
                return text;
            }
        }
        return "";
    } catch (error) {
        console.error("getSearchSummaryAction Error:", error);
        return "";
    }
}

export async function getInitialDashboardAction(query: string, filters?: { companion?: string; theme?: string; age?: string; travelType?: string }) {
    if (!query) return null;

    try {
        const classification = await classifyQuery(query);
        // 항상 검색결과 요약과 시나리오를 함께 호출
        const toolsToCall: string[] = ["get_search_summary", "generate_scenarios"];

        // Universal Location Detection: If international destination detected by AI, call location-specific tools
        if (classification.isInternational && !classification.isDeparture) {
            console.log(`[Dashboard Orchestrator] International destination detected. Locations: ${classification.locations.join(', ')}`);
            toolsToCall.push("get_country_info", "get_travel_prep_info", "get_immigration_info", "get_itineraries");
        }

        // 2. AI Planner: Add more relevant tools for the initial view (pre-scenario)
        const relevantTools = await determineRelevantTools(query, undefined, filters);
        relevantTools.forEach(tool => {
            if (!toolsToCall.includes(tool)) {
                toolsToCall.push(tool);
            }
        });

        // 3. Travel Type Override
        if (filters?.travelType === "패키지" && !toolsToCall.includes("get_packages")) {
            toolsToCall.push("get_packages");
        }

        console.log(`[Dashboard Orchestrator] Selecting tools for "${query}" with filters ${JSON.stringify(filters)}:`, toolsToCall);

        const responseKeys: Record<string, string> = {
            "get_packages": "packages",
            "get_itineraries": "itineraries",
            "get_destinations": "destinations",
            "get_hotels": "hotels",
            "get_flights": "flights",
            "get_public_transport_info": "public_transport",
            "get_local_tour_info": "local_tours",
            "generate_scenarios": "scenarios",
            "get_country_info": "country_info",
            "get_immigration_info": "immigration_info",
            "get_travel_prep_info": "travel_prep_info"
        };

        const results = await Promise.all(
            toolsToCall.map(async (toolName) => {
                try {
                    // Location-specific tools don't need selected_scenario parameter
                    const locationTools = ["get_country_info", "get_immigration_info", "get_travel_prep_info", "get_search_summary"];
                    const params: any = locationTools.includes(toolName)
                        ? { user_query: query }
                        : { user_query: query, selected_scenario: "" };

                    // Add filters to recommendation tools
                    if (!locationTools.includes(toolName) && toolName !== "generate_scenarios" && filters) {
                        params.companion = filters.companion || "";
                        params.theme = filters.theme || "";
                        params.age = filters.age || "";
                        params.travel_type = filters.travelType || "";
                    }

                    const res: any = await callMcpTool(toolName, params);
                    if (res && res.content && res.content[0] && res.content[0].text) {
                        const cleaned = res.content[0].text.replace(/```json\s*|```/g, '').trim();
                        const parsed = JSON.parse(cleaned);
                        const key = responseKeys[toolName] || toolName.replace("get_", "");
                        // Standardize data to { [key]: data }
                        return {
                            toolName,
                            data: parsed[key] ? parsed : { [key]: parsed }
                        };
                    }
                } catch (e) {
                    console.error(`Tool ${toolName} failed:`, e);
                }
                return null;
            })
        );

        const summaryResult = results.find(r => r?.toolName === "get_search_summary");
        const countryResult = results.find(r => r?.toolName === "get_country_info");
        const prepResult = results.find(r => r?.toolName === "get_travel_prep_info");
        const immigrationResult = results.find(r => r?.toolName === "get_immigration_info");

        // Merge dynamic results for ResultView
        const dynamicResults: Record<string, any> = {};
        results.forEach(res => {
            if (res && !["get_search_summary", "get_country_info", "get_travel_prep_info", "get_immigration_info"].includes(res.toolName)) {
                dynamicResults[res.toolName] = res.data;
            }
        });

        console.log('[Dashboard Orchestrator] Results summary:', {
            totalTools: results.length,
            successfulTools: results.filter(r => r !== null).length,
            hasCountry: !!countryResult,
            hasPrep: !!prepResult,
            hasImmigration: !!immigrationResult,
            dynamicTools: Object.keys(dynamicResults)
        });

        return {
            summary: summaryResult?.data?.search_summary?.summary || summaryResult?.data?.summary || summaryResult?.data || "",
            country: countryResult?.data?.country_info || countryResult?.data,
            prep: prepResult?.data?.travel_prep_info || prepResult?.data,
            immigration: immigrationResult?.data?.immigration_info || immigrationResult?.data,
            classification,
            results: dynamicResults
        };
    } catch (error) {
        console.error("getInitialDashboardAction Error:", error);
        return null;
    }
}

export async function generateScenariosAction(query: string, filters?: { companion?: string; theme?: string; age?: string; travelType?: string }) {
    if (!query) throw new Error("Query is required");

    try {
        const filterContext = filters
            ? `\n\n[Constraints]\nCompanion: ${filters.companion || "Any"}\nTheme: ${filters.theme || "Any"}\nAge Group: ${filters.age || "Any"}\nTravel Type: ${filters.travelType || "Any"}\n\nIMPORTANT: You MUST strictly adhere to these constraints if provided.`
            : "";

        // MCP 도구 호출 (OpenAI 직접 호출 대신)
        const mcpResult: any = await callMcpTool("generate_scenarios", {
            user_query: query,
            companion: filters?.companion || "",
            theme: filters?.theme || "",
            age: filters?.age || "",
            travel_type: filters?.travelType || ""
        });

        // Parse MCP response
        if (mcpResult && mcpResult.content && mcpResult.content[0] && mcpResult.content[0].text) {
            const rawText = mcpResult.content[0].text;
            const cleaned = rawText.replace(/```json\s*|```/g, '').trim();

            try {
                const parsed = JSON.parse(cleaned);
                // Handle cases where output might be wrapped in { scenarios: [...] } or just [...]
                const scenarios = Array.isArray(parsed) ? parsed : (parsed.scenarios || []);

                return scenarios.map((item: any) => ({
                    id: item.id || Math.random().toString(36).substring(7),
                    text: item.text || "",
                    summary: item.summary || "",
                    icon: item.icon || "✈️"
                }));
            } catch (e) {
                console.error("Failed to parse scenarios JSON:", rawText, e);
                throw new Error("Invalid format received from AI");
            }
        }

        return [];
    } catch (error) {
        console.error("generateScenariosAction Error:", error);
        throw error;
    }
}

async function determineRelevantTools(query: string, scenario?: string, filters?: { travelType?: string }): Promise<string[]> {
    try {
        const response = await callOpenAI([
            {
                role: "system",
                content: `귀하는 여행 도구 오케스트레이터입니다. 사용자의 쿼리${scenario ? `와 선택된 시나리오('${scenario}')` : ''}${filters?.travelType ? ` 그리고 여행 스타일('${filters.travelType}')` : ''}를 분석하여 호출할 가장 적합한 도구들을 결정하세요.

                사용 가능한 도구:
                - 'get_packages': 여행 패키지 상품, 에어텔 등.
                - 'get_itineraries': 일자별 여행 일정, 코스 추천.
                - 'get_destinations': 추천 도시, 명소 정보.
                - 'get_hotels': 숙박 시설, 호텔 정보.
                - 'get_flights': 항공권 정보.
                - 'get_public_transport_info': 현지 교통편, 이동 방법.
                - 'get_local_tour_info': 현지 투어, 액티비티 정보.
                - 'generate_scenarios': 사용자의 검색 의도에 맞는 여행 시나리오를 생성합니다.
                - 'get_country_info': 국가 기본 정보 (언어, 시차, 전압, 비행시간 등). **국제 여행 시 필수**
                - 'get_immigration_info': 입국/비자 정보. **국제 여행 시 필수**
                - 'get_travel_prep_info': 여행 준비 정보 (날씨, 환율, 결제수단 등). **국제 여행 시 필수**

                규칙:
                - 반드시 'tools' 키를 가진 JSON 객체로 응답하세요. 예: {"tools": ["get_hotels", "get_destinations"]}
                - **시나리오가 선택된 경우 (scenario 파라미터가 있는 경우)**: 'get_itineraries', 'get_destinations', 'get_packages', 'get_hotels'를 반드시 포함하세요. 이는 사용자 필수 요구사항입니다.
                - **여행 종류가 '패키지'인 경우**: 'get_packages'를 반드시 포함하세요.
                - **여행 종류가 '자유여행'인 경우**: 'get_itineraries', 'get_hotels', 'get_flights'를 우선적으로 포함하세요.
                - **국제 목적지 감지 시 (일본, 파리, 방콕, 뉴욕, 런던 등)**: 'get_country_info', 'get_immigration_info', 'get_travel_prep_info', 'get_itineraries'를 반드시 포함하세요.
                - 사용자의 검색어에 구체적인 니즈가 있다면 해당 도구를 반드시 포함하세요.
                - **필수(시나리오 미선택 시)**: 사용자가 아직 시나리오를 선택하지 않은 검색 초기 단계라면, 최소 3개의 도구를 선택하고 가능한 경우 5개까지 선택하도록 하세요.
                
                예시:
                  - "일본" + 시나리오 선택 → ["get_itineraries", "get_destinations", "get_packages", "get_hotels", "get_country_info", "get_immigration_info", "get_travel_prep_info"]
                  - "힐링여행" → ["get_destinations", "get_itineraries", "get_local_tour_info", "generate_scenarios"]
                  - "2박3일 100만원이내" → ["get_packages", "get_destinations", "get_itineraries", "get_flights", "generate_scenarios"]
                  - "일본" → ["get_country_info", "get_immigration_info", "get_travel_prep_info", "get_itineraries", "get_destinations"]
                  - "패키지 여행" → ["get_packages", "get_destinations", "get_country_info"]`
            },
            { role: "user", content: `사용자 쿼리: ${query}${scenario ? `\n선택된 시나리오: ${scenario}` : ''}${filters?.travelType ? `\n여행 스타일: ${filters.travelType}` : ''}` }
        ], { type: "json_object" });

        const rawText = typeof response === 'string' ? response : JSON.stringify(response);
        const cleaned = rawText.replace(/```json\s*|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return Array.isArray(parsed.tools) ? parsed.tools : [];
    } catch (e) {
        console.error("Tool orchestration failed, defaulting to basic tools", e);
        return ['get_destinations', 'get_itineraries', 'get_packages', 'get_hotels', 'get_flights', 'get_public_transport_info', 'get_local_tour_info', 'generate_scenarios'];
    }
}

export async function getScenarioResultsAction(user_query: string, selected_scenario: string, filters?: { companion?: string; theme?: string; age?: string; travelType?: string }) {
    try {
        // 1. 시나리오 유형 분석 (자유여행 vs 패키지)
        const freeKeywords = ["자유롭게", "나만의", "직접 짜는", "유연한 일정", "자유여행으로", "자유여행", "배낭여행", "혼자"];
        const packageKeywords = ["패키지로", "편하게", "안심하고", "일정 짜여진", "가이드와 함께", "패키지", "투어"];

        const isFreeTravel = freeKeywords.some(kw => selected_scenario.includes(kw));
        const isPackageTravel = packageKeywords.some(kw => selected_scenario.includes(kw));

        // 유형 결정 (둘 다 해당하면 패키지 우선)
        let travelType = isPackageTravel ? "package" : (isFreeTravel ? "free" : "mixed");

        // 필터가 있으면 필터 우선
        if (filters?.travelType === "패키지") travelType = "package";
        if (filters?.travelType === "자유여행") travelType = "free";

        console.log(`[Orchestrator] Travel type detected: ${travelType} for "${selected_scenario}"`);

        // 2. 시나리오 의미 분석 (연령대, 테마 등)
        const scenarioContext = analyzeScenarioContext(selected_scenario);

        // 필터 값으로 오버라이드
        if (filters?.companion) scenarioContext.companion = filters.companion;
        if (filters?.theme) scenarioContext.theme = filters.theme;
        if (filters?.age) scenarioContext.ageGroup = filters.age;

        console.log(`[Orchestrator] Scenario context:`, scenarioContext);

        // 3. 여행 유형에 따른 도구 및 결과 구성
        const responseKeys: Record<string, string> = {
            "get_packages": "packages",
            "get_itineraries": "itineraries",
            "get_destinations": "destinations",
            "get_hotels": "hotels",
            "get_flights": "flights",
            "get_public_transport_info": "public_transport",
            "get_local_tour_info": "local_tours",
            "generate_scenarios": "scenarios"
        };

        let toolCalls: Array<{ toolName: string; params: any; resultKey?: string }> = [];

        // 시나리오 문장을 주요 검색어로 사용 (user_query는 보조 컨텍스트)
        const primaryQuery = selected_scenario;

        const commonParams = {
            user_query: primaryQuery,
            selected_scenario,
            companion: scenarioContext.companion || filters?.companion || "",
            theme: scenarioContext.theme || filters?.theme || "",
            age: scenarioContext.ageGroup || filters?.age || "",
            travel_type: filters?.travelType || travelType
        };

        if (travelType === "package") {
            // 패키지 여행: 패키지 도구 2회 호출 + 인기여행지
            const packageContexts = generatePackageContexts(scenarioContext, selected_scenario);

            toolCalls = [
                {
                    toolName: "get_packages",
                    params: { ...commonParams, selected_scenario: packageContexts[0] },
                    resultKey: "packages_primary"
                },
                {
                    toolName: "get_packages",
                    params: { ...commonParams, selected_scenario: packageContexts[1] },
                    resultKey: "packages_secondary"
                },
                {
                    toolName: "get_destinations",
                    params: commonParams
                }
            ];
            console.log(`[Orchestrator] Package travel - calling packages twice with contexts:`, packageContexts);

        } else if (travelType === "free") {
            // 자유여행: 인기여행지, 추천일정, 호텔, 항공, 현지투어
            toolCalls = [
                { toolName: "get_destinations", params: commonParams },
                { toolName: "get_itineraries", params: commonParams },
                { toolName: "get_hotels", params: commonParams },
                { toolName: "get_flights", params: commonParams },
                { toolName: "get_local_tour_info", params: commonParams }
            ];
            console.log(`[Orchestrator] Free travel - calling 5 tools with scenario query: "${primaryQuery}"`);

        } else {
            // 혼합형: 모든 주요 도구 호출
            toolCalls = [
                { toolName: "get_packages", params: commonParams },
                { toolName: "get_destinations", params: commonParams },
                { toolName: "get_itineraries", params: commonParams },
                { toolName: "get_hotels", params: commonParams },
                { toolName: "get_flights", params: commonParams }
            ];
            console.log(`[Orchestrator] Mixed travel - calling all major tools with scenario query: "${primaryQuery}"`);
        }

        // 4. 도구 병렬 실행
        const results = await Promise.all(
            toolCalls.map(async ({ toolName, params, resultKey }) => {
                try {
                    const res: any = await callMcpTool(toolName, params);
                    if (res && res.content && res.content[0] && res.content[0].text) {
                        const cleaned = res.content[0].text.replace(/```json\s*|```/g, '').trim();
                        const parsed = JSON.parse(cleaned);
                        const key = resultKey || responseKeys[toolName] || toolName.replace("get_", "");
                        return {
                            toolName: resultKey ? resultKey : toolName,
                            data: parsed[responseKeys[toolName]] ? parsed : { [responseKeys[toolName] || key]: parsed }
                        };
                    }
                } catch (e) {
                    console.error(`Tool ${toolName} failed:`, e);
                }
                return null;
            })
        );

        // 5. 결과 병합
        const finalResults: Record<string, any> = {};
        results.forEach(res => {
            if (res) {
                // 패키지 다중 호출 결과 병합
                if (res.toolName === "packages_primary" || res.toolName === "packages_secondary") {
                    if (!finalResults["get_packages"]) {
                        finalResults["get_packages"] = { packages: [] };
                    }
                    const packages = res.data.packages || [];
                    finalResults["get_packages"].packages.push(...packages);
                } else {
                    finalResults[res.toolName] = res.data;
                }
            }
        });

        // 6. 메타 정보 추가
        finalResults._meta = {
            travelType,
            scenarioContext
        };

        return finalResults;

    } catch (error) {
        console.error("getScenarioResultsAction Error:", error);
        throw error;
    }
}

// 시나리오 문장에서 컨텍스트 추출
function analyzeScenarioContext(scenario: string): {
    ageGroup: string | null;
    companion: string | null;
    theme: string | null;
    travelStyle: string | null;
} {
    let ageGroup = null;
    if (scenario.includes("노년") || scenario.includes("60대") || scenario.includes("70대")) {
        ageGroup = "60대 이상";
    } else if (scenario.includes("50대") || scenario.includes("중년")) {
        ageGroup = "50대";
    } else if (scenario.includes("40대")) {
        ageGroup = "40대";
    } else if (scenario.includes("30대")) {
        ageGroup = "30대";
    } else if (scenario.includes("20대") || scenario.includes("MZ") || scenario.includes("젊")) {
        ageGroup = "20-30대";
    }

    let companion = null;
    if (scenario.includes("부부") || scenario.includes("커플") || scenario.includes("연인")) {
        companion = "커플/부부";
    } else if (scenario.includes("가족") || scenario.includes("아이") || scenario.includes("부모님")) {
        companion = "가족";
    } else if (scenario.includes("혼자") || scenario.includes("솔로") || scenario.includes("혼행")) {
        companion = "혼자";
    } else if (scenario.includes("친구")) {
        companion = "친구";
    }

    let theme = null;
    if (scenario.includes("힐링") || scenario.includes("휴양") || scenario.includes("편안") || scenario.includes("여유")) {
        theme = "힐링/휴양";
    } else if (scenario.includes("맛집") || scenario.includes("미식") || scenario.includes("먹방")) {
        theme = "미식";
    } else if (scenario.includes("액티비티") || scenario.includes("모험") || scenario.includes("스포츠")) {
        theme = "액티비티";
    } else if (scenario.includes("문화") || scenario.includes("역사") || scenario.includes("관광")) {
        theme = "문화/관광";
    } else if (scenario.includes("쇼핑")) {
        theme = "쇼핑";
    }

    let travelStyle = null;
    if (scenario.includes("럭셔리") || scenario.includes("프리미엄") || scenario.includes("고급")) {
        travelStyle = "럭셔리";
    } else if (scenario.includes("가성비") || scenario.includes("알뜰") || scenario.includes("저렴")) {
        travelStyle = "가성비";
    }

    return { ageGroup, companion, theme, travelStyle };
}

// 패키지 검색 컨텍스트 2개 생성
function generatePackageContexts(context: ReturnType<typeof analyzeScenarioContext>, originalScenario: string): [string, string] {
    const contexts: string[] = [];

    // 첫 번째: 연령대/동반자 기반
    if (context.ageGroup) {
        if (context.companion) {
            contexts.push(`${context.ageGroup} ${context.companion}가 많이 찾는 인기 패키지`);
        } else {
            contexts.push(`${context.ageGroup}가 많이 찾는 인기 패키지`);
        }
    } else if (context.companion) {
        contexts.push(`${context.companion}가 많이 찾는 인기 패키지`);
    } else {
        contexts.push("최근 인기 있는 베스트 패키지");
    }

    // 두 번째: 테마/스타일 기반
    if (context.theme) {
        if (context.travelStyle) {
            contexts.push(`${context.travelStyle} ${context.theme} 테마 패키지`);
        } else {
            contexts.push(`${context.theme} 테마 인기 패키지`);
        }
    } else if (context.travelStyle) {
        contexts.push(`${context.travelStyle} 인기 패키지`);
    } else {
        contexts.push("일정이 여유로운 인기 패키지");
    }

    return [contexts[0] || originalScenario, contexts[1] || originalScenario];
}

