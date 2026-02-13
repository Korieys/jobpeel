import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
    try {
        const { resumeText, jobDescription } = await req.json();

        if (!resumeText) {
            return NextResponse.json({ error: "Missing resume text" }, { status: 400 });
        }

        const jobContext = jobDescription
            ? `\n\nTARGET JOB DESCRIPTION (use this to evaluate keyword match and relevance):\n${jobDescription}`
            : "";

        const prompt = `You are an expert ATS (Applicant Tracking System) analyst and career coach.

Analyze the following resume for ATS compatibility, clarity, and professional impact.${jobContext}

RESUME TEXT:
${resumeText}

Evaluate the resume across these 6 categories. For each category, provide:
- A score from 0-100
- A one-line summary of the current state
- 2-3 specific, actionable improvement suggestions

CATEGORIES:
1. **Contact & Header** - Is contact info complete, professional email, LinkedIn present, proper formatting?
2. **Professional Summary** - Is there a strong summary/objective? Is it tailored, specific, and compelling?
3. **Experience & Impact** - Are bullet points action-verb led? Are achievements quantified with numbers/metrics? Is there clear impact demonstrated?
4. **Skills & Keywords** - Are relevant industry keywords present? Are hard/soft skills clearly listed? Would an ATS pick up the right terms?${jobDescription ? " Does it match the target job's requirements?" : ""}
5. **Education & Credentials** - Are degrees, certifications, and relevant coursework clearly presented?
6. **Formatting & Readability** - Is the structure clean? Are there parsing-friendly section headers? No tables/columns/graphics that confuse ATS?

Also provide:
- An overall ATS readiness score (0-100)
- A list of the top 5 most important improvements, ranked by impact
- If a job description was provided, a keyword match percentage and list of missing keywords

Return your response as JSON with this exact structure:
{
  "overallScore": number,
  "categories": [
    {
      "name": "Contact & Header",
      "score": number,
      "summary": "string",
      "suggestions": ["string", "string"]
    }
  ],
  "topImprovements": ["string", "string", "string", "string", "string"],
  "keywordAnalysis": {
    "matchPercentage": number | null,
    "matchedKeywords": ["string"] | [],
    "missingKeywords": ["string"] | []
  },
  "strengthHighlights": ["string", "string", "string"]
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert ATS and resume analyst. Always return valid JSON. Be specific and actionable in your feedback. Never be generic."
                },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const analysis = JSON.parse(completion.choices[0].message.content || "{}");

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Resume optimization error:", error);
        return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 });
    }
}
