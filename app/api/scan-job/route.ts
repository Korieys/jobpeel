import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { verifyAuthToken } from "@/lib/firebase-admin";

export const maxDuration = 60; // Allow up to 60s for fallback scraping on Vercel

/**
 * Enhanced Job Scanner: 3-tier scraping pipeline
 * 1. Firecrawl API (fast, lightweight remote scrape)
 * 2. Puppeteer + Stealth (headless browser fallback with @sparticuz/chromium)
 * 3. GPT-4o Vision (screenshot OCR as last resort)
 */
export async function POST(req: NextRequest) {
    // --- AUTH ---
    const authUid = await verifyAuthToken(req);
    if (!authUid) {
        return NextResponse.json({ error: "Unauthorized. Missing or invalid authentication token." }, { status: 401 });
    }

    let browser: any = null;
    try {
        const { url } = await req.json();

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

        // ═══════════════════════════════════════════
        // --- STEP 1: Firecrawl API (Primary) ---
        // ═══════════════════════════════════════════
        console.log("Starting Firecrawl Scrape...");

        if (!process.env.FIRECRAWL_API_KEY) {
            console.error("FIRECRAWL_API_KEY is missing");
            // Don't fail hard here — fall through to Puppeteer
        } else {
            let firecrawlMarkdown = "";
            let firecrawlTitle = url;

            try {
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
                    console.error("Firecrawl API Error:", await firecrawlRes.text());
                } else {
                    const data = await firecrawlRes.json();
                    firecrawlMarkdown = data.data?.markdown || "";
                    firecrawlTitle = data.data?.metadata?.title || url;
                }
            } catch (e) {
                console.error("Firecrawl Request Failed:", e);
            }

            if (firecrawlMarkdown.length > 50) {
                const structured = await validateAndStructure(firecrawlTitle, firecrawlMarkdown);
                if (structured.valid !== false) {
                    return NextResponse.json({ ...structured, method: "firecrawl" });
                }
                console.log("Firecrawl scrape rejected by GPT:", structured.reason);
            }
        }

        // ═══════════════════════════════════════════
        // --- STEP 2: Puppeteer Stealth Fallback ---
        // ═══════════════════════════════════════════
        console.log("Falling back to Puppeteer Stealth browser...");

        try {
            // Dynamically import so build doesn't break if binary is missing
            const puppeteerExtra = (await import("puppeteer-extra")).default;
            const StealthPlugin = (await import("puppeteer-extra-plugin-stealth")).default;
            const chromium = (await import("@sparticuz/chromium")).default;

            puppeteerExtra.use(StealthPlugin());

            // On Vercel, download remote Sparticuz Chromium. Locally, use installed Chrome.
            const isVercel = !!process.env.VERCEL;
            let execPath: string | undefined;
            if (isVercel) {
                execPath = await chromium.executablePath(
                    "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
                );
            } else {
                // Use locally installed Google Chrome on Windows
                const localChromePaths = [
                    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
                    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
                ];
                const fs = await import("fs");
                execPath = localChromePaths.find(p => fs.existsSync(p));
            }

            browser = await puppeteerExtra.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--single-process",
                    "--no-zygote",
                ],
                ...(execPath && { executablePath: execPath }),
            });

            const page = await browser.newPage();
            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            try {
                await page.goto(url, { waitUntil: "networkidle2", timeout: 10000 });
            } catch (e) {
                console.warn("Navigation timeout, proceeding with partial content...");
            }

            // Scroll to trigger lazy-loaded content
            await page.evaluate(() => window.scrollBy(0, 500));
            await new Promise(r => setTimeout(r, 1500));

            const title = await page.title();
            const bodyText = await page.evaluate(() => document.body.innerText);
            const cleanedText = bodyText.replace(/\s+/g, " ").trim();

            if (cleanedText.length > 200) {
                const structured = await validateAndStructure(title, cleanedText);
                if (structured.valid !== false) {
                    await browser.close();
                    browser = null;
                    return NextResponse.json({ ...structured, method: "puppeteer_stealth" });
                }
                console.log("Puppeteer text rejected by GPT:", structured.reason);
            }

            // ═══════════════════════════════════════════
            // --- STEP 3: Vision OCR (Last Resort) ---
            // ═══════════════════════════════════════════
            console.log("Text insufficient, trying vision analysis...");
            const screenshot = await page.screenshot({ encoding: "base64", fullPage: true }) as string;
            await browser.close();
            browser = null;

            const visionData = await analyzeScreenshot(screenshot);
            if (visionData && !visionData.error) {
                return NextResponse.json({ ...visionData, method: "vision" });
            }

        } catch (e) {
            console.error("Puppeteer fallback failed:", e);
        } finally {
            if (browser) {
                try { await browser.close(); } catch { }
            }
        }

        return NextResponse.json({ error: "This page isn't peelable by any of our methods." }, { status: 400 });

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
