"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    User,
    FileText,
    Zap,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    Plus,
    ShieldCheck,
    ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userProfile, loading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            if (user?.email) {
                try {
                    const { collection, query, where, getDocs } = await import("firebase/firestore");
                    const { db } = await import("@/lib/firebase");
                    const q = query(collection(db, "jobpeel_waitlist"), where("admin_emails", "array-contains", user.email));
                    const snap = await getDocs(q);
                    if (!snap.empty) setIsAdmin(true);
                } catch (error) {
                    console.error("Error checking admin status:", error);
                }
            }
        };
        checkAdmin();
    }, [user]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-orange-600 animate-pulse" />
                <p className="text-zinc-500 text-sm font-mono">AUTHENTICATING...</p>
            </div>
        </div>
    );

    if (!user) return null;

    const navItems = [
        { name: "Generator", href: "/dashboard", icon: LayoutDashboard },
        ...(isAdmin ? [{ name: "University Admin", href: "/dashboard/admin", icon: ShieldCheck }] : []),
        { name: "Profile", href: "/dashboard/profile", icon: User },
        { name: "Resumes", href: "/dashboard/resume-builder", icon: FileText },
        { name: "Optimizer", href: "/dashboard/resume-optimizer", icon: Zap },
        { name: "Interview Prep", href: "/dashboard/interview-prep", icon: MessageSquare },
        { name: "Tracker", href: "/dashboard/tracker", icon: ClipboardList },
    ];

    const NavItem = ({ item }: { item: any }) => {
        const isActive = pathname === item.href;
        return (
            <Link
                href={item.href}
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive
                        ? "bg-gradient-to-r from-orange-600/10 to-orange-500/5 text-orange-500 font-medium"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
            >
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full" />
                )}
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-orange-500" : "text-zinc-500 group-hover:text-zinc-300")} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-white/5">
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex selection:bg-orange-500/30 selection:text-orange-100">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-zinc-950 p-4 sticky top-0 h-screen z-40">
                <div className="flex items-center gap-3 px-3 py-4 mb-8">
                    <div className="relative group cursor-pointer">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                        <img
                            src="/logos/jobpeel-logo-square.png"
                            alt="JobPeel"
                            className="relative w-8 h-8 rounded-lg shadow-lg border border-white/10"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white font-sans">
                        JobPeel
                    </span>
                </div>

                <div className="flex flex-col gap-1 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="px-3 mb-2">
                        <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest pl-1">Menu</p>
                    </div>
                    {navItems.map((item) => (
                        <NavItem key={item.name} item={item} />
                    ))}
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-2">
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </Link>
                    <div className="px-3 py-3 rounded-2xl bg-zinc-900 border border-white/5 mt-2">
                        <div className="flex items-center gap-3 mb-3">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-white/10" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                    {userProfile?.firstName && userProfile?.lastName
                                        ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase()
                                        : user?.email?.[0].toUpperCase() || "U"}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">
                                    {userProfile?.firstName && userProfile?.lastName
                                        ? `${userProfile.firstName} ${userProfile.lastName}`
                                        : user?.displayName || "User"}
                                </p>
                                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button className="w-full py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg transition-colors border border-white/5">
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Nav */}
            <div className="lg:hidden fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/logos/jobpeel-logo-square.png" alt="JobPeel" className="w-8 h-8 rounded-lg" />
                    <span className="font-bold text-white">JobPeel</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-400">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0 lg:pt-0 pt-16">
                {/* Mobile Sidebar */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-zinc-950 pt-20 px-6 lg:hidden animate-in slide-in-from-top-10">
                        <div className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <NavItem key={item.name} item={item} />
                            ))}
                            <hr className="border-white/5 my-4" />
                            <NavItem item={{ name: "Settings", href: "/dashboard/settings", icon: Settings }} />
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
