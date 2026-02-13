"use client";

import { useState, useCallback, useEffect } from "react";
import {
    Upload,
    FileText,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Zap,
    Target,
    TrendingUp,

    AlertCircle,
    RefreshCw,
    Sparkles,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AnalysisResult {
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    keywords: { missing: string[]; found: string[] };
    atsCompat: { score: number; issues: string[] };
}

export default function ResumeOptimizerPage() {
    const [file, setFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

    // Extract text from PDF using server-side API (analyze-resume) instead of client-side pdfjs-dist
    const extractText = async (file: File): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/analyze-resume", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to parse PDF");
            }

            const data = await res.json();
            return data.text;
        } catch (err) {
            console.error(err);
            throw new Error("Failed to parse PDF via API");
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const uploadedFile = acceptedFiles[0];
        if (!uploadedFile) return;

        if (uploadedFile.type !== "application/pdf") {
            toast.error("Please upload a PDF file");
            return;
        }

        setFile(uploadedFile);
        setUploadedFileName(uploadedFile.name);
        setError(null);
        setResult(null);

        try {
            const text = await extractText(uploadedFile);
            setResumeText(text);
            toast.success("Resume uploaded");
        } catch {
            setError("Could not read PDF text. Please try a different file.");
            toast.error("Failed to read PDF");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        multiple: false,
    });

    const handleAnalyze = async () => {
        if (!resumeText) return;
        setIsAnalyzing(true);
        setError(null);

        try {
            const res = await fetch("/api/optimize-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText, jobDescription }),
            });

            if (!res.ok) throw new Error("Analysis failed");

            const data = await res.json();
            setResult(data);
            toast.success("Analysis complete!");
        } catch (err) {
            setError("Failed to analyze resume. Please try again.");
            toast.error("Analysis failed");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResumeText("");
        setJobDescription("");
        setResult(null);
        setError(null);
        setUploadedFileName(null);
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Resume Optimizer</h1>
                <p className="text-zinc-400">Score your resume against job descriptions and get AI-powered improvements.</p>
            </header>

            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-3xl mx-auto space-y-6"
                    >
                        {/* Upload Zone */}
                        <div
                            {...getRootProps()}
                            className={cn(
                                "border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all group",
                                isDragActive
                                    ? "border-orange-500 bg-orange-500/10"
                                    : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-900"
                            )}
                        >
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                                        <Upload className="w-6 h-6 text-orange-500 animate-bounce" />
                                    </div>
                                    <p className="font-bold text-orange-400">Drop your resume here...</p>
                                </div>
                            ) : uploadedFileName ? (
                                <div className="flex flex-col items-center">
                                    <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
                                    <p className="font-bold text-sm text-white">Resume Loaded</p>
                                    <p className="text-xs text-zinc-500 mt-1 font-mono max-w-[200px] truncate">{uploadedFileName}</p>
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-3 hover:text-white transition-colors">Click to Replace</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
                                    <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center mb-4 border border-white/5 shadow-lg">
                                        <Upload className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" />
                                    </div>
                                    <p className="font-bold text-sm mb-2 text-zinc-300">Upload Your Resume</p>
                                    <p className="text-xs text-zinc-600">Drag & drop or click to browse</p>
                                </div>
                            )}
                        </div>

                        {/* Job Description Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Job Description</label>
                                <span className="text-[10px] text-zinc-600 bg-zinc-900 px-2 py-1 rounded-md border border-white/5">Optional but recommended</span>
                            </div>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here to see how well you match..."
                                rows={6}
                                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none custom-scrollbar"
                            />
                        </div>

                        {/* Analyze Button */}
                        <button
                            onClick={handleAnalyze}
                            disabled={!resumeText || isAnalyzing}
                            className={cn(
                                "w-full h-14 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all shadow-lg",
                                resumeText
                                    ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 hover:shadow-orange-900/20 hover:scale-[1.02] active:scale-[0.98]"
                                    : "bg-zinc-800 cursor-not-allowed opacity-50"
                            )}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    ANALYZING...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    ANALYZE RESUME
                                </>
                            )}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Result Dashboard */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Score Card */}
                            <div className="md:col-span-1 bg-zinc-900/50 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent opacity-50" />
                                <div className="relative z-10">
                                    <div className="w-32 h-32 rounded-full border-8 border-orange-500/20 flex items-center justify-center mb-4 relative">
                                        <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="transparent"
                                                className="text-orange-500"
                                                strokeDasharray={351}
                                                strokeDashoffset={351 - (351 * result.score) / 100}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl font-bold text-white">{result.score}</span>
                                            <span className="text-xs text-zinc-500 font-bold uppercase">Score</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        {result.score >= 80 ? "Excellent!" : result.score >= 60 ? "Good Job" : "Needs Work"}
                                    </h3>
                                    <p className="text-xs text-zinc-500 max-w-[200px] mx-auto">
                                        {result.score >= 80
                                            ? "Your resume is well-optimized for this role."
                                            : "A few tweaks could significantly improve your chances."}
                                    </p>
                                </div>
                            </div>

                            {/* Summary & ATS */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Target className="w-4 h-4" /> Executive Summary
                                    </h3>
                                    <p className="text-sm text-zinc-300 leading-relaxed">{result.summary}</p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-500" /> Key Strengths
                                        </h4>
                                        <ul className="space-y-2">
                                            {result.strengths.slice(0, 3).map((s, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                                    <CheckCircle className="w-4 h-4 text-green-500/50 flex-shrink-0 mt-0.5" />
                                                    <span>{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-500" /> Improvements
                                        </h4>
                                        <ul className="space-y-2">
                                            {result.improvements.slice(0, 3).map((s, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                                    <span>{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Keyword Analysis */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
                            <h3 className="text-lg font-bold text-white mb-6">Keyword Analysis</h3>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Missing Keywords
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.keywords.missing.length > 0 ? (
                                            result.keywords.missing.map((k, i) => (
                                                <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium">
                                                    {k}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-zinc-500 italic">No missing keywords found.</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Matched Keywords
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.keywords.found.length > 0 ? (
                                            result.keywords.found.map((k, i) => (
                                                <span key={i} className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                                                    {k}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-zinc-500 italic">No exact matches found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reset Button */}
                        <div className="text-center pt-4">
                            <button
                                onClick={handleReset}
                                className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider px-4 py-2 hover:bg-white/5 rounded-xl"
                            >
                                <RefreshCw className="w-4 h-4" /> Analyze Another
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}
        </div>
    );
}
