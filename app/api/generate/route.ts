import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { adminDb, verifyAuthToken } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // AI endpoints may take longer

const FREE_TIER_LIMIT = 10;

async function isUniversityUser(email: string): Promise<boolean> {
    try {
        if (!adminDb) return false;
        const waitlistRef = adminDb.collection("jobpeel_waitlist");
        const snap = await waitlistRef.get();
        for (const docSnap of snap.docs) {
            const data = docSnap.data();
            const domains: string[] = data.domains || [];
            if (domains.some((d: string) => email.toLowerCase().endsWith("@" + d.toLowerCase()))) {
                return true;
            }
        }
    } catch (e) {
        console.error("University check error:", e);
    }
    return false;
}

export async function POST(req: NextRequest) {
    try {
        const { resumeText, jobData, tone = "professional", userProfile, userId } = await req.json();

        if (!resumeText || !jobData) {
            return NextResponse.json({ error: "Missing resume or job data" }, { status: 400 });
        }

        // --- SECURITY INCIDENT FIX: Authenticate the user from Token ---
        const authUid = await verifyAuthToken(req);
        if (!authUid) {
            return NextResponse.json({ error: "Unauthorized. Missing or invalid authentication token." }, { status: 401 });
        }

        // Determine the actual userId to check against. 
        // We override whatever the client sent with the cryptographically verified one.
        const secureUserId = authUid;

        // --- Paywall Check ---
        if (secureUserId) {
            if (!adminDb) throw new Error("Database not initialized");
            const userRef = adminDb.collection("users").doc(secureUserId);
            const userSnap = await userRef.get();
            const userData = userSnap.exists ? userSnap.data() || {} : {};
            const email: string = userData.email || userProfile?.email || "";
            const generationsUsed: number = userData.generationsUsed ?? 0;
            const plan: string = userData.plan || "free";

            // Paid subscribers (standard/pro) and university users get unlimited access
            const isUni = await isUniversityUser(email);
            const isPaidPlan = plan === "standard" || plan === "pro";

            if (!isUni && !isPaidPlan && generationsUsed >= FREE_TIER_LIMIT) {
                return NextResponse.json(
                    { error: "limit_reached", generationsUsed, limit: FREE_TIER_LIMIT },
                    { status: 403 }
                );
            }
        }

        // --- Build prompt ---
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
            temperature: 0.7,
        });

        let coverLetter = completion.choices[0].message.content || "";

        // Cleanup markdown artifacts
        coverLetter = coverLetter
            .replace(/```markdown/g, "")
            .replace(/```/g, "")
            .replace(/\*\*/g, "")
            .replace(/#{1,6}\s/g, "")
            .trim();

        // --- Increment counter on success ---
        if (secureUserId) {
            try {
                if (!adminDb) throw new Error("Database not initialized");
                const userRef = adminDb.collection("users").doc(secureUserId);
                const userSnap = await userRef.get();
                const userData = userSnap.exists ? userSnap.data() || {} : {};
                const email: string = userData.email || userProfile?.email || "";
                const isUni = await isUniversityUser(email);

                if (!isUni) {
                    await userRef.update({ generationsUsed: admin.firestore.FieldValue.increment(1) });
                }
            } catch (e) {
                console.error("Failed to increment generation count:", e);
            }
        }

        return NextResponse.json({ coverLetter });
    } catch (error) {
        console.error("Values generation error:", error);
        return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 });
    }
}
