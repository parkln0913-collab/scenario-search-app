// lib/openai.ts

// WARNING: In production, store API keys securely (e.g., env vars). Here we embed the key as per user request.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function callOpenAI(messages: { role: string; content: string }[]) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    // Return the assistant's message content
    return data.choices?.[0]?.message?.content;
}
