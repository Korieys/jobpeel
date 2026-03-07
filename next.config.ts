import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist", "firebase-admin", "puppeteer", "puppeteer-extra", "puppeteer-extra-plugin-stealth"],
};

export default nextConfig;
