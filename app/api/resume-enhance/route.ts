import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
    try {
        const { text, type = "bullet" } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Missing text to enhance" }, { status: 400 });
        }

        const prompts: Record<string, string> = {
            bullet: `You are an expert resume writer. Rewrite this resume bullet point to be more impactful.

Rules:
- Start with a strong action verb
- Quantify results with specific numbers/metrics when reasonable
- Keep it to 1-2 lines maximum
- Be specific, not generic
- Do NOT invent fake stats — only add quantification if the context implies measurable impact
- Return ONLY the improved bullet point text, nothing else

Original: "${text}"`,

            summary: `You are an expert resume writer. Rewrite this professional summary to be more compelling.

Rules:
- Keep it to 2-3 sentences max
- Be specific about value proposition
- Use confident, direct language
- Avoid clichés like "results-driven" or "team player"
- Return ONLY the improved summary text, nothing else

Original: "${text}"`,
        };

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a concise resume improvement assistant. Return only the improved text." },
                { role: "user", content: prompts[type] || prompts.bullet },
            ],
            temperature: 0.7,
            max_tokens: 200,
        });

        let enhanced = completion.choices[0].message.content || text;
        enhanced = enhanced.replace(/^["']|["']$/g, "").trim();

        return NextResponse.json({ enhanced });
    } catch (error) {
        console.error("Resume enhance error:", error);
        return NextResponse.json({ error: "Failed to enhance text" }, { status: 500 });
    }
}
