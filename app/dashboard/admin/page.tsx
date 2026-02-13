"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
<<<<<<< HEAD
import { collection, query, where, getDocs } from "firebase/firestore";
import {
    Loader2, ShieldCheck, Users, TrendingUp, Search, Mail, FileText,
    BarChart3, Download, ChevronDown, ChevronRight, X, Briefcase,
    Target, Clock, Sparkles, BookOpen, ArrowUpRight, ArrowDownRight,
    Eye, MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
=======
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Loader2, ShieldCheck, Users, TrendingUp, Search, Calendar, Mail, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    photoURL?: string;
    createdAt?: string;
}

<<<<<<< HEAD
interface AppRecord {
    userId: string;
    company?: string;
    role?: string;
    status?: string;
    source?: string;
    createdAt?: any;
}

=======
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
interface ProgramStats {
    programName: string;
    totalStudents: number;
    coverLettersCount: number;
    domain: string;
<<<<<<< HEAD
    applicationsCount: number;
    interviewCount: number;
    offerCount: number;
    activeThisWeek: number;
}

type TabId = "overview" | "students" | "reports";

=======
}

>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<ProgramStats | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
<<<<<<< HEAD
    const [applications, setApplications] = useState<AppRecord[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
=======
    const [pageLoading, setPageLoading] = useState(true);
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }
<<<<<<< HEAD
        if (user) fetchAdminData();
=======

        if (user) {
            fetchAdminData();
        }
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
    }, [user, loading]);

    const fetchAdminData = async () => {
        try {
            if (!user?.email) return;

<<<<<<< HEAD
=======
            // 1. Find which program this user is an admin for
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
            const waitlistRef = collection(db, "jobpeel_waitlist");
            const qAdmin = query(waitlistRef, where("admin_emails", "array-contains", user.email));
            const snapAdmin = await getDocs(qAdmin);

            if (snapAdmin.empty) {
                toast.error("Access Denied", { description: "You are not an admin for any university program." });
                router.push("/dashboard");
                return;
            }

            const programDoc = snapAdmin.docs[0].data();
            const programName = programDoc.program_name;
<<<<<<< HEAD
            const domains = programDoc.domains || [];
            const adminEmails = programDoc.admin_emails || [];

            if (domains.length === 0 && adminEmails.length === 0) {
                setStats({ programName, totalStudents: 0, coverLettersCount: 0, domain: "N/A", applicationsCount: 0, interviewCount: 0, offerCount: 0, activeThisWeek: 0 });
=======
            const domains = programDoc.domains || []; // e.g. ["lsu.edu"]
            const adminEmails = programDoc.admin_emails || [];

            if (domains.length === 0 && adminEmails.length === 0) {
                setStats({ programName, totalStudents: 0, coverLettersCount: 0, domain: "N/A" });
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
                setPageLoading(false);
                return;
            }

<<<<<<< HEAD
            // Fetch all users
=======
            // 2. Fetch Students matching the domain
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
            const usersRef = collection(db, "users");
            const userSnap = await getDocs(usersRef);

            const matchedStudents: Student[] = [];
<<<<<<< HEAD
            const studentUserIds = new Set<string>();
            userSnap.forEach((doc) => {
=======
            userSnap.forEach(doc => {
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
                const data = doc.data();
                const uEmail = data.email || "";
                if (domains.some((d: string) => uEmail.toLowerCase().endsWith("@" + d.toLowerCase()))) {
                    matchedStudents.push({
                        id: doc.id,
                        firstName: data.firstName || "Unknown",
                        lastName: data.lastName || "",
                        email: uEmail,
                        photoURL: data.photoURL,
<<<<<<< HEAD
                        createdAt: data.createdAt,
                    });
                    studentUserIds.add(doc.id);
                }
            });

            // Fetch all applications for this program's students
            const appsRef = collection(db, "applications");
            const appsSnap = await getDocs(appsRef);
            const allApps: AppRecord[] = [];
            appsSnap.forEach((doc) => {
                const data = doc.data();
                if (studentUserIds.has(data.userId)) {
                    allApps.push({
                        userId: data.userId,
                        company: data.company || data.jobCompany,
                        role: data.role || data.jobTitle,
                        status: data.status,
                        source: data.source,
                        createdAt: data.createdAt,
                    });
                }
            });

            // Compute stats
            const coverLettersCount = allApps.filter((a) => a.source === "generator").length;
            const interviewCount = allApps.filter((a) => a.status === "interviewing").length;
            const offerCount = allApps.filter((a) => a.status === "offer").length;

            // Active this week
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            const activeIds = new Set<string>();
            allApps.forEach((a) => {
                if (a.createdAt?.toMillis?.() > weekAgo || a.createdAt?.seconds * 1000 > weekAgo) {
                    activeIds.add(a.userId);
                }
            });

            matchedStudents.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

            setStats({
                programName,
                totalStudents: matchedStudents.length,
                coverLettersCount,
                domain: domains[0] || "None",
                applicationsCount: allApps.length,
                interviewCount,
                offerCount,
                activeThisWeek: activeIds.size,
            });
            setStudents(matchedStudents);
            setApplications(allApps);
=======
                        createdAt: data.createdAt
                    });
                }
            });

            // 3. Fetch Cover Letter Count
            const appsRef = collection(db, "applications");
            const appsSnap = await getDocs(appsRef);
            let coverLettersCount = 0;
            appsSnap.forEach(doc => {
                const data = doc.data();
                const isFromStudent = domains.some((d: string) => data.userDomain === d.toLowerCase());
                const isFromAdmin = adminEmails.some((email: string) => data.userEmail === email);

                if (isFromStudent || isFromAdmin) {
                    coverLettersCount++;
                }
            });

            // Sort students by most recent
            matchedStudents.sort((a, b) => {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });

            setStats({
                programName,
                totalStudents: matchedStudents.length,
                coverLettersCount: coverLettersCount,
                domain: domains[0] || "None"
            });
            setStudents(matchedStudents);

>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
        } catch (error) {
            console.error("Admin stats error:", error);
            toast.error("Failed to load admin stats");
        } finally {
            setPageLoading(false);
        }
    };

<<<<<<< HEAD
    // Drill-down data for a student
    const getStudentApps = (userId: string) => applications.filter((a) => a.userId === userId);

    // CSV Export
    const exportCSV = () => {
        const header = "Name,Email,Joined,Applications,Interviews,Offers";
        const rows = students.map((s) => {
            const apps = getStudentApps(s.id);
            return [
                `${s.firstName} ${s.lastName}`,
                s.email,
                s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "N/A",
                apps.length,
                apps.filter((a) => a.status === "interviewing").length,
                apps.filter((a) => a.status === "offer").length,
            ].join(",");
        });
        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${stats?.programName || "program"}_students_report.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exported");
    };

    // PDF Export
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(`${stats?.programName || "Program"} — Admin Report`, 14, 20);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);
        doc.setFontSize(12);
        doc.text(`Total Students: ${stats?.totalStudents}`, 14, 40);
        doc.text(`Total Applications: ${stats?.applicationsCount}`, 14, 48);
        doc.text(`Cover Letters Generated: ${stats?.coverLettersCount}`, 14, 56);
        doc.text(`Active Interviews: ${stats?.interviewCount}`, 14, 64);
        doc.text(`Offers: ${stats?.offerCount}`, 14, 72);
        doc.text(`Active This Week: ${stats?.activeThisWeek}`, 14, 80);

        doc.setFontSize(14);
        doc.text("Student Roster", 14, 96);
        doc.setFontSize(9);
        let y = 104;
        students.forEach((s) => {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            const apps = getStudentApps(s.id);
            doc.text(`${s.firstName} ${s.lastName}  |  ${s.email}  |  ${apps.length} apps  |  ${apps.filter((a) => a.status === "offer").length} offers`, 14, y);
            y += 6;
        });

        doc.save(`${stats?.programName || "program"}_report.pdf`);
        toast.success("PDF exported");
    };

    // Filtered students
    const filteredStudents = students.filter(
        (s) =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Placement rate
    const placementRate = stats && stats.totalStudents > 0
        ? Math.round((stats.offerCount / stats.totalStudents) * 100)
        : 0;

    if (loading || pageLoading) {
        return (
            <div className="flex h-[60vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-zinc-500 text-sm font-mono">LOADING ADMIN PLATFORM...</p>
                </div>
=======
    if (loading || pageLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
            </div>
        );
    }

    if (!stats) return null;

<<<<<<< HEAD
    const TABS: { id: TabId; label: string; icon: any }[] = [
        { id: "overview", label: "Overview", icon: BarChart3 },
        { id: "students", label: "Students", icon: Users },
        { id: "reports", label: "Reports", icon: Download },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-orange-600/20 to-orange-600/10 rounded-xl border border-orange-600/20 shadow-lg shadow-orange-900/20">
                            <ShieldCheck className="w-6 h-6 text-orange-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Career Center Admin</h1>
                    </div>
                    <p className="text-zinc-400">
                        Analytics & management for <span className="text-white font-medium bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{stats.programName}</span>
                    </p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5 w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            activeTab === tab.id
                                ? "bg-orange-500/10 text-orange-500"
                                : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ========== OVERVIEW TAB ========== */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    {/* Primary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Students", value: stats.totalStudents, icon: Users, color: "indigo", sub: `@${stats.domain}` },
                            { label: "Applications", value: stats.applicationsCount, icon: Briefcase, color: "orange", sub: `${stats.coverLettersCount} via generator` },
                            { label: "Placement Rate", value: `${placementRate}%`, icon: Target, color: "green", sub: `${stats.offerCount} offers` },
                            { label: "Active This Week", value: stats.activeThisWeek, icon: Clock, color: "purple", sub: `${stats.interviewCount} interviewing` },
                        ].map((stat) => (
                            <div key={stat.label} className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all relative overflow-hidden">
                                <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity",
                                    stat.color === "indigo" ? "bg-indigo-500/10" :
                                        stat.color === "orange" ? "bg-orange-500/10" :
                                            stat.color === "green" ? "bg-green-500/10" : "bg-purple-500/10"
                                )} />
                                <div className="flex items-center gap-3 mb-3 relative z-10">
                                    <div className={cn("p-2.5 rounded-xl border",
                                        stat.color === "indigo" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                            stat.color === "orange" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                stat.color === "green" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                    "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                    )}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{stat.label}</p>
                                </div>
                                <p className="text-3xl font-bold text-white relative z-10">{stat.value}</p>
                                <p className="text-xs text-zinc-600 mt-1 relative z-10">{stat.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Activity Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Application Pipeline */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-orange-500" />
                                Application Pipeline
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: "Saved", count: applications.filter((a) => a.status === "saved").length, color: "bg-blue-500" },
                                    { label: "Applied", count: applications.filter((a) => a.status === "applied").length, color: "bg-orange-500" },
                                    { label: "Interviewing", count: applications.filter((a) => a.status === "interviewing").length, color: "bg-purple-500" },
                                    { label: "Offers", count: applications.filter((a) => a.status === "offer").length, color: "bg-green-500" },
                                    { label: "Rejected", count: applications.filter((a) => a.status === "rejected").length, color: "bg-zinc-500" },
                                ].map((stage) => {
                                    const pct = stats.applicationsCount > 0 ? (stage.count / stats.applicationsCount) * 100 : 0;
                                    return (
                                        <div key={stage.label}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-zinc-400">{stage.label}</span>
                                                <span className="text-xs text-zinc-500 font-mono">{stage.count}</span>
                                            </div>
                                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full transition-all", stage.color)} style={{ width: `${Math.max(pct, 1)}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Engagement Summary */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-orange-500" />
                                Engagement Summary
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Avg applications per student", value: stats.totalStudents > 0 ? (stats.applicationsCount / stats.totalStudents).toFixed(1) : "0", trend: "up" },
                                    { label: "Cover letters via AI", value: stats.coverLettersCount.toString(), trend: "up" },
                                    { label: "Students with offers", value: stats.offerCount.toString(), trend: stats.offerCount > 0 ? "up" : "neutral" },
                                    { label: "Active students (7d)", value: stats.activeThisWeek.toString(), trend: stats.activeThisWeek > 0 ? "up" : "neutral" },
                                ].map((metric) => (
                                    <div key={metric.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                        <span className="text-sm text-zinc-400">{metric.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white font-mono">{metric.value}</span>
                                            {metric.trend === "up" && <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />}
                                            {metric.trend === "neutral" && <span className="text-zinc-600">—</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Students */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-orange-500" />
                            Most Active Students
                        </h3>
                        <div className="space-y-2">
                            {students
                                .map((s) => ({ ...s, appCount: getStudentApps(s.id).length }))
                                .sort((a, b) => b.appCount - a.appCount)
                                .slice(0, 5)
                                .map((s, i) => (
                                    <div key={s.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => { setSelectedStudent(s); setActiveTab("students"); }}>
                                        <span className="text-xs font-bold text-zinc-600 w-5">#{i + 1}</span>
                                        {s.photoURL ? (
                                            <img src={s.photoURL} alt="" className="w-7 h-7 rounded-full border border-white/10" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-white/10">
                                                {s.firstName[0]}{s.lastName?.[0]}
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-white flex-1">{s.firstName} {s.lastName}</span>
                                        <span className="text-xs font-mono text-zinc-500">{s.appCount} apps</span>
                                    </div>
                                ))}
                            {students.length === 0 && <p className="text-sm text-zinc-600 italic">No students found</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* ========== STUDENTS TAB ========== */}
            {activeTab === "students" && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Search students by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                            />
                        </div>
                        <span className="text-xs text-zinc-600 font-mono">{filteredStudents.length} students</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStudents.map((student) => {
                            const apps = getStudentApps(student.id);
                            const offers = apps.filter((a) => a.status === "offer").length;
                            const interviews = apps.filter((a) => a.status === "interviewing").length;
                            return (
                                <motion.div
                                    key={student.id}
                                    layout
                                    onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}
                                    className={cn(
                                        "bg-zinc-900/50 border rounded-2xl p-5 cursor-pointer transition-all hover:border-white/10",
                                        selectedStudent?.id === student.id ? "border-orange-500/30 ring-1 ring-orange-500/10" : "border-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        {student.photoURL ? (
                                            <img src={student.photoURL} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-sm font-bold text-zinc-400 border border-white/10">
                                                {student.firstName[0]}{student.lastName?.[0]}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-sm truncate">{student.firstName} {student.lastName}</p>
                                            <p className="text-xs text-zinc-500 truncate">{student.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-zinc-900/50 rounded-lg p-2 text-center border border-white/5">
                                            <p className="text-lg font-bold text-white">{apps.length}</p>
                                            <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Apps</p>
                                        </div>
                                        <div className="bg-zinc-900/50 rounded-lg p-2 text-center border border-white/5">
                                            <p className="text-lg font-bold text-purple-400">{interviews}</p>
                                            <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Interviews</p>
                                        </div>
                                        <div className="bg-zinc-900/50 rounded-lg p-2 text-center border border-white/5">
                                            <p className="text-lg font-bold text-green-400">{offers}</p>
                                            <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Offers</p>
                                        </div>
                                    </div>

                                    {/* Expanded drill-down */}
                                    <AnimatePresence>
                                        {selectedStudent?.id === student.id && apps.length > 0 && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Recent Applications</p>
                                                    {apps.slice(0, 5).map((app, i) => (
                                                        <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-black/20">
                                                            <div className="min-w-0">
                                                                <p className="text-xs text-white font-medium truncate">{app.role || "Unknown Role"}</p>
                                                                <p className="text-[10px] text-zinc-600">{app.company || "Unknown Company"}</p>
                                                            </div>
                                                            {app.status && (
                                                                <span className={cn(
                                                                    "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border",
                                                                    app.status === "offer" ? "text-green-400 bg-green-500/10 border-green-500/20" :
                                                                        app.status === "interviewing" ? "text-purple-400 bg-purple-500/10 border-purple-500/20" :
                                                                            app.status === "applied" ? "text-orange-400 bg-orange-500/10 border-orange-500/20" :
                                                                                app.status === "rejected" ? "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" :
                                                                                    "text-blue-400 bg-blue-500/10 border-blue-500/20"
                                                                )}>
                                                                    {app.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <p className="text-[10px] text-zinc-600 mt-3">
                                        Joined {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-16 text-zinc-600 text-sm">No students found</div>
                    )}
                </div>
            )}

            {/* ========== REPORTS TAB ========== */}
            {activeTab === "reports" && (
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                            <Download className="w-4 h-4 text-orange-500" />
                            Export Reports
                        </h3>
                        <p className="text-xs text-zinc-500 mb-6">Download student roster and analytics data</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={exportCSV}
                                className="flex items-center gap-4 p-5 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all text-left group"
                            >
                                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">CSV Student Report</p>
                                    <p className="text-xs text-zinc-500">Names, emails, join dates, app counts</p>
                                </div>
                            </button>

                            <button
                                onClick={exportPDF}
                                className="flex items-center gap-4 p-5 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all text-left group"
                            >
                                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">PDF Admin Report</p>
                                    <p className="text-xs text-zinc-500">Full analytics summary with student roster</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Summary */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-orange-500" />
                            Report Summary
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { label: "Students", value: stats.totalStudents },
                                { label: "Total Applications", value: stats.applicationsCount },
                                { label: "AI Cover Letters", value: stats.coverLettersCount },
                                { label: "Active Interviews", value: stats.interviewCount },
                                { label: "Offers Received", value: stats.offerCount },
                                { label: "Placement Rate", value: `${placementRate}%` },
                            ].map((item) => (
                                <div key={item.label} className="bg-black/20 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                                    <p className="text-xl font-bold text-white font-mono">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex justify-center pt-4">
                <p className="text-xs text-zinc-600 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    Secure Admin View for {stats.programName}
                </p>
=======
    return (
        <div className="min-h-screen text-white">
            {/* Background Effects */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-8 p-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-gradient-to-br from-orange-600/20 to-orange-600/10 rounded-xl border border-orange-600/20 shadow-lg shadow-orange-900/20">
                                <ShieldCheck className="w-6 h-6 text-orange-500" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">University Admin</h1>
                        </div>
                        <p className="text-zinc-400">Analytics & Management for <span className="text-white font-medium bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{stats.programName}</span></p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group bg-zinc-900/40 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/10 group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Active Students</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{stats.totalStudents}</h3>
                            </div>
                        </div>
                        <div className="text-xs text-zinc-500 relative z-10 bg-zinc-950/30 inline-block px-2 py-1 rounded-md">
                            Domain: <span className="font-mono text-indigo-400">@{stats.domain}</span>
                        </div>
                    </div>

                    <div className="group bg-zinc-900/40 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/10 group-hover:scale-110 transition-transform duration-300">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Letters Generated</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{stats.coverLettersCount}</h3>
                            </div>
                        </div>
                        <div className="text-xs text-zinc-500 relative z-10">
                            Total tailored assets created by students
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">Registered Students</h2>
                        <div className="relative hidden sm:block">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-white/20 transition-colors w-64 placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 italic">
                                            No students found yet.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {student.photoURL ? (
                                                        <img src={student.photoURL} alt="" className="w-9 h-9 rounded-full border border-white/10" />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-400 border border-white/10">
                                                            {student.firstName[0]}{student.lastName[0]}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-white group-hover:text-orange-400 transition-colors">{student.firstName} {student.lastName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-zinc-400">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {student.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-400">
                                                {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer / Debug Info */}
                <div className="flex justify-center mt-8">
                    <p className="text-xs text-zinc-600 flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" />
                        Secure Admin View for {stats.programName}
                    </p>
                </div>
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
            </div>
        </div>
    );
}
