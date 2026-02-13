import { NextRequest, NextResponse } from "next/server";

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

        const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Load PDF using pdfjs-dist
        const loadingTask = pdfjs.getDocument({
            data: uint8Array,
            useSystemFonts: true,
            disableFontFace: true,
        });

        const pdfDoc = await loadingTask.promise;
        let fullText = "";

        // Iterate through all pages
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            // In pdf.js textContent.items can be text item or mark item
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
            fullText += pageText + "\n";
        }

        console.log("PDF parsed successfully via pdfjs-dist, text length:", fullText.length);

        return NextResponse.json({ text: fullText.trim() });
    } catch (error: any) {
        console.error("Server Error parsing resume:", error);
        return NextResponse.json(
            { error: `Failed to parse resume: ${error.message || "Unknown error"}` },
            { status: 500 }
        );
    }
}
