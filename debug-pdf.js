const pdf = require('pdf-parse');

// Minimal valid PDF binary string
const pdfData =
    "%PDF-1.0\n" +
    "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]/Parent 2 0 R/Resources<<>>>>endobj\n" +
    "xref\n" +
    "0 4\n" +
    "0000000000 65535 f\n" +
    "0000000010 00000 n\n" +
    "0000000060 00000 n\n" +
    "0000000157 00000 n\n" +
    "trailer<</Size 4/Root 1 0 R>>\n" +
    "startxref\n" +
    "249\n" +
    "%%EOF";

const buffer = Buffer.from(pdfData);

async function run() {
    console.log("Debug: Import type:", typeof pdf);
    console.log("Debug: Keys:", Object.keys(pdf));

    let pdfParser = pdf;
    if (typeof pdf !== 'function' && pdf.default) {
        console.log("Debug: Switching to default export");
        pdfParser = pdf.default;
    }

    try {
        console.log("Attempting to parse buffer of size:", buffer.length);
        const data = await pdfParser(buffer);
        console.log("Success! Text:", data.text);
        console.log("Info:", data.info);
    } catch (e) {
        console.error("Crash:", e);
    }
}

run();
