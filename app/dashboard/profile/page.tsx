"use client";

import { User, Mail, MapPin, Briefcase, Plus } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Profile</h1>
                <p className="text-zinc-400">Manage your personal information and preferences.</p>
            </div>

            {/* Profile Card */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl ring-4 ring-black">
                            KD
                        </div>
                        <button className="absolute bottom-0 right-0 p-1.5 bg-zinc-800 rounded-full border border-zinc-700 text-white hover:bg-zinc-700 transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Kai Dixon</h2>
                            <p className="text-zinc-500 font-medium">Product Designer</p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <Mail className="w-4 h-4" />
                                kai@example.com
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <MapPin className="w-4 h-4" />
                                San Francisco, CA
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <Briefcase className="w-4 h-4" />
                                Open to work
                            </div>
                        </div>
                    </div>

                    <button className="px-4 py-2 bg-white text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-colors text-sm">
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Stats/Content Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Resume Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Generated</p>
                            <p className="text-2xl font-bold text-white">24</p>
                        </div>
                        <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Files</p>
                            <p className="text-2xl font-bold text-white">3</p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-5 h-5 text-zinc-500" />
                    </div>
                    <p className="text-white font-bold mb-1">Upload New Resume</p>
                    <p className="text-zinc-500 text-sm mb-4">Keep your profile fresh with your latest CV.</p>
                    <button className="text-sm font-bold text-orange-500 hover:text-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500/10 transition-colors">
                        Upload PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
