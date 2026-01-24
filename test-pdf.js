const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function test() {
    try {
        console.log("Testing pdf-parse...");
        // Create a minimal dummy PDF buffer (not a real PDF, but pdf-parse checks header)
        // Actually, pdf-parse needs a real PDF structure or it throws.
        // Let's just create a buffer and see if it imports correctly at least.

        console.log("pdf-parse type:", typeof pdf);
        console.log("Keys:", Object.keys(pdf));
        if (pdf.default) console.log("Has default export");

        // We can't easily generate a valid PDF here without a lib, but we can check if the import worked.
        console.log("Import successful.");
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
