"use client";

import { useState } from "react";
import { Search, Upload, Loader2, Link as LinkIcon, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface JobScannerProps {
    onJobFound: (data: any) => void;
}

export function JobScanner({ onJobFound }: JobScannerProps) {
    const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
    const [isLoading, setIsLoading] = useState(false);
    const [url, setUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleUrlScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/scan-job", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, mode: "auto" }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            onJobFound(data);
            toast.success("Job scanned successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Failed to scan job.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setIsLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        try {
            const res = await fetch("/api/analyze-screenshot", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            onJobFound(data);
            toast.success("Screenshot analyzed!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to analyze screenshot.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex gap-1 mb-6 p-1 bg-black/20 border border-white/5 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab("url")}
                    className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2",
                        activeTab === "url"
                            ? "bg-zinc-800 text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                    )}
                >
                    <LinkIcon className="w-3 h-3" /> Link
                </button>
                <button
                    onClick={() => setActiveTab("upload")}
                    className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2",
                        activeTab === "upload"
                            ? "bg-zinc-800 text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                    )}
                >
                    <ImageIcon className="w-3 h-3" /> Screenshot
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "url" ? (
                    <motion.form
                        key="url-form"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onSubmit={handleUrlScan}
                        className="flex flex-col gap-4"
                    >
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="url"
                                placeholder="Paste Job URL..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-black/20 focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all text-sm text-white placeholder:text-zinc-600 font-mono"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !url}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/5"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scan Job"}
                        </button>
                    </motion.form>
                ) : (
                    <motion.div
                        key="upload-form"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                    >
                        <label className={cn(
                            "flex flex-col items-center justify-center w-full h-32 border border-dashed rounded-xl cursor-pointer bg-black/20 hover:bg-black/40 transition-colors",
                            isLoading ? "opacity-50 pointer-events-none" : "border-white/10 hover:border-white/20"
                        )}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin mb-2" />
                                ) : (
                                    <Upload className="w-6 h-6 text-zinc-600 mb-2" />
                                )}
                                <p className="text-xs text-zinc-500 font-medium">Click to upload screenshot</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleScreenshotUpload} disabled={isLoading} />
                        </label>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
