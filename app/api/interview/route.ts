import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
    try {
        const { messages, jobTitle, jobDescription, interviewType = "behavioral" } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Missing messages" }, { status: 400 });
        }

        const typeDescriptions: Record<string, string> = {
            behavioral: "Ask behavioral interview questions using the STAR method (Situation, Task, Action, Result). Focus on teamwork, leadership, conflict resolution, and problem-solving.",
            technical: "Ask technical interview questions relevant to the role. Include conceptual questions, system design basics, and problem-solving scenarios. Do NOT ask coding syntax questions.",
            situational: "Ask situational/hypothetical interview questions. Present realistic workplace scenarios and ask how the candidate would handle them.",
            general: "Ask a mix of common interview questions including 'tell me about yourself', career goals, strengths/weaknesses, and role-specific questions.",
        };

        const jobContext = jobTitle
            ? `The candidate is interviewing for the role of "${jobTitle}"${jobDescription ? `. Job description: ${jobDescription.substring(0, 500)}` : ""}.`
            : "The candidate is practicing for general interview preparation.";

        const systemPrompt = `You are an experienced, friendly professional interviewer conducting a mock interview.

CONTEXT: ${jobContext}

INTERVIEW STYLE: ${typeDescriptions[interviewType] || typeDescriptions.general}

RULES:
1. Ask ONE question at a time. Do not ask multiple questions.
2. After the candidate answers, provide brief, constructive feedback (2-3 sentences) on their answer, then ask the next question.
3. Your feedback should point out what was strong AND what could be improved. Be specific.
4. Rate each answer on a scale of 1-5 stars (include as ⭐ emojis).
5. Keep a natural, encouraging conversational tone — you're helping them improve.
6. Start with an easier warm-up question, then gradually increase difficulty.
7. After about 6-8 questions, wrap up with a brief overall summary of performance and key areas to improve.
8. Format your responses for readability: use line breaks between the feedback and the next question.
9. If this is the very first message (conversation just started), greet the candidate briefly and ask the first question.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((m: { role: string; content: string }) => ({
                    role: m.role as "user" | "assistant",
                    content: m.content,
                })),
            ],
            temperature: 0.8,
            max_tokens: 600,
        });

        const reply = completion.choices[0].message.content || "Sorry, I couldn't generate a response.";

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Interview API error:", error);
        return NextResponse.json({ error: "Failed to generate interview response" }, { status: 500 });
    }
}
