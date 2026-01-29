"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Loader2, ShieldCheck, Users, TrendingUp, Search, Calendar, Mail, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    photoURL?: string;
    createdAt?: string;
}

interface ProgramStats {
    programName: string;
    totalStudents: number;
    coverLettersCount: number;
    domain: string;
}

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<ProgramStats | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            fetchAdminData();
        }
    }, [user, loading]);

    const fetchAdminData = async () => {
        try {
            if (!user?.email) return;

            // 1. Find which program this user is an admin for
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
            const domains = programDoc.domains || []; // e.g. ["lsu.edu"]
            const adminEmails = programDoc.admin_emails || [];

            if (domains.length === 0 && adminEmails.length === 0) {
                setStats({ programName, totalStudents: 0, coverLettersCount: 0, domain: "N/A" });
                setPageLoading(false);
                return;
            }

            // 2. Fetch Students matching the domain
            const usersRef = collection(db, "users");
            const userSnap = await getDocs(usersRef);

            const matchedStudents: Student[] = [];
            userSnap.forEach(doc => {
                const data = doc.data();
                const uEmail = data.email || "";
                if (domains.some((d: string) => uEmail.toLowerCase().endsWith("@" + d.toLowerCase()))) {
                    matchedStudents.push({
                        id: doc.id,
                        firstName: data.firstName || "Unknown",
                        lastName: data.lastName || "",
                        email: uEmail,
                        photoURL: data.photoURL,
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

        } catch (error) {
            console.error("Admin stats error:", error);
            toast.error("Failed to load admin stats");
        } finally {
            setPageLoading(false);
        }
    };

    if (loading || pageLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (!stats) return null;

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
            </div>
        </div>
    );
}
