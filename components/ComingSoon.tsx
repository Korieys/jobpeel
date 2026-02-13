"use client";

import React, { useState } from 'react';
import { ArrowLeft, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ComingSoonProps {
    title: string;
    description: string;
    badge: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description, badge }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setEmail('');
            toast.success("You're on the list!", {
                description: `We'll notify you when ${title} is ready.`,
                duration: 5000,
            });
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-orange-500 selection:text-white flex flex-col">
            {/* Nav */}
            <nav className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logos/jobpeel-logo-square.png" alt="JobPeel" className="w-8 h-8 rounded-lg" />
                        <span className="font-bold text-lg tracking-tight">JobPeel</span>
                    </div>
                    <a
                        href="/"
                        className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </a>
                </div>
            </nav>

            <main className="flex-1 flex flex-col justify-center relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/20 blur-[120px] rounded-full -z-10 opacity-50" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-600/10 blur-[100px] rounded-full -z-10" />

                <div className="max-w-4xl mx-auto px-6 text-center w-full py-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-medium mb-8">
                        <Sparkles className="w-4 h-4" />
                        {badge}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        {title}
                    </h1>

                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        {description}
                    </p>

                    <div className="max-w-md mx-auto">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                    required
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <Send className="w-4 h-4" />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? 'Joining...' : 'Notify Me'}
                            </button>
                        </form>
                        <p className="text-xs text-zinc-600 mt-4">
                            We'll only send you one email when this feature launches.
                        </p>
                    </div>
                </div>

                {/* Sneak Peek Placeholder */}
                <div className="max-w-6xl mx-auto px-6 w-full pb-20">
                    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-2 shadow-2xl shadow-black/50">
                        <div className="rounded-xl border border-white/5 bg-zinc-950/80 aspect-[16/9] flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] hover:bg-[position:200%_0,0_0] duration-[1500ms]" />
                            <div className="text-center">
                                <div className="w-16 h-16 bg-zinc-800 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                    <Sparkles className="w-8 h-8 text-orange-500" />
                                </div>
                                <p className="text-zinc-500 font-medium">Interactive Preview Coming Soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ComingSoon;
