"use client";

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
        </div>
    );
}
