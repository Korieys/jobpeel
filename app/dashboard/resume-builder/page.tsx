"use client";

import { useState } from "react";
import { LayoutTemplate, Plus, GripVertical, Download, Eye } from "lucide-react";

export default function ResumeBuilderPage() {
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Resume Builder</h1>
                    <p className="text-zinc-400">Drag, drop, and build your professional CV.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 border border-white/5">
                        <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-900/20">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                </div>
            </header>

            <div className="flex-1 grid lg:grid-cols-2 gap-8 min-h-0">
                {/* Editor Panel */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <LayoutTemplate className="w-4 h-4 text-orange-500" />
                            Sections
                        </h3>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {["Personal Info", "Summary", "Experience", "Education", "Skills", "Projects"].map((section, i) => (
                            <div key={i} className="bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing transition-colors group">
                                <GripVertical className="text-zinc-600 group-hover:text-zinc-400" />

                                <div className="flex-1">
                                    <p className="font-bold text-zinc-200">{section}</p>
                                    <p className="text-xs text-zinc-500">Click to edit details</p>
                                </div>

                                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                            </div>
                        ))}

                        <button className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-wider">
                            + Add Custom Section
                        </button>
                    </div>
                </div>

                {/* Live Preview Panel */}
                <div className="bg-zinc-200 rounded-3xl p-8 overflow-y-auto shadow-inner">
                    <div className="bg-white min-h-[800px] w-full shadow-2xl p-12 text-zinc-900">
                        {/* Mock Resume Content */}
                        <div className="mb-8 border-b border-zinc-200 pb-8">
                            <h1 className="text-4xl font-serif font-bold mb-2">Kai Dixon</h1>
                            <p className="text-zinc-600">Product Designer • San Francisco, CA • kai@example.com</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Professional Summary</h2>
                                <p className="text-sm leading-relaxed text-zinc-700">
                                    Innovative Product Designer with 5+ years of experience building consumer-facing applications. Proven track record of improving user engagement by 40% through iterative design processes.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Experience</h2>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-lg">Senior Designer</h3>
                                            <span className="text-sm text-zinc-500">2023 - Present</span>
                                        </div>
                                        <p className="text-sm font-medium text-zinc-600 mb-2">TechCorp Inc.</p>
                                        <ul className="list-disc list-inside text-sm text-zinc-700 space-y-1">
                                            <li>Led redesign of core mobile dashboard.</li>
                                            <li>Mentored 3 junior designers.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
