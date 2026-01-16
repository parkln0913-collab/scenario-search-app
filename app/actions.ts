"use server";

import { callOpenAI } from "@/lib/openai";

export async function generateScenariosAction(query: string) {
    if (!query) throw new Error("Query is required");

    try {
        // Call OpenAI to generate 5 scenario titles based on the user query
        const openAiResponse = await callOpenAI([
            { role: "system", content: "You are an AI that generates travel scenario titles. Return a JSON array of exactly 5 objects, each with an 'id' (string) and 'text' (string) describing a travel scenario in Korean." },
            { role: "user", content: `Generate 5 travel scenario titles for the query: "${query}"` }
        ]);
        const response: any = { content: [{ type: "text", text: openAiResponse }] };

        // Parse response. The SDK returns { content: [{ type: 'text', text: '...' }] } usually.
        // The tool spec says output is `scenarios` (Array<string>). 
        // We need to check how the MCP server returns the data.
        // Usually tool results are strictly text or embedded resources in the `content` array.
        // Assuming the tool returns a JSON string inside the text content or structured data.
        // However, the PRD says: Output: `scenarios` (Array<string>, length=5).
        // MCP SDK `callTool` returns a `CallToolResult` which has `content`.
        // We should inspect the content.

        const contentItem = response.content[0];
        if (contentItem.type !== 'text') {
            throw new Error("Unexpected response type from MCP server");
        }

        const rawText = contentItem.text;
        // Remove possible markdown fences like ```json and ```
        const cleaned = typeof rawText === 'string' ? rawText.replace(/```json\s*|```/g, '').trim() : rawText;
        try {
            const parsed = JSON.parse(cleaned);
            // Ensure we return an array of strings (scenario texts)
            const resultArray = parsed.map((item: any) => {
                if (typeof item === 'object' && item !== null && 'text' in item) {
                    return item.text as string;
                }
                return item as string;
            });
            return resultArray;
        } catch (e) {
            console.error("Failed to parse scenarios JSON:", rawText, e);
            throw new Error("Invalid format received from AI");
        }

    } catch (error) {
        console.error("generateScenariosAction Error:", error);
        throw error; // Let UI handle it
    }
}

export async function getScenarioResultsAction(user_query: string, selected_scenario: string) {
    try {
        // Call OpenAI to generate detailed recommendation data based on query and selected scenario
        const openAiResponse = await callOpenAI([
            { role: "system", content: "You are an AI that provides travel recommendations. Return a JSON object with exactly three keys: 'packages', 'itineraries', and 'destinations'.\n\n'packages' should be an array of objects, each containing: \n- product_name (string): name of the travel package,\n- schedule_summary (string): brief summary of the schedule,\n- flight_info (string): flight details,\n- price (string): price information,\n- reason (string): why this package is recommended.\n\n'itineraries' should be an array of objects, each containing: \n- title (string): itinerary title,\n- reason (string): why this itinerary is recommended,\n- days (array): each day object with day_title (string) and detail (string).\n\n'destinations' should be an array of objects, each containing: \n- name (string): destination name,\n- reason (string): why this destination is recommended.\n\nOnly output the JSON object, no extra text, in Korean." },
            { role: "user", content: `Based on the travel query "${user_query}" and the selected scenario "${selected_scenario}", provide travel packages, itineraries, and destination recommendations.` }
        ]);
        const response: any = { content: [{ type: "text", text: openAiResponse }] };

        const contentItem = response.content[0];
        if (contentItem.type !== 'text') {
            throw new Error("Unexpected response type from MCP server");
        }

        const rawText = contentItem.text;
        // Remove possible markdown fences like ```json and ```
        const cleaned = typeof rawText === 'string' ? rawText.replace(/```json\s*|```/g, '').trim() : rawText;
        try {
            const parsed = JSON.parse(cleaned);
            return parsed;
        } catch (e) {
            console.error("Failed to parse results JSON:", rawText);
            throw new Error("Invalid format received from AI");
        }
    } catch (error) {
        console.error("getScenarioResultsAction Error:", error);
        throw error;
    }
}
