import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
    try {
        const { resumeText, jobData, tone = "professional" } = await req.json();

        if (!resumeText || !jobData) {
            return NextResponse.json({ error: "Missing resume or job data" }, { status: 400 });
        }

        const jobContext = `
      Title: ${jobData.title}
      Company: ${jobData.company}
      Description: ${jobData.description}
    `;

        const prompt = `
      You are an expert career coach and professional copywriter.
      
      Goal: Write a highly persuasive, custom cover letter for the following candidate applying for the job described below.
      
      TONE: ${tone.toUpperCase()}.
      
      JOB DETAILS:
      ${jobContext}
      
      CANDIDATE PASTEID RESUME:
      ${resumeText}
      
      OUTPUT RULES:
      - **FORMAT AS PLAIN TEXT**. Do NOT use Markdown. Do NOT use bolding (**), italics (*), or headers (#).
      - **CRITICAL**: Write like a human. Do NOT use clichéd AI phrases like "I am writing to express my interest", "It is with great enthusiasm", "seamlessly", "intersection of", "testament to", or "delve".
      - **NO EM-DASHES**: Do not use em-dashes (—). Use commas or periods instead.
      - **NO "NOT A X, BUT A Y"**: Do not use sentence structures like "I'm not just a [role], I'm a [value]" or "More than just a...".
      - **NO HORIZONTAL RULES**: Do not use "---" or horizontal lines to separate sections or headers.
      - Be direct, confident, and specific.
      - Do not include placeholders like "[Your Name]" -> Use the name from the resume if available, otherwise sign off with "Sincerely, A Passionate Candidate".
      - Keep it concise (200-300 words).
      - Start with a strong hook that references the company or role specifically.

      **DATA INTEGRITY & TRUTH PROTOCOL (STRICT):**
      1. **NO HALLUCINATIONS**: You are FORBIDDEN from inventing ANY facts, skills, or experiences not explicitly present in the provided resume. If the resume does not say they used "React", do NOT say they used "React".
      2. **CALCULATE, DON'T GUESS**: If you mention "years of experience", you MUST manually calculate the time difference between the Start Date and End Date of the relevant roles in the resume. Do not use generic estimates like "10+ years" unless the dates actually sum to that. If dates are ambiguous, err on the side of caution or do not specify a number.
      3. **EVIDENCE-BASED**: Every claim you make about the candidate's background must be traceable back to the resume text.
      4. **MISSING DATA**: If a specific detail requested by the job description is missing from the resume, do NOT lie and say the candidate has it. Instead, pivot to a related strength that IS in the resume, or express eagerness to learn that specific skill.
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful expert assistant. You write completely natural, human-sounding text." },
                { role: "user", content: prompt },
            ],
            temperature: 0.85, // Slightly higher for more variance
        });

        let coverLetter = completion.choices[0].message.content || "";

        // Cleanup: Aggressively Strip markdown code fences AND bolding/formatting
        coverLetter = coverLetter
            .replace(/```markdown/g, "")
            .replace(/```/g, "")
            .replace(/\*\*/g, "") // Remove bolding
            .replace(/#{1,6}\s/g, "") // Remove headers
            .trim();

        return NextResponse.json({ coverLetter });
    } catch (error) {
        console.error("Values generation error:", error);
        return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 });
    }
}
