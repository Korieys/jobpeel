import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
    try {
        const { resumeText, jobData, tone = "professional", userProfile } = await req.json();

        if (!resumeText || !jobData) {
            return NextResponse.json({ error: "Missing resume or job data" }, { status: 400 });
        }

        const contactInfo = userProfile ? `
        CANDIDATE CONTACT INFO (PRIORITIZE THIS OVER RESUME):
        Name: ${userProfile.firstName} ${userProfile.lastName}
        Phone: ${userProfile.phoneNumber}
        Email: ${userProfile.email}
        ` : "";

        const jobContext = `
      Title: ${jobData.title}
      Company: ${jobData.company}
      Description: ${jobData.description}
    `;

        const prompt = `
      You are an elite executive recruiter and professional copywriter writing a custom cover letter.
      
      Goal: Write a highly compelling, personalized cover letter for the following candidate applying for the job described below.
      
      TONE: ${tone.toUpperCase()}. The writing must be conversational, confident, and punchy.
      
      ${contactInfo}

      JOB DETAILS:
      ${jobContext}
      
      CANDIDATE PROVIDED RESUME:
      ${resumeText}
      
      STRICT WRITING RULES (VIOLATION RESULTS IN FAILURE):
      1. **FIRST PERSON ONLY**: You MUST write the cover letter in the first person ("I", "my") from the perspective of the candidate. NEVER write in the third person ("John is...", "He achieved...").
      2. **COVER LETTER FORMAT**: This is a formal cover letter, NOT an email. Do not use email structures like "Subject:", "Hi [Name],", or "Best,". Begin with a formal greeting (e.g., "Dear Hiring Manager," or the specific person if known) and end with a professional sign-off (e.g., "Sincerely, [Candidate Name]").
      3. **BANNED CLICHES**: You MUST NOT use phrases like "I am writing to express my interest", "I am particularly drawn to", "cross-functional teams", "delve", "testament to", "dynamic", "thrilled to apply", "unique blend", or "intersection of".
      4. **NO ROBOTIC STRUCTURES**: Avoid the standard 3-paragraph "Intro -> I did X -> Outro" format. Start with an immediate, gripping hook about the company's specific product/challenge or a strong, relevant achievement from the candidate.
      5. **SHOW, DON'T TELL**: Don't say "I am a strong leader." Instead, describe the exact size of the team managed or the specific outcome achieved (as found in the resume).
      6. **NO FLUFF**: Remove weak verbs and filler words. Every sentence must add concrete value.
      7. **FORMAT**: Plain text only. No markdown, no bolding, no headers, no bullet points, no "---".
      8. **LIMIT**: Keep it under 250 words. Be ruthlessly brief and impactful.

      STRICT DATA INTEGRITY (ZERO HALLUCINATIONS ALLOWED):
      1. You may ONLY mention skills, jobs, metrics, and experiences explicitly listed in the CANDIDATE PROVIDED RESUME.
      2. Do NOT invent proficiency in software, languages, or methodologies just to match the job description.
      3. If a required job skill is missing from the resume, focus on a transferable skill they DO have, or highlight their proven ability to learn quickly (referencing a past fast-ramp). Do NOT claim they have the missing skill.
      4. If summarizing years of experience, calculate it mathematically from the resume dates. Do not round up generously.
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a master copywriter who writes in a punchy, direct, and overwhelmingly human voice. You despise generic corporate speak, AI-sounding vocabulary, and fluff." },
                { role: "user", content: prompt },
            ],
            temperature: 0.7, // Lowered slightly to enforce stricter adherence to strict rules and facts

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
