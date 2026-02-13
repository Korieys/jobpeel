"use client";

<<<<<<< HEAD
import { useState, useCallback } from "react";
import {
    Upload,
    FileText,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Zap,
    Target,
    TrendingUp,
    Award,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Sparkles,
    Link2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CategoryResult {
    name: string;
    score: number;
    summary: string;
    suggestions: string[];
}

interface AnalysisResult {
    overallScore: number;
    categories: CategoryResult[];
    topImprovements: string[];
    keywordAnalysis: {
        matchPercentage: number | null;
        matchedKeywords: string[];
        missingKeywords: string[];
    };
    strengthHighlights: string[];
}

export default function ResumeOptimizerPage() {
    const { user } = useAuth();

    // Upload state
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [resumeText, setResumeText] = useState<string | null>(null);

    // Job context (optional)
    const [jobUrl, setJobUrl] = useState("");
    const [jobDescription, setJobDescription] = useState<string | null>(null);
    const [isScanningJob, setIsScanningJob] = useState(false);

    // Analysis state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- File Upload Logic ---
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
        else if (e.type === "dragleave") setIsDragging(false);
    }, []);

    const processFile = async (file: File) => {
        setError(null);
        setResult(null);
        if (file.type !== "application/pdf") {
            setError("Please upload a PDF file.");
            return;
        }

        setIsUploading(true);
        setUploadedFileName(file.name);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/analyze-resume", {
                method: "POST",
                body: formData,
            });
            if (!response.ok) throw new Error("Failed to parse resume");
            const data = await response.json();
            if (data.text) {
                setResumeText(data.text);
                toast.success("Resume parsed successfully");
            } else {
                throw new Error("No text found in resume");
            }
        } catch (err: any) {
            setError("Failed to process resume. Please try again.");
            setUploadedFileName(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) processFile(e.target.files[0]);
    };

    // --- Job Scan Logic ---
    const handleScanJob = async () => {
        if (!jobUrl.trim()) return;
        setIsScanningJob(true);
        try {
            const res = await fetch("/api/scan-job", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: jobUrl }),
            });
            if (!res.ok) throw new Error("Failed to scan job");
            const data = await res.json();
            setJobDescription(data.description || null);
            toast.success("Job posting analyzed", { description: `${data.title || "Job"} at ${data.company || "Company"}` });
        } catch {
            toast.error("Failed to scan job URL");
        } finally {
            setIsScanningJob(false);
        }
    };

    // --- Analysis Logic ---
    const handleAnalyze = async () => {
        if (!resumeText) return;
        setIsAnalyzing(true);
        setResult(null);
        setAnalysisStep(1);
        setExpandedCategory(null);

        const timeouts: NodeJS.Timeout[] = [];
        timeouts.push(setTimeout(() => setAnalysisStep(2), 2000));
        timeouts.push(setTimeout(() => setAnalysisStep(3), 5000));
        timeouts.push(setTimeout(() => setAnalysisStep(4), 8000));

        try {
            const res = await fetch("/api/optimize-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText, jobDescription }),
            });
            if (!res.ok) throw new Error("Analysis failed");
            const data: AnalysisResult = await res.json();
            setResult(data);
            toast.success("Analysis Complete!", { description: `Your ATS score: ${data.overallScore}/100` });
        } catch {
            toast.error("Analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
            setAnalysisStep(0);
            timeouts.forEach(clearTimeout);
        }
    };

    const handleReset = () => {
        setResumeText(null);
        setUploadedFileName(null);
        setResult(null);
        setJobUrl("");
        setJobDescription(null);
        setError(null);
        setExpandedCategory(null);
    };

    const ANALYSIS_STEPS = [
        "Initializing...",
        "Parsing resume structure...",
        "Evaluating ATS compatibility...",
        "Scoring categories...",
        "Generating recommendations...",
    ];

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 60) return "text-yellow-500";
        if (score >= 40) return "text-orange-500";
        return "text-red-500";
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return "from-green-500";
        if (score >= 60) return "from-yellow-500";
        if (score >= 40) return "from-orange-500";
        return "from-red-500";
    };

    const getScoreRingColor = (score: number) => {
        if (score >= 80) return "stroke-green-500";
        if (score >= 60) return "stroke-yellow-500";
        if (score >= 40) return "stroke-orange-500";
        return "stroke-red-500";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "Excellent";
        if (score >= 80) return "Strong";
        if (score >= 70) return "Good";
        if (score >= 60) return "Fair";
        if (score >= 40) return "Needs Work";
        return "Critical";
    };

    const categoryIcons: Record<string, typeof Target> = {
        "Contact & Header": FileText,
        "Professional Summary": Award,
        "Experience & Impact": TrendingUp,
        "Skills & Keywords": Target,
        "Education & Credentials": Award,
        "Formatting & Readability": Zap,
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Resume Optimizer</h1>
                    <p className="text-zinc-400">
                        AI-powered ATS analysis and improvement suggestions.
                    </p>
                </div>
                {result && (
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 border border-white/5 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" /> New Analysis
                    </button>
                )}
            </header>

            <AnimatePresence mode="wait">
                {/* === STATE 1: Upload + Analyze === */}
                {!result && !isAnalyzing && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid lg:grid-cols-2 gap-6"
                    >
                        {/* Upload Card */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    resumeText
                                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                        : "bg-zinc-800 text-zinc-500 border border-white/5"
                                )}>
                                    {resumeText ? <CheckCircle className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h2 className="font-bold text-white">Upload Resume</h2>
                                    <p className="text-xs text-zinc-500">{resumeText ? "Ready for analysis" : "PDF format"}</p>
                                </div>
                            </div>

                            <div
                                className={cn(
                                    "relative border border-dashed rounded-xl p-10 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer group",
                                    isDragging ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-black/20 hover:bg-black/40 hover:border-white/20",
                                    uploadedFileName ? "border-green-500/50 bg-green-500/5" : ""
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById("optimizer-upload")?.click()}
                            >
                                <input type="file" id="optimizer-upload" className="hidden" accept=".pdf" onChange={handleChange} />

                                {isUploading ? (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
                                        <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest animate-pulse">Extracting text...</p>
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
                        </div>

                        {/* Job Context Card (Optional) */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    jobDescription
                                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                        : "bg-zinc-800 text-zinc-500 border border-white/5"
                                )}>
                                    {jobDescription ? <CheckCircle className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h2 className="font-bold text-white">Target Job <span className="text-xs text-zinc-600 font-normal ml-1">(optional)</span></h2>
                                    <p className="text-xs text-zinc-500">{jobDescription ? "Analyzing keyword match" : "Compare against a specific job"}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    <input
                                        type="url"
                                        placeholder="Paste job posting URL..."
                                        value={jobUrl}
                                        onChange={(e) => setJobUrl(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                        disabled={!!jobDescription}
                                    />
                                </div>
                                {!jobDescription ? (
                                    <button
                                        onClick={handleScanJob}
                                        disabled={!jobUrl.trim() || isScanningJob}
                                        className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-white/5"
                                    >
                                        {isScanningJob ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                        Scan
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { setJobDescription(null); setJobUrl(""); }}
                                        className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-white/5"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Clear
                                    </button>
                                )}
                            </div>

                            {jobDescription && (
                                <div className="flex-1 p-3 bg-green-500/5 border border-green-500/20 rounded-xl text-xs text-zinc-400 overflow-y-auto max-h-32 custom-scrollbar">
                                    <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-2">Job Context Loaded</p>
                                    <p className="line-clamp-4">{jobDescription}</p>
                                </div>
                            )}

                            <div className="flex-1" />

                            {/* Big Analyze Button */}
                            <button
                                onClick={handleAnalyze}
                                disabled={!resumeText || isAnalyzing}
                                className={cn(
                                    "w-full h-14 rounded-xl font-bold text-base text-white shadow-xl flex items-center justify-center gap-3 transition-all duration-300 mt-6 border border-white/10",
                                    resumeText
                                        ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 hover:shadow-orange-900/20 hover:scale-[1.02] active:scale-[0.98]"
                                        : "bg-zinc-800 cursor-not-allowed opacity-50"
                                )}
                            >
                                <Sparkles className="w-5 h-5" />
                                ANALYZE RESUME
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* === STATE 2: Analyzing === */}
                {isAnalyzing && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="w-full max-w-md">
                            <div className="w-20 h-20 mx-auto mb-8 relative">
                                <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
                                <div className="relative w-full h-full bg-zinc-900 rounded-full border border-white/10 flex items-center justify-center">
                                    <Zap className="w-8 h-8 text-orange-500 animate-pulse" />
                                </div>
                            </div>

                            <div className="flex justify-between text-xs font-mono text-orange-500 mb-4 tracking-wider">
                                <span>STEP {analysisStep}/4</span>
                                <span className="animate-pulse uppercase">{ANALYSIS_STEPS[analysisStep] || "Processing..."}</span>
                            </div>
                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${Math.min((analysisStep / 4) * 100, 100)}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>

                            <div className="mt-6 space-y-1.5 opacity-60">
                                {analysisStep >= 1 && <p className="text-xs font-mono text-zinc-400">&gt; Parsing document structure...</p>}
                                {analysisStep >= 2 && <p className="text-xs font-mono text-zinc-400">&gt; Running ATS compatibility checks...</p>}
                                {analysisStep >= 3 && <p className="text-xs font-mono text-orange-500">&gt; Scoring and generating feedback...</p>}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* === STATE 3: Results === */}
                {result && !isAnalyzing && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Score Hero */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                {/* Score Ring */}
                                <div className="relative w-40 h-40 flex-shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="52" fill="none" className="stroke-zinc-800" strokeWidth="8" />
                                        <motion.circle
                                            cx="60" cy="60" r="52" fill="none"
                                            className={getScoreRingColor(result.overallScore)}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 52}`}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - result.overallScore / 100) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <motion.span
                                            className={cn("text-4xl font-bold", getScoreColor(result.overallScore))}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5, duration: 0.5 }}
                                        >
                                            {result.overallScore}
                                        </motion.span>
                                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">/ 100</span>
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        ATS Score: <span className={getScoreColor(result.overallScore)}>{getScoreLabel(result.overallScore)}</span>
                                    </h2>
                                    <p className="text-zinc-400 text-sm mb-4">
                                        {result.overallScore >= 80
                                            ? "Your resume is well-optimized for applicant tracking systems."
                                            : result.overallScore >= 60
                                                ? "Your resume has a solid foundation but could use some improvements."
                                                : "Your resume needs significant improvements to pass ATS filters."
                                        }
                                    </p>

                                    {/* Strength badges */}
                                    {result.strengthHighlights?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {result.strengthHighlights.map((s, i) => (
                                                <span key={i} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 rounded-lg border border-green-500/20">
                                                    ✓ {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Keyword Analysis (if job provided) */}
                        {result.keywordAnalysis?.matchPercentage !== null && result.keywordAnalysis?.matchPercentage !== undefined && (
                            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                                    <Target className="w-4 h-4 text-orange-500" />
                                    Keyword Match vs. Target Job
                                </h3>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-2 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className={cn(
                                                "h-full rounded-full bg-gradient-to-r",
                                                result.keywordAnalysis.matchPercentage >= 70 ? "from-green-500 to-emerald-500" :
                                                    result.keywordAnalysis.matchPercentage >= 40 ? "from-yellow-500 to-orange-500" :
                                                        "from-red-500 to-orange-500"
                                            )}
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${result.keywordAnalysis.matchPercentage}%` }}
                                            transition={{ duration: 1, delay: 0.3 }}
                                        />
                                    </div>
                                    <span className={cn("text-lg font-bold", getScoreColor(result.keywordAnalysis.matchPercentage))}>
                                        {result.keywordAnalysis.matchPercentage}%
                                    </span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {result.keywordAnalysis.matchedKeywords?.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-2">Matched Keywords</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {result.keywordAnalysis.matchedKeywords.map((kw, i) => (
                                                    <span key={i} className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded border border-green-500/20">{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {result.keywordAnalysis.missingKeywords?.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2">Missing Keywords</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {result.keywordAnalysis.missingKeywords.map((kw, i) => (
                                                    <span key={i} className="px-2 py-0.5 text-xs bg-red-500/10 text-red-400 rounded border border-red-500/20">{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Category Breakdown */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {result.categories.map((cat, i) => {
                                const Icon = categoryIcons[cat.name] || Zap;
                                const isExpanded = expandedCategory === i;

                                return (
                                    <motion.div
                                        key={cat.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={cn(
                                            "bg-zinc-900/50 border rounded-2xl p-5 backdrop-blur-sm cursor-pointer transition-all hover:border-white/10",
                                            isExpanded ? "border-orange-500/30 ring-1 ring-orange-500/10" : "border-white/5"
                                        )}
                                        onClick={() => setExpandedCategory(isExpanded ? null : i)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-9 h-9 rounded-lg flex items-center justify-center border",
                                                    cat.score >= 80 ? "bg-green-500/10 border-green-500/20 text-green-500" :
                                                        cat.score >= 60 ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                                                            cat.score >= 40 ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                                                                "bg-red-500/10 border-red-500/20 text-red-500"
                                                )}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{cat.name}</p>
                                                </div>
                                            </div>
                                            <span className={cn("text-xl font-bold", getScoreColor(cat.score))}>{cat.score}</span>
                                        </div>

                                        {/* Score bar */}
                                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                                            <motion.div
                                                className={cn("h-full rounded-full bg-gradient-to-r to-transparent", getScoreBgColor(cat.score))}
                                                initial={{ width: "0%" }}
                                                animate={{ width: `${cat.score}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                            />
                                        </div>

                                        <p className="text-xs text-zinc-400 leading-relaxed">{cat.summary}</p>

                                        {/* Expanded suggestions */}
                                        <AnimatePresence>
                                            {isExpanded && cat.suggestions?.length > 0 && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">Suggestions</p>
                                                        {cat.suggestions.map((s, j) => (
                                                            <div key={j} className="flex items-start gap-2 text-xs text-zinc-300 bg-black/20 p-2.5 rounded-lg border border-white/5">
                                                                <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                                                <span>{s}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="flex justify-center mt-2">
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Top Improvements */}
                        {result.topImprovements?.length > 0 && (
                            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-4 h-4 text-orange-500" />
                                    Top Improvements (by impact)
                                </h3>
                                <div className="space-y-3">
                                    {result.topImprovements.map((imp, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start gap-4 p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-orange-500">{i + 1}</span>
                                            </div>
                                            <p className="text-sm text-zinc-300 leading-relaxed">{imp}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-950/20 p-4 rounded-xl text-sm font-bold border border-red-500/20">
                    <AlertCircle className="w-4 h-4" />
                    <p>{error}</p>
                </div>
            )}
=======
import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, RefreshCw, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import ComingSoonOverlay from "@/components/ui/ComingSoonOverlay";

export default function ResumeOptimizerPage() {
    const [status, setStatus] = useState<"idle" | "scanning" | "complete">("idle");
    const [score, setScore] = useState(0);

    const startScan = () => {
        setStatus("scanning");
        setScore(0);
        setTimeout(() => {
            setStatus("complete");
            // Animate score
            let s = 0;
            const interval = setInterval(() => {
                s += 2;
                if (s >= 88) {
                    clearInterval(interval);
                    setScore(88);
                } else {
                    setScore(s);
                }
            }, 20);
        }, 2500);
    };

    return (
        <div className="space-y-8 relative">
            <ComingSoonOverlay
                title="Resume Optimizer"
                description="Our AI-powered optimization engine is almost ready. Get instant feedback on your resume tailored to specific job descriptions."
            />
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Resume Optimizer</h1>
                <p className="text-zinc-400">AI-driven ATS analysis and keyword optimization.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Upload/Control */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Target Resume</h3>
                                <p className="text-xs text-zinc-500">Last updated: 2m ago</p>
                            </div>
                        </div>

                        <div className="border border-dashed border-white/10 bg-black/20 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                            <p className="text-zinc-400 font-medium text-sm mb-2">Software_Engineer_CV.pdf</p>
                            <button className="text-xs text-orange-500 font-bold uppercase tracking-wider hover:text-orange-400">
                                Replace File
                            </button>
                        </div>

                        <button
                            onClick={startScan}
                            disabled={status === "scanning"}
                            className="w-full mt-6 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === "scanning" ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                "Run Analysis"
                            )}
                        </button>
                    </div>
                </div>

                {/* Right: Results Dashboard */}
                <div className="lg:col-span-2">
                    {status === "idle" && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-zinc-900/30 border border-white/5 rounded-3xl p-8 text-center">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-6 h-6 text-zinc-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Optimize</h3>
                            <p className="text-zinc-500 max-w-sm">
                                Click "Run Analysis" to let our AI scan your resume against standard ATS algorithms.
                            </p>
                        </div>
                    )}

                    {status === "scanning" && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-zinc-900/30 border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-orange-500/5 animate-pulse" />
                            <RefreshCw className="w-12 h-12 text-orange-500 animate-spin mb-6" />
                            <h3 className="text-xl font-bold text-white mb-2">Analyzing Structure...</h3>
                            <p className="text-zinc-500">Checking keyword density and formatting...</p>
                        </div>
                    )}

                    {status === "complete" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Score Cards */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <CheckCircle className="w-12 h-12 text-green-500" />
                                    </div>
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">ATS Score</p>
                                    <div className="text-4xl font-bold text-white flex items-baseline gap-1">
                                        {score}<span className="text-lg text-zinc-600">/100</span>
                                    </div>
                                    <div className="mt-4 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score}%` }}
                                            transition={{ duration: 1 }}
                                            className="h-full bg-green-500"
                                        />
                                    </div>
                                </div>

                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Keywords</p>
                                    <p className="text-2xl font-bold text-white">12/15</p>
                                    <p className="text-xs text-green-500 mt-1 font-medium">+2 from last scan</p>
                                </div>

                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Formatting</p>
                                    <p className="text-2xl font-bold text-white">Pass</p>
                                    <p className="text-xs text-zinc-500 mt-1">PDF readable</p>
                                </div>
                            </div>

                            {/* Suggestions List */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                    Critical Improvements
                                    <span className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full border border-red-500/20">3 Found</span>
                                </h3>

                                <div className="space-y-4">
                                    {[
                                        { title: "Missing 'Project Management' keyword", type: "Keyword", impact: "High" },
                                        { title: "Summary is too long (400+ words)", type: "Structure", impact: "Medium" },
                                        { title: "Date format inconsistency", type: "Formatting", impact: "Low" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                                    <AlertTriangle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-200">{item.title}</p>
                                                    <p className="text-xs text-zinc-500">{item.type} • {item.impact} Impact</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-600 group-hover:text-orange-500 transition-colors text-sm font-medium">
                                                Fix <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
        </div>
    );
}
