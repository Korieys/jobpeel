import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist", "firebase-admin", "puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
