const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    console.log('Testing IBM job link with Stealth Plugin...');
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });

    try {
        await page.goto("https://careers.ibm.com/en_US/careers/JobDetail?jobId=67483", { waitUntil: "networkidle2", timeout: 45000 });
        await new Promise(r => setTimeout(r, 4000));

        await page.evaluate(() => window.scrollBy(0, 500));
        await new Promise(r => setTimeout(r, 1000));

        const title = await page.title();
        const text = await page.evaluate(() => document.body.innerText);

        console.log("Title: ", title);
        console.log("Extracted Text length: ", text.length);
        console.log("Preview: ", text.replace(/\s+/g, " ").substring(0, 500));

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
