"use client";

import { MessageSquare, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function InterviewPrepPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            {/* Animated background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20 rounded-3xl flex items-center justify-center mb-8 relative"
                >
                    <MessageSquare className="w-10 h-10 text-orange-500" />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-orange-500/10 rounded-3xl"
                    />
                </motion.div>

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6"
                >
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Coming Soon</span>
                </motion.div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                    Interview Prep
                </h1>

                {/* Description */}
                <p className="text-zinc-400 text-lg max-w-md mb-3 leading-relaxed">
                    Practice with an AI interviewer tailored to your target role and get real-time feedback.
                </p>
                <p className="text-zinc-600 text-sm max-w-sm mb-10">
                    We&apos;re putting the finishing touches on this tool. It&apos;ll be ready before you know it.
                </p>

                {/* Features preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 w-full max-w-lg">
                    {[
                        { label: "Mock Interviews", desc: "AI-powered practice" },
                        { label: "STAR Method", desc: "Behavioral coaching" },
                        { label: "Live Feedback", desc: "Improve every answer" },
                    ].map((feature, i) => (
                        <motion.div
                            key={feature.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-center"
                        >
                            <p className="text-sm font-bold text-white mb-0.5">{feature.label}</p>
                            <p className="text-[11px] text-zinc-600">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Back button */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-sm font-medium transition-all border border-white/5 hover:border-white/10"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </motion.div>
        </div>
    );
}
