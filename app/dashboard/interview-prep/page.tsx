"use client";

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
        </div>
    );
}
