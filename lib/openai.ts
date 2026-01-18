// lib/openai.ts

// WARNING: In production, store API keys securely (e.g., env vars). Here we embed the key as per user request.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function callOpenAI(messages: { role: string; content: string }[], options?: { type?: "json_object" | "text" }) {
    const body: any = {
        model: "gpt-4o-mini",
        messages,
        temperature: 0,
    };

    if (options?.type === "json_object") {
        body.response_format = { type: "json_object" };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    // Return the assistant's message content
    return data.choices?.[0]?.message?.content;
}
