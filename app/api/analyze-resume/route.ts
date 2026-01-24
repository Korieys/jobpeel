import { NextRequest, NextResponse } from "next/server";
const pdf = require("pdf-parse");

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // v1.1.1 exports the function directly
        const data = await pdf(buffer);
        const text = data.text;

        console.log("PDF parsed successfully, text length:", text.length);

        // TODO: In the future, we can send this text to GPT-4o to structure it better

        return NextResponse.json({ text });
    } catch (error) {
        console.error("Server Error parsing resume:", error);
        return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
    }
}
