import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist", "firebase-admin", "puppeteer-extra", "puppeteer-core", "puppeteer-extra-plugin-stealth", "@sparticuz/chromium"],
};

export default nextConfig;
