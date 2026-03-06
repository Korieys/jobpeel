"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
    Loader2, Users, Building2, FileText, Briefcase, Mail,
    MessageSquare, LineChart, Globe, Trophy, Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface GlobalStats {
    totalUsers: number;
    totalCoverLetters: number;
    collegesOnboard: number;
    contactRequests: number;
    demoRequests: number;
    totalJobsApplied: number;
    uniqueCompaniesApplied: number;
}

export default function SuperAdminDashboard() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        if (!loading && (!user || !userProfile?.isSuperAdmin)) {
            router.push("/dashboard");
        }
    }, [user, userProfile, loading, router]);

    useEffect(() => {
        if (user && userProfile?.isSuperAdmin) {
            fetchGlobalStats();
        }
    }, [user, userProfile]);

    const fetchGlobalStats = async () => {
        setPageLoading(true);
        try {
            // 1. Colleges Onboard (waitlist)
            const waitlistSnap = await getDocs(collection(db, "jobpeel_waitlist"));
            const collegesOnboard = waitlistSnap.size;

            // 2. Contact Requests & Demo Requests
            const contactSnap = await getDocs(collection(db, "contact_messages"));
            const demoSnap = await getDocs(collection(db, "demo_requests"));
            const contactRequests = contactSnap.size;
            const demoRequests = demoSnap.size;

            // 3. Applications (Jobs & Companies)
            const appsSnap = await getDocs(collection(db, "applications"));
            const totalJobsApplied = appsSnap.size;

            const uniqueCompanies = new Set<string>();
            appsSnap.forEach((doc) => {
                const data = doc.data();
                const companyName = data.company || data.jobCompany;
                if (companyName) {
                    uniqueCompanies.add(companyName.trim().toLowerCase());
                }
            });

            // 4. Users & Cover Letters Generated
            const usersSnap = await getDocs(collection(db, "users"));
            const totalUsers = usersSnap.size;

            let totalCoverLetters = 0;
            usersSnap.forEach((doc) => {
                const data = doc.data();
                if (typeof data.generationsUsed === 'number') {
                    totalCoverLetters += data.generationsUsed;
                }
            });

            setStats({
                totalUsers,
                totalCoverLetters,
                collegesOnboard,
                contactRequests,
                demoRequests,
                totalJobsApplied,
                uniqueCompaniesApplied: uniqueCompanies.size,
            });

        } catch (error) {
            console.error("Superadmin stats error:", error);
            toast.error("Failed to load global stats");
        } finally {
            setPageLoading(false);
        }
    };

    if (loading || pageLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-zinc-500 text-sm font-mono">AGGREGATING GLOBAL DATA...</p>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const statCards = [
        {
            title: "Total Users",
            value: stats.totalUsers.toLocaleString(),
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            title: "Cover Letters Generated",
            value: stats.totalCoverLetters.toLocaleString(),
            icon: FileText,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
        },
        {
            title: "Colleges Onboard",
            value: stats.collegesOnboard.toLocaleString(),
            icon: Building2,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            title: "Jobs Applied To",
            value: stats.totalJobsApplied.toLocaleString(),
            icon: Briefcase,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            title: "Unique Companies",
            value: stats.uniqueCompaniesApplied.toLocaleString(),
            icon: Globe,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20"
        },
        {
            title: "Demo & Contact Requests",
            value: (stats.demoRequests + stats.contactRequests).toLocaleString(),
            icon: Mail,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20"
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-white/10 p-8 lg:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 blur-[120px] rounded-full -z-10 translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full -z-10 -translate-x-1/3 translate-y-1/3" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Trophy className="w-3.5 h-3.5" />
                            GOD MODE
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">Platform Overview</h1>
                        <p className="text-zinc-400 text-lg">Global statistics and analytics across the entire JobPeel application.</p>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity ${card.bg}`} />

                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${card.bg} ${card.border} border`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>

                        <div>
                            <p className="text-3xl font-bold text-white mb-1 font-mono">{card.value}</p>
                            <p className="text-sm font-medium text-zinc-400 uppercase tracking-wide">{card.title}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

        </div>
    );
}
