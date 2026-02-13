"use client";

<<<<<<< HEAD
import { useState, useRef, useEffect } from "react";
import {
    Send,
    Loader2,
    Sparkles,
    Briefcase,
    Users,
    Code,
    MessageCircle,
    RotateCcw,
    Link2,
    Zap,
    ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const INTERVIEW_TYPES = [
    { id: "behavioral", label: "Behavioral", icon: Users, description: "STAR-method questions on leadership, teamwork, conflict" },
    { id: "technical", label: "Technical", icon: Code, description: "Conceptual and problem-solving questions for your role" },
    { id: "situational", label: "Situational", icon: Briefcase, description: "Hypothetical workplace scenarios" },
    { id: "general", label: "General", icon: MessageCircle, description: "Common interview questions and career discussion" },
];

export default function InterviewPrepPage() {
    const { user } = useAuth();

    // Setup state
    const [interviewType, setInterviewType] = useState("behavioral");
    const [jobTitle, setJobTitle] = useState("");
    const [jobUrl, setJobUrl] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [isScanningJob, setIsScanningJob] = useState(false);
    const [started, setStarted] = useState(false);

    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Scan job URL
    const handleScanJob = async () => {
        if (!jobUrl.trim()) return;
        setIsScanningJob(true);
        try {
            const res = await fetch("/api/scan-job", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: jobUrl }),
            });
            if (!res.ok) throw new Error("Failed to scan");
            const data = await res.json();
            if (data.title) setJobTitle(data.title);
            if (data.description) setJobDescription(data.description);
            toast.success("Job info loaded", { description: `${data.title || "Job"} at ${data.company || ""}` });
        } catch {
            toast.error("Failed to scan job URL");
        } finally {
            setIsScanningJob(false);
        }
    };

    // Start interview
    const handleStart = async () => {
        setStarted(true);
        setIsLoading(true);
        try {
            const res = await fetch("/api/interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [],
                    jobTitle,
                    jobDescription,
                    interviewType,
                }),
            });
            if (!res.ok) throw new Error("Failed to start");
            const data = await res.json();
            setMessages([{ role: "assistant", content: data.reply }]);
        } catch {
            toast.error("Failed to start interview");
            setStarted(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Send answer
    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: Message = { role: "user", content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
                    jobTitle,
                    jobDescription,
                    interviewType,
                }),
            });
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        } catch {
            toast.error("Failed to get response");
        } finally {
            setIsLoading(false);
        }
    };

    // Reset
    const handleReset = () => {
        setStarted(false);
        setMessages([]);
        setInput("");
        setJobTitle("");
        setJobUrl("");
        setJobDescription("");
    };

    // Count questions asked (assistant messages)
    const questionCount = messages.filter((m) => m.role === "assistant").length;

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Interview Prep</h1>
                    <p className="text-zinc-400">Practice with an AI interviewer. Get feedback on every answer.</p>
                </div>
                {started && (
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 border border-white/5 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> New Session
                    </button>
                )}
            </header>

            <AnimatePresence mode="wait">
                {/* === Setup Screen === */}
                {!started && (
                    <motion.div
                        key="setup"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full"
                    >
                        <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <Sparkles className="w-8 h-8 text-orange-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">Start a Mock Interview</h2>
                        <p className="text-sm text-zinc-500 mb-8">Choose your interview type and optionally add a target job</p>

                        {/* Interview Type Selector */}
                        <div className="grid grid-cols-2 gap-3 w-full mb-6">
                            {INTERVIEW_TYPES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setInterviewType(t.id)}
                                    className={cn(
                                        "p-4 rounded-2xl text-left transition-all border",
                                        interviewType === t.id
                                            ? "bg-orange-500/10 border-orange-500/30 ring-1 ring-orange-500/10"
                                            : "bg-zinc-900/50 border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        <t.icon className={cn("w-4 h-4", interviewType === t.id ? "text-orange-500" : "text-zinc-500")} />
                                        <span className={cn("font-bold text-sm", interviewType === t.id ? "text-orange-500" : "text-white")}>{t.label}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 pl-7">{t.description}</p>
                                </button>
                            ))}
                        </div>

                        {/* Job Context (Optional) */}
                        <div className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-5 mb-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Target Role <span className="text-zinc-700">(optional)</span></p>

                            <input
                                type="text"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="e.g. Frontend Developer, Product Manager..."
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50 mb-3"
                            />

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    <input
                                        type="url"
                                        value={jobUrl}
                                        onChange={(e) => setJobUrl(e.target.value)}
                                        placeholder="Or paste a job URL to auto-fill..."
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                    />
                                </div>
                                <button
                                    onClick={handleScanJob}
                                    disabled={!jobUrl.trim() || isScanningJob}
                                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 border border-white/5"
                                >
                                    {isScanningJob ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                    Scan
                                </button>
                            </div>

                            {jobDescription && (
                                <p className="mt-3 text-xs text-green-400 bg-green-500/5 border border-green-500/20 rounded-lg p-2.5 line-clamp-2">
                                    ✓ Job description loaded
                                </p>
                            )}
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={handleStart}
                            className="w-full h-14 rounded-xl font-bold text-base text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-xl hover:shadow-orange-900/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/10"
                        >
                            <Sparkles className="w-5 h-5" />
                            START INTERVIEW
                        </button>
                    </motion.div>
                )}

                {/* === Chat Screen === */}
                {started && (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col min-h-0"
                    >
                        {/* Info bar */}
                        <div className="flex items-center gap-4 px-4 py-2.5 bg-zinc-900/50 rounded-xl border border-white/5 mb-4 flex-shrink-0">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                {INTERVIEW_TYPES.find((t) => t.id === interviewType)?.label} Interview
                            </span>
                            {jobTitle && (
                                <>
                                    <span className="text-zinc-700">•</span>
                                    <span className="text-xs text-zinc-400">{jobTitle}</span>
                                </>
                            )}
                            <span className="ml-auto text-xs text-zinc-600">
                                Q{questionCount}
                            </span>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar min-h-0">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex",
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 text-sm leading-relaxed",
                                            msg.role === "user"
                                                ? "bg-orange-600 text-white rounded-br-md"
                                                : "bg-zinc-900/70 text-zinc-200 border border-white/5 rounded-bl-md"
                                        )}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-5 h-5 bg-orange-500/10 rounded-md flex items-center justify-center">
                                                    <Sparkles className="w-3 h-3 text-orange-500" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Interviewer</span>
                                            </div>
                                        )}
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-zinc-900/70 border border-white/5 rounded-2xl rounded-bl-md px-5 py-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 bg-orange-500/10 rounded-md flex items-center justify-center">
                                                <Sparkles className="w-3 h-3 text-orange-500" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Interviewer</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="mt-4 flex-shrink-0">
                            <div className="flex gap-3">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                                    rows={3}
                                    className="flex-1 bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all self-end border border-white/10",
                                        input.trim() && !isLoading
                                            ? "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20"
                                            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                    )}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[10px] text-zinc-700 text-center mt-2">
                                AI-powered mock interview • Responses are for practice only
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
=======
import { useState } from "react";
import { Mic, Video, PhoneOff, MessageSquare, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

import ComingSoonOverlay from "@/components/ui/ComingSoonOverlay";

export default function InterviewPrepPage() {
    const [isActive, setIsActive] = useState(false);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col relative">
            <ComingSoonOverlay
                title="Interview Prep"
                description="Practice your interviews with our AI coach. Real-time feedback on your speech, body language, and answers coming soon."
            />
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Mock Interview</h1>
                    <p className="text-zinc-400">Behavioral round simulation.</p>
                </div>
                {!isActive ? (
                    <button
                        onClick={() => setIsActive(true)}
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-900/20 transition-all"
                    >
                        <Play className="w-4 h-4" /> Start Session
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 animate-pulse">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-xs font-bold uppercase tracking-widest">Live Recording</span>
                    </div>
                )}
            </header>

            <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
                {/* Main Video Area */}
                <div className="lg:col-span-2 bg-black rounded-3xl border border-zinc-800 relative overflow-hidden shadow-2xl flex flex-col">
                    {/* Simulated AI Avatar Feed */}
                    <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
                        {!isActive ? (
                            <div className="text-center p-8">
                                <div className="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-6 flex items-center justify-center border border-white/10">
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full animate-pulse" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Sarah (AI Coach)</h3>
                                <p className="text-zinc-500">Ready to start your behavioral interview.</p>
                            </div>
                        ) : (
                            // Mocking a live video feed look
                            <div className="absolute inset-0 bg-zinc-900">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-full border-4 border-orange-500/50 relative">
                                        <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
                                        <img src="/logos/jobpeel-logo-square.png" className="w-full h-full rounded-full object-cover opacity-80" alt="AI Avatar" />
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-6 z-20">
                                    <p className="font-bold text-white">Sarah (AI Recruiter)</p>
                                    <p className="text-xs text-zinc-400">Speaking...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls Bar */}
                    <div className="h-20 bg-zinc-950/80 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-8">
                        <div className="flex items-center gap-4">
                            <button className="p-3 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 transition-colors">
                                <Mic className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 transition-colors">
                                <Video className="w-5 h-5" />
                            </button>
                        </div>

                        <button
                            onClick={() => setIsActive(false)}
                            className="p-3 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors shadow-lg"
                        >
                            <PhoneOff className="w-6 h-6" />
                        </button>
                    </div>

                    {/* User Picture-in-Picture */}
                    {isActive && (
                        <div className="absolute top-6 right-6 w-48 h-32 bg-zinc-800 rounded-xl border border-white/20 shadow-2xl overflow-hidden z-30">
                            <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                                <p className="text-xs text-zinc-400 font-medium">Your Camera</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Transcription & Feedback */}
                <div className="lg:col-span-1 bg-zinc-900/50 border border-white/5 rounded-3xl p-6 flex flex-col">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-orange-500" />
                        Live Transcript
                    </h3>

                    <div className="flex-1 bg-black/20 rounded-xl border border-white/5 p-4 overflow-y-auto space-y-4 font-mono text-sm">
                        {isActive ? (
                            <>
                                <div className="flex gap-3">
                                    <span className="text-orange-500 font-bold text-xs mt-1">AI</span>
                                    <p className="text-zinc-300">Tell me about a time you had to deal with a conflict in your team.</p>
                                </div>
                                <div className="flex gap-3 opacity-50">
                                    <span className="text-green-500 font-bold text-xs mt-1">YOU</span>
                                    <p className="text-zinc-400">Listening...</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-zinc-600 text-center mt-10 italic">Start the session to see real-time transcription and feedback.</p>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Real-time Feedback</h4>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs border border-green-500/20">Eye Contact: Good</span>
                            <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-500 text-xs border border-white/5">Pacing: --</span>
                        </div>
                    </div>
                </div>
            </div>
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
        </div>
    );
}
