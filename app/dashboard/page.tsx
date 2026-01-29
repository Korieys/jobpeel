"use client";

import { useState, useRef, useEffect } from "react";
import { ResumeUploader } from "@/components/ResumeUploader";
import { JobScanner } from "@/components/JobScanner";
import { FileText, Briefcase, ChevronRight, Wand2, Download, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import jsPDF from "jspdf";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
    const { user, userProfile } = useAuth();
    const [resumeText, setResumeText] = useState<string | null>(null);
    const [jobData, setJobData] = useState<any>(null);
    const [coverLetter, setCoverLetter] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [tone, setTone] = useState<"professional" | "bold" | "casual">("professional");

    // Safety Refs
    const abortControllerRef = useRef<AbortController | null>(null);

    // Prevent accidental tab closure
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isGenerating) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isGenerating]);

    // Abort on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Scroll to top on mount to parse loading bug
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setCoverLetter("");
        setLoadingStep(1); // Start "Thinking"

        abortControllerRef.current = new AbortController();

        // Simulate progress for UX (since the API stream is single-shot)
        const timeouts: NodeJS.Timeout[] = [];
        timeouts.push(setTimeout(() => setLoadingStep(2), 2500)); // Analyzing
        timeouts.push(setTimeout(() => setLoadingStep(3), 5000)); // Drafting
        timeouts.push(setTimeout(() => setLoadingStep(4), 8000)); // Polishing

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText, jobData, tone, userProfile }),
                signal: abortControllerRef.current.signal
            });

            if (!res.ok) throw new Error("Generation failed");

            const data = await res.json();
            setCoverLetter(data.coverLetter);
            toast.success("Cover Letter Generated!");

            // Track Application Generation
            if (user && userProfile && jobData) {
                const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");

                const userDomain = userProfile.email?.split('@')[1] || "";

                await addDoc(collection(db, "applications"), {
                    userId: user.uid,
                    userEmail: userProfile.email,
                    userDomain: userDomain.toLowerCase(),
                    jobTitle: jobData.title,
                    jobCompany: jobData.company,
                    createdAt: serverTimestamp()
                });
            }
        } catch (e: any) {
            if (e.name === 'AbortError') {
                toast.info("Generation cancelled");
            } else {
                console.error(e);
                toast.error("Failed to generate. Please try again.");
            }
        } finally {
            setIsGenerating(false);
            setLoadingStep(0);
            abortControllerRef.current = null;
            timeouts.forEach(clearTimeout);
        }
    };

    const handleDownload = () => {
        if (!coverLetter) return;
        const doc = new jsPDF();

        doc.setFont("times", "normal");
        doc.setFontSize(12);

        // Better line wrapping for PDF
        const splitText = doc.splitTextToSize(coverLetter, 180);
        doc.text(splitText, 15, 20);

        const fileName = jobData?.title
            ? `${jobData.title.replace(/[^a-z0-9 ]/gi, '').trim()} - Cover Letter.pdf`
            : "JobPeel-Cover-Letter.pdf";

        doc.save(fileName);
    };

    const LOADING_STEPS = [
        "Initializing...",
        "Analyzing Resume & Job Specs...",
        "Drafting Contextual Content...",
        "Polishing Tone & Formatting...",
        "Finalizing..."
    ];

    return (
        <div className="h-full">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Application Generator</h1>
                    <p className="text-zinc-400">Create tailored cover letters and application assets in seconds.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                        <div className={`w-2 h-2 rounded-full ${isGenerating ? "bg-orange-500 animate-pulse" : "bg-green-500"}`} />
                        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                            System: {isGenerating ? "Processing" : "Ready"}
                        </span>
                    </div>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Input Pipeline */}
                <div className="lg:col-span-5 flex flex-col gap-6">

                    {/* Step 1: Resume */}
                    <motion.section
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group relative"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-2xl opacity-50 blur-sm group-hover:opacity-75 transition duration-500" />
                        <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-500",
                                    resumeText
                                        ? "bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)]"
                                        : "bg-zinc-800 text-zinc-500 border border-white/5"
                                )}>
                                    {resumeText ? <CheckCircle className="w-5 h-5" /> : "1"}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white tracking-tight">Resume Source</h2>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{resumeText ? "Analysis complete" : "Upload your PDF resume"}</p>
                                </div>
                            </div>
                            <ResumeUploader onResumeParsed={setResumeText} />
                        </div>
                    </motion.section>

                    {/* Step 2: Job Context */}
                    <motion.section
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="group relative"
                    >
                        <div className={cn(
                            "relative bg-zinc-900/80 backdrop-blur-xl border p-6 rounded-2xl shadow-xl transition-all duration-300",
                            resumeText && !jobData
                                ? "border-orange-500/30 bg-zinc-900/90 shadow-[0_0_20px_-5px_rgba(249,115,22,0.15)]"
                                : "border-white/5",
                            !resumeText && "opacity-50 grayscale pointer-events-none"
                        )}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-500",
                                    jobData
                                        ? "bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)]"
                                        : resumeText ? "bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse" : "bg-zinc-800 text-zinc-500"
                                )}>
                                    {jobData ? <Briefcase className="w-5 h-5" /> : "2"}
                                </div>
                                <div>
                                    <h2 className={cn("text-lg font-bold tracking-tight transition-colors", resumeText && !jobData ? "text-orange-400" : "text-white")}>
                                        Job Target
                                    </h2>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{jobData ? "Target Locked" : "Paste URL or Scan"}</p>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {jobData ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="relative overflow-hidden"
                                    >
                                        <div className="p-4 bg-zinc-950/50 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                                            <h3 className="font-bold text-base text-white mb-1 line-clamp-1">{jobData.title}</h3>
                                            <p className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-3">{jobData.company}</p>
                                            <div className="text-xs text-zinc-400 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5 line-clamp-3 font-mono">
                                                {jobData.description}
                                            </div>
                                            <button
                                                onClick={() => setJobData(null)}
                                                className="w-full mt-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                Change Target
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <JobScanner onJobFound={setJobData} />
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.section>

                    {/* Step 3: Action */}
                    <motion.section
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn(
                            "relative bg-zinc-900/80 backdrop-blur-xl border p-6 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden",
                            resumeText && jobData
                                ? "border-orange-500/30"
                                : "border-white/5 opacity-50 grayscale pointer-events-none"
                        )}
                    >
                        {/* Step Indicator added for consistency */}
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-500",
                                resumeText && jobData ? "bg-white text-zinc-950 shadow-lg" : "bg-zinc-800 text-zinc-500"
                            )}>
                                3
                            </div>
                            <div>
                                <h2 className={cn("text-lg font-bold tracking-tight transition-colors text-white")}>
                                    Initialize
                                </h2>
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Select tone & generate</p>
                            </div>
                        </div>

                        {/* Tone Selector */}
                        <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-zinc-950/50 rounded-xl border border-white/5">
                            {(["professional", "bold", "casual"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTone(t)}
                                    className={cn(
                                        "py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all relative overflow-hidden",
                                        tone === t
                                            ? "text-zinc-950 shadow-lg"
                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                    )}
                                >
                                    {tone === t && (
                                        <motion.div
                                            layoutId="activeTone"
                                            className="absolute inset-0 bg-white rounded-lg -z-10"
                                        />
                                    )}
                                    {t}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={cn(
                                "w-full h-14 rounded-xl font-bold text-base text-white shadow-xl flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group border border-white/10",
                                isGenerating
                                    ? "bg-zinc-800 cursor-wait"
                                    : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 hover:shadow-orange-900/20 hover:scale-[1.02] active:scale-[0.98]"
                            )}
                        >
                            {isGenerating ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="font-mono text-sm">PROCESSING...</span>
                                </div>
                            ) : (
                                <>
                                    <span>GENERATE APPLICATION</span>
                                    <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                </>
                            )}
                        </button>

                        {(!resumeText || !jobData) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/20 backdrop-blur-[2px] z-20">
                                <div className="bg-zinc-900 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 shadow-xl">
                                    <Briefcase className="w-3 h-3 text-orange-500" />
                                    <span>Locked</span>
                                </div>
                            </div>
                        )}
                    </motion.section>
                </div>

                {/* Right Column: Premium Editor/Output */}
                <div className="lg:col-span-7 h-[calc(100vh-8rem)] sticky top-24">
                    <div className="h-full bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-3xl p-1.5 shadow-2xl flex flex-col relative overflow-hidden group ring-1 ring-white/5">

                        {/* Status Bar / Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-zinc-950/30 rounded-t-[1.3rem]">
                            <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-mono font-medium text-zinc-400">OUTPUT_PREVIEW.pdf</span>
                            </div>
                            {coverLetter && (
                                <motion.button
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={handleDownload}
                                    className="px-4 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 hover:text-orange-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 border border-orange-500/20"
                                >
                                    <Download className="w-3 h-3" /> Download
                                </motion.button>
                            )}
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 relative bg-zinc-950/80 rounded-b-[1.3rem] overflow-hidden">
                            <AnimatePresence mode="wait">
                                {isGenerating ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center p-8 z-20"
                                    >
                                        <div className="w-full max-w-sm">
                                            <div className="flex justify-between text-xs font-mono text-orange-500 mb-4 tracking-wider">
                                                <span>STEP {loadingStep}/4</span>
                                                <span className="animate-pulse uppercase">{LOADING_STEPS[loadingStep] || "Processing..."}</span>
                                            </div>
                                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-orange-500"
                                                    initial={{ width: "0%" }}
                                                    animate={{ width: `${Math.min((loadingStep / 4) * 100, 100)}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                            <div className="mt-8 space-y-2 opacity-50">
                                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 0.8, x: 0 }} className="text-xs font-mono text-zinc-400">&gt; Initializing context...</motion.div>
                                                {loadingStep > 1 && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 0.8, x: 0 }} className="text-xs font-mono text-zinc-400">&gt; Analyzing requirements...</motion.div>}
                                                {loadingStep > 2 && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-mono text-orange-500">&gt; Generating content...</motion.div>}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : !coverLetter ? (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 pointer-events-none p-12"
                                    >
                                        <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 shadow-xl rotate-3">
                                            <FileText className="w-10 h-10 text-zinc-800" />
                                        </div>
                                        <p className="text-lg font-bold text-zinc-600 tracking-tight">Ready to Craft</p>
                                        <p className="text-sm text-zinc-800 font-mono mt-2">Awaiting inputs...</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="editor"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-full h-full"
                                    >
                                        <textarea
                                            className="w-full h-full p-8 md:p-12 bg-transparent resize-none outline-none text-[12pt] leading-relaxed custom-scrollbar text-zinc-300 selection:bg-orange-500/30 selection:text-white placeholder:text-zinc-800 font-serif border-none focus:ring-0"
                                            style={{ fontFamily: '"Times New Roman", Times, serif' }}
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                            spellCheck={false}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
