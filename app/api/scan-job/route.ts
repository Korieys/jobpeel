import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { verifyAuthToken } from "@/lib/firebase-admin";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60; // Increase Vercel timeout to 60s for Chromium fallback

/**
 * Enhanced Job Scanner powered by Firecrawl API
 * 1. Firecrawl Scrape (Extracts clean Markdown)
 * 2. Validate with GPT-4o
 */
export async function POST(req: NextRequest) {
    // --- SECURITY INCIDENT FIX ---
    const authUid = await verifyAuthToken(req);
    if (!authUid) {
        return NextResponse.json({ error: "Unauthorized. Missing or invalid authentication token." }, { status: 401 });
    }

    let browser: any = null;
    try {
        const { url, mode = "auto" } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // --- Helper: Validate and Structure Text with GPT-4o ---
        const validateAndStructure = async (title: string, content: string) => {
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `You are a job parser and moderator. 
                            Analyze the text. 
                            1. First, determine if this is a legitimate job posting (e.g. not a login page, home page, error page, or empty blog).
                            2. If VALID, extract { title, company, description }.
                            3. If INVALID, return { valid: false, reason: "Not a job posting" }.
                            4. Return JSON: { valid: boolean, title?, company?, description?, reason? }`
                        },
                        {
                            role: "user",
                            content: `Title: ${title}\n\nContext: ${content.slice(0, 15000)}`
                        }
                    ],
                    response_format: { type: "json_object" }
                });
                const result = JSON.parse(completion.choices[0].message.content || "{}");
                return result;
            } catch (e) {
                console.error("GPT Validation Error:", e);
                return { valid: false, reason: "Validation failed" };
            }
        };

        // --- 1. Firecrawl API Scrape ---
        console.log("Starting Firecrawl Scrape...");

        if (!process.env.FIRECRAWL_API_KEY) {
            console.error("FIRECRAWL_API_KEY is missing");
            return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
        }

        const firecrawlRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.FIRECRAWL_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: url,
                formats: ["markdown"],
                onlyMainContent: true
            })
        });

        if (!firecrawlRes.ok) {
            const errorData = await firecrawlRes.json();
            console.error("Firecrawl API Error:", errorData);
            return NextResponse.json({ error: "Failed to scrape job. Site might be protected against bots." }, { status: 500 });
        }

        const data = await firecrawlRes.json();
        const markdown = data.data?.markdown || "";
        const pageTitle = data.data?.metadata?.title || url;

        if (markdown.length > 50) {
            const structured = await validateAndStructure(pageTitle, markdown);

            if (structured.valid !== false) {
                return NextResponse.json({ ...structured, method: "firecrawl" });
            }
            console.log("Firecrawl scrape rejected by GPT:", structured.reason);
        }

        // --- 2. Fallback: Serverless Chromium Scrape ---
        console.log("Firecrawl failed to peel the data or returned empty Markdown. Falling back to Serverless Chromium...");

        try {
            browser = await puppeteer.launch({
                args: chromium.args,
                executablePath: await chromium.executablePath(),
                headless: true,
            });

            const page = await browser.newPage();
            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            try {
                await page.goto(url, { waitUntil: "networkidle2", timeout: 8000 });
            } catch (e) {
                console.warn("Navigation timeout, proceeding anyway...");
            }
            await new Promise(r => setTimeout(r, 2000));
            // Small scroll to trigger lazy-loaded sections (like job descriptions)
            await page.evaluate(() => {
                window.scrollBy(0, 500);
            });
            await new Promise(r => setTimeout(r, 1000));

            const title = await page.title();
            const text = await page.evaluate(() => document.body.innerText);
            const cleanedText = text.replace(/\s+/g, " ");

            // Try Text Validation First
            if (cleanedText.length > 200) {
                const structured = await validateAndStructure(title, cleanedText);

                if (structured.valid !== false) {
                    await browser.close();
                    return NextResponse.json({ ...structured, method: "chromium_text" });
                }
                console.log("Chromium scrape text rejected:", structured.reason);
            }

            // --- 3. Vision Fallback (Hard OCR) ---
            console.log("Text content unavailable or rejected, switching to Vision...");
            const screenshot = await page.screenshot({ encoding: "base64", fullPage: true }) as string;
            await browser.close();
            browser = null; // Prevent double close

            const visionData = await analyzeScreenshot(screenshot);
            return NextResponse.json({ ...visionData, method: "vision" });

        } catch (e) {
            console.error("Puppeteer/Vision failed:", e);
            return NextResponse.json({ error: "Failed to scan job. Site might be protected against bots." }, { status: 500 });
        } finally {
            if (browser) await browser.close();
        }

        return NextResponse.json({ error: "This page isnt peelable" }, { status: 400 });

    } catch (error) {
        console.error("Scan error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

async function analyzeScreenshot(base64Image: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a job parser. Analyze this screenshot of a job post. Extract the Job Title, Company Name, and key requirements/description. If you cannot find a job posting, return empty JSON: {}."
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
        const result = JSON.parse(response.choices[0].message.content || "{}");

        if (!result.title && !result.description) {
            return { error: "This page isnt peelable" };
        }

        return result;
    } catch (e) {
        console.error("Vision Error:", e);
        return { error: "This page isnt peelable" };
    }
}
