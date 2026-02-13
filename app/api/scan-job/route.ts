import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

<<<<<<< HEAD
/**
 * Enhanced Job Scanner with Multi-Stage Fallback
 * 1. Soft Scrape (Cheerio) -> Validate with GPT-4o
 * 2. Hard Scrape (Puppeteer Text) -> Validate with GPT-4o
 * 3. Vision Scrape (Puppeteer Screenshot) -> GPT-4o Vision
 */
export async function POST(req: NextRequest) {
    let browser: any = null;
=======
export async function POST(req: NextRequest) {
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
    try {
        const { url, mode = "auto" } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

<<<<<<< HEAD
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

        // --- 1. Soft Scrape (Cheerio) ---
=======
        let jobData = {
            title: "",
            company: "",
            description: "",
            method: "soft",
        };

        // 1. "Soft" Scrape (Cheerio)
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
        if (mode === "auto" || mode === "soft") {
            try {
                const res = await fetch(url, {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    },
                });
                const html = await res.text();
                const $ = cheerio.load(html);

                // Remove noise
                $("script, style, nav, footer, iframe, svg").remove();

                const title = $("h1").first().text().trim() || $("title").text().trim();
                const bodyText = $("body").text().replace(/\s+/g, " ").trim();

<<<<<<< HEAD
                if (bodyText.length > 200) {
                    const structured = await validateAndStructure(title, bodyText);

                    if (structured.valid !== false) {
                        return NextResponse.json({ ...structured, method: "soft" });
                    }
                    console.log("Soft scrape rejected:", structured.reason);
                    // Fall through to Hard Scrape
                }
            } catch (e) {
                console.log("Soft scrape failed, falling back to Puppeteer:", e);
            }
        }

        // --- 2. Hard Scrape (Puppeteer) ---
        // If mode is hard OR (mode is auto AND we haven't returned yet)
        if (mode === "auto" || mode === "hard") {
            console.log("Starting Hard Scrape...");
            try {
                browser = await puppeteer.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                const page = await browser.newPage();
                await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

                // Optimized loading
                await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
                // Give it a moment for hydration/rendering
                await new Promise(r => setTimeout(r, 2000));

                const title = await page.title();
                const text = await page.evaluate(() => document.body.innerText);
                const cleanedText = text.replace(/\s+/g, " ");

                // Try Text Validation First
                if (cleanedText.length > 200) {
                    const structured = await validateAndStructure(title, cleanedText);

                    if (structured.valid !== false) {
                        await browser.close();
                        return NextResponse.json({ ...structured, method: "hard_text" });
                    }
                    console.log("Hard scrape text rejected:", structured.reason);
                }

                // --- 3. Vision Fallback (Hard OCR) ---
                console.log("Text content unavailable or rejected, switching to Vision...");
                const screenshot = await page.screenshot({ encoding: "base64", fullPage: true });
                await browser.close();
                browser = null; // Prevent double close

                const visionData = await analyzeScreenshot(screenshot);
                return NextResponse.json({ ...visionData, method: "vision" });

            } catch (e) {
                console.error("Puppeteer/Vision failed:", e);
                return NextResponse.json({ error: "Failed to scan job. Site might be protected." }, { status: 500 });
            } finally {
                if (browser) await browser.close();
            }
        }

        return NextResponse.json({ error: "This page isnt peelable" }, { status: 400 });

=======
                if (bodyText.length > 500) {
                    jobData = {
                        title,
                        company: "", // Hard to guess accurately without structured data
                        description: bodyText.slice(0, 5000), // Limit context
                        method: "soft"
                    };
                }
            } catch (e) {
                console.log("Soft scrape failed:", e);
            }
        }

        // 2. "Hard" Scrape (Puppeteer)
        if ((mode === "auto" && jobData.description.length < 500) || mode === "hard") {
            console.log("Starting Hard Scrape...");
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();

            try {
                await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
                await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

                // Try to get text again
                const text = await page.evaluate(() => document.body.innerText);
                const title = await page.title();

                if (text.length > 500) {
                    jobData = {
                        title,
                        company: "",
                        description: text.replace(/\s+/g, " ").slice(0, 5000),
                        method: "hard_text"
                    };
                } else {
                    // 3. Vision Fallback (Hard OCR)
                    console.log("Text content low, switching to Vision...");
                    const screenshot = await page.screenshot({ encoding: "base64", fullPage: true });

                    jobData = await analyzeScreenshot(screenshot);
                    jobData.method = "vision";
                }
            } catch (e) {
                console.error("Puppeteer/Vision failed:", e);
                return NextResponse.json({ error: "Failed to scan job." }, { status: 500 });
            } finally {
                await browser.close();
            }
        }

        // 4. Final Polish with GPT-4o (Structure the data and VALIDATE)
        // Even if we got text, it might be messy. Let's structure it.
        if (jobData.description) {
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
                        content: `Title: ${jobData.title}\n\nContext: ${jobData.description}`
                    }
                ],
                response_format: { type: "json_object" }
            });

            const structured = JSON.parse(completion.choices[0].message.content || "{}");

            if (structured.valid === false) {
                return NextResponse.json({ error: structured.reason || "The provided URL does not appear to be a valid job posting." }, { status: 400 });
            }

            jobData = { ...jobData, ...structured };
        }

        return NextResponse.json(jobData);
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
    } catch (error) {
        console.error("Scan error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

async function analyzeScreenshot(base64Image: string) {
<<<<<<< HEAD
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
=======
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
    return JSON.parse(response.choices[0].message.content || "{}");
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
}
