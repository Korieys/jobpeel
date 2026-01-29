import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";


export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a job parser. Analyze this screenshot of a job post. Extract the Job Title, Company Name, and key requirements/description. Return JSON: { title, company, description }"
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Extract job details." },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }
            ],
            response_format: { type: "json_object" }
        });

        const jobData = JSON.parse(response.choices[0].message.content || "{}");
        return NextResponse.json(jobData);

    } catch (error) {
        console.error("Screenshot analysis error:", error);
        return NextResponse.json({ error: "Failed to analyze screenshot" }, { status: 500 });
    }
}
