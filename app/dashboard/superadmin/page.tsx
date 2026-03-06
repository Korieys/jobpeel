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

interface SuperUser { id: string; name: string; email: string; generationsUsed: number; createdAt?: string; }
interface SuperCollege { id: string; programName: string; domains: string[]; admins: string[]; createdAt?: string; }
interface SuperApp { id: string; userId: string; company: string; role: string; type: string; appliedAt: string; }
interface SuperMessage { id: string; name: string; email: string; type: "Contact" | "Demo"; message?: string; createdAt: string; }

type TabType = "users" | "colleges" | "applications" | "messages" | null;

export default function SuperAdminDashboard() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

    const [usersList, setUsersList] = useState<SuperUser[]>([]);
    const [collegesList, setCollegesList] = useState<SuperCollege[]>([]);
    const [appsList, setAppsList] = useState<SuperApp[]>([]);
    const [messagesList, setMessagesList] = useState<SuperMessage[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>(null);

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
            const collegesArray: SuperCollege[] = [];
            waitlistSnap.forEach(doc => {
                const data = doc.data();
                if (!data.domains || data.domains.length === 0) return; // Skip old individual waitlist users

                collegesArray.push({
                    id: doc.id,
                    programName: data.programName || data.domains[0] || "Unknown Program",
                    domains: data.domains,
                    admins: data.admin_emails || [],
                    createdAt: data.createdAt || data.timestamp || new Date().toISOString()
                });
            });

            // Re-calculate the colleges onboard size based on valid colleges
            const trueCollegesCount = collegesArray.length;

            // 2. Messages & Demos
            const contactSnap = await getDocs(collection(db, "contact_messages"));
            const demoSnap = await getDocs(collection(db, "demo_requests"));
            const messagesArray: SuperMessage[] = [];

            contactSnap.forEach(doc => {
                const data = doc.data();
                messagesArray.push({
                    id: doc.id, name: data.name || "Unknown", email: data.email || "",
                    type: "Contact", message: data.message, createdAt: data.createdAt
                });
            });
            demoSnap.forEach(doc => {
                const data = doc.data();
                messagesArray.push({
                    id: doc.id, name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || "Unknown",
                    email: data.workEmail || "", type: "Demo", message: data.message, createdAt: data.createdAt || new Date().toISOString()
                });
            });
            // Sort Messages newest first
            messagesArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            // 3. Applications (Jobs & Companies)
            const appsSnap = await getDocs(collection(db, "applications"));
            const appsArray: SuperApp[] = [];
            const uniqueCompanies = new Set<string>();

            appsSnap.forEach(doc => {
                const data = doc.data();
                const companyName = data.company || data.jobCompany || "Unknown";
                if (companyName && companyName !== "Unknown") {
                    uniqueCompanies.add(companyName.trim().toLowerCase());
                }
                appsArray.push({
                    id: doc.id,
                    userId: data.userId || "Unknown",
                    company: companyName,
                    role: data.role || data.jobTitle || "Unknown",
                    type: data.type || "Unknown",
                    appliedAt: data.appliedAt || new Date().toISOString()
                });
            });
            appsArray.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

            // 4. Users & Cover Letters
            const usersSnap = await getDocs(collection(db, "users"));
            const usersArray: SuperUser[] = [];
            let totalCoverLetters = 0;

            usersSnap.forEach(doc => {
                const data = doc.data();
                const gens = typeof data.generationsUsed === 'number' ? data.generationsUsed : 0;
                totalCoverLetters += gens;
                usersArray.push({
                    id: doc.id,
                    name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || "Unknown",
                    email: data.email || "No Email",
                    generationsUsed: gens,
                    createdAt: data.createdAt
                });
            });
            usersArray.sort((a, b) => (b.generationsUsed || 0) - (a.generationsUsed || 0));

            setCollegesList(collegesArray);
            setMessagesList(messagesArray);
            setAppsList(appsArray);
            setUsersList(usersArray);

            setStats({
                totalUsers: usersSnap.size,
                totalCoverLetters,
                collegesOnboard: trueCollegesCount,
                contactRequests: contactSnap.size,
                demoRequests: demoSnap.size,
                totalJobsApplied: appsSnap.size,
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
            border: "border-blue-500/20",
            tabId: "users" as TabType
        },
        {
            title: "Cover Letters Generated",
            value: stats.totalCoverLetters.toLocaleString(),
            icon: FileText,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
            tabId: "users" as TabType // Same view shows both
        },
        {
            title: "Colleges Onboard",
            value: stats.collegesOnboard.toLocaleString(),
            icon: Building2,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            tabId: "colleges" as TabType
        },
        {
            title: "Jobs Applied To",
            value: stats.totalJobsApplied.toLocaleString(),
            icon: Briefcase,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            tabId: "applications" as TabType
        },
        {
            title: "Unique Companies",
            value: stats.uniqueCompaniesApplied.toLocaleString(),
            icon: Globe,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20",
            tabId: "applications" as TabType // Same view
        },
        {
            title: "Demo & Contact Requests",
            value: (stats.demoRequests + stats.contactRequests).toLocaleString(),
            icon: Mail,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
            tabId: "messages" as TabType
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
                {statCards.map((card, i) => {
                    const isActive = activeTab === card.tabId;
                    return (
                        <motion.button
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setActiveTab(isActive ? null : card.tabId)}
                            className={`text-left bg-zinc-900/50 border ${isActive ? 'border-white/30 ring-1 ring-white/10' : 'border-white/5 hover:border-white/10'} rounded-3xl p-6 relative overflow-hidden group transition-all`}
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
                        </motion.button>
                    );
                })}
            </div>

            {/* Drill-down Tables */}
            {activeTab && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 lg:p-8 overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">
                            {activeTab === 'users' && "User Directory"}
                            {activeTab === 'colleges' && "Onboarded Colleges"}
                            {activeTab === 'applications' && "Global Application Log"}
                            {activeTab === 'messages' && "Inbound Requests"}
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-400">
                            <thead className="text-xs uppercase bg-black/20 text-zinc-500">
                                {activeTab === 'users' && (
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-xl">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Generations</th>
                                        <th className="px-4 py-3 rounded-tr-xl">Joined</th>
                                    </tr>
                                )}
                                {activeTab === 'colleges' && (
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-xl">Program Name</th>
                                        <th className="px-4 py-3">Domains</th>
                                        <th className="px-4 py-3">Admin Emails</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 rounded-tr-xl">Linked On</th>
                                    </tr>
                                )}
                                {activeTab === 'applications' && (
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-xl">Company</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">User UID</th>
                                        <th className="px-4 py-3 rounded-tr-xl">Applied On</th>
                                    </tr>
                                )}
                                {activeTab === 'messages' && (
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-xl">Type</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3 w-1/3">Message</th>
                                        <th className="px-4 py-3 rounded-tr-xl">Date</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {activeTab === 'users' && usersList.map(u => (
                                    <tr key={u.id} className="hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                                        <td className="px-4 py-3">{u.email}</td>
                                        <td className="px-4 py-3"><span className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded-md font-mono">{u.generationsUsed}</span></td>
                                        <td className="px-4 py-3 font-mono text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                ))}
                                {activeTab === 'colleges' && collegesList.map(c => {
                                    const isOnboarded = c.admins && c.admins.length > 0;
                                    return (
                                        <tr key={c.id} className="hover:bg-white/[0.02]">
                                            <td className="px-4 py-3 font-medium text-white">{c.programName}</td>
                                            <td className="px-4 py-3">{c.domains.join(", ")}</td>
                                            <td className="px-4 py-3">{c.admins.join(", ")}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${isOnboarded ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                                                    {isOnboarded ? 'Onboarded' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                    );
                                })}
                                {activeTab === 'applications' && appsList.map(a => (
                                    <tr key={a.id} className="hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 font-medium text-white">{a.company}</td>
                                        <td className="px-4 py-3">{a.role}</td>
                                        <td className="px-4 py-3"><span className="px-2 py-1 bg-zinc-800 rounded-md text-xs">{a.type}</span></td>
                                        <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]" title={a.userId}>{a.userId}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{new Date(a.appliedAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {activeTab === 'messages' && messagesList.map(m => (
                                    <tr key={m.id} className="hover:bg-white/[0.02]">
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs ${m.type === 'Demo' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                {m.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-white">{m.name}</td>
                                        <td className="px-4 py-3">{m.email}</td>
                                        <td className="px-4 py-3 truncate max-w-xs" title={m.message}>{m.message || <span className="text-zinc-600 italic">No message</span>}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{new Date(m.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
