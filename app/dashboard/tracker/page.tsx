"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Loader2,
    ExternalLink,
    GripVertical,
    X,
    Briefcase,
    MapPin,
    DollarSign,
    Calendar,
    StickyNote,
    ChevronDown,
    BarChart3,
    Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
    Application,
    ApplicationStatus,
    STATUS_CONFIG,
    STATUSES,
    createApplication,
    getApplications,
    updateApplication,
    deleteApplication,
} from "@/lib/applicationService";

export default function ApplicationTrackerPage() {
    const { user } = useAuth();

    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"board" | "list">("board");

    // New application form
    const [formData, setFormData] = useState({
        company: "",
        role: "",
        url: "",
        status: "saved" as ApplicationStatus,
        notes: "",
        salary: "",
        location: "",
        appliedDate: new Date().toISOString().split("T")[0],
    });

    // Load applications
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const apps = await getApplications(user.uid);
                setApplications(apps);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load applications");
            } finally {
                setIsLoading(false);
            }
        })();
    }, [user]);

    // Add application
    const handleAdd = async () => {
        if (!user || !formData.company || !formData.role) {
            toast.error("Company and role are required");
            return;
        }
        try {
            const id = await createApplication({
                userId: user.uid,
                ...formData,
                source: "manual",
            });
            setApplications((prev) => [
                { id, userId: user.uid, ...formData, source: "manual" },
                ...prev,
            ]);
            setShowAddModal(false);
            resetForm();
            toast.success("Application added");
        } catch {
            toast.error("Failed to add application");
        }
    };

    // Update status (drag or click)
    const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
        try {
            await updateApplication(appId, { status: newStatus });
            setApplications((prev) =>
                prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
            );
            toast.success(`Moved to ${STATUS_CONFIG[newStatus].label}`);
        } catch {
            toast.error("Failed to update");
        }
    };

    // Update application
    const handleUpdate = async () => {
        if (!editingApp?.id) return;
        try {
            await updateApplication(editingApp.id, {
                company: formData.company,
                role: formData.role,
                url: formData.url,
                status: formData.status,
                notes: formData.notes,
                salary: formData.salary,
                location: formData.location,
                appliedDate: formData.appliedDate,
            });
            setApplications((prev) =>
                prev.map((a) =>
                    a.id === editingApp.id
                        ? { ...a, ...formData }
                        : a
                )
            );
            setEditingApp(null);
            setShowAddModal(false);
            resetForm();
            toast.success("Application updated");
        } catch {
            toast.error("Failed to update");
        }
    };

    // Delete application
    const handleDelete = async (id: string) => {
        try {
            await deleteApplication(id);
            setApplications((prev) => prev.filter((a) => a.id !== id));
            toast.success("Application removed");
        } catch {
            toast.error("Failed to delete");
        }
    };

    // Edit application
    const openEdit = (app: Application) => {
        setEditingApp(app);
        setFormData({
            company: app.company,
            role: app.role,
            url: app.url,
            status: app.status,
            notes: app.notes,
            salary: app.salary,
            location: app.location,
            appliedDate: app.appliedDate,
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            company: "", role: "", url: "", status: "saved",
            notes: "", salary: "", location: "",
            appliedDate: new Date().toISOString().split("T")[0],
        });
        setEditingApp(null);
    };

    // Filter
    const filtered = applications.filter(
        (a) =>
            a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by status for board view
    const grouped: Record<ApplicationStatus, Application[]> = {
        saved: [], applied: [], interviewing: [], offer: [], rejected: [],
    };
    filtered.forEach((a) => {
        if (grouped[a.status]) grouped[a.status].push(a);
    });

    // Stats
    const totalApps = applications.length;
    const interviewRate = totalApps > 0
        ? Math.round((applications.filter((a) => ["interviewing", "offer"].includes(a.status)).length / totalApps) * 100)
        : 0;
    const offerCount = applications.filter((a) => a.status === "offer").length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-zinc-500 text-sm font-mono">LOADING APPLICATIONS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Application Tracker</h1>
                    <p className="text-zinc-400">Track your job applications from saved to offer.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-900/20 transition-colors self-start"
                >
                    <Plus className="w-4 h-4" /> Add Application
                </button>
            </header>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Total</p>
                    <p className="text-2xl font-bold text-white">{totalApps}</p>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Interview Rate</p>
                    <p className="text-2xl font-bold text-purple-400">{interviewRate}%</p>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Offers</p>
                    <p className="text-2xl font-bold text-green-400">{offerCount}</p>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Active</p>
                    <p className="text-2xl font-bold text-orange-400">{applications.filter((a) => !["rejected", "offer"].includes(a.status)).length}</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                        type="text"
                        placeholder="Search by company or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                    />
                </div>
                <div className="flex bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
                    <button
                        onClick={() => setViewMode("board")}
                        className={cn("px-3 py-2 text-xs font-bold transition-colors", viewMode === "board" ? "bg-orange-500/10 text-orange-500" : "text-zinc-500 hover:text-white")}
                    >
                        Board
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn("px-3 py-2 text-xs font-bold transition-colors", viewMode === "list" ? "bg-orange-500/10 text-orange-500" : "text-zinc-500 hover:text-white")}
                    >
                        List
                    </button>
                </div>
            </div>

            {/* Board View */}
            {viewMode === "board" && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[50vh]">
                    {STATUSES.map((status) => {
                        const config = STATUS_CONFIG[status];
                        return (
                            <div
                                key={status}
                                className="flex flex-col"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    const appId = e.dataTransfer.getData("appId");
                                    if (appId) handleStatusChange(appId, status);
                                }}
                            >
                                {/* Column header */}
                                <div className={cn("flex items-center justify-between px-3 py-2 rounded-t-xl border", config.bgColor, config.borderColor)}>
                                    <span className={cn("text-xs font-bold uppercase tracking-widest", config.color)}>
                                        {config.label}
                                    </span>
                                    <span className={cn("text-xs font-bold", config.color)}>
                                        {grouped[status].length}
                                    </span>
                                </div>

                                {/* Column body */}
                                <div className="flex-1 bg-zinc-900/30 border border-t-0 border-white/5 rounded-b-xl p-2 space-y-2 min-h-[200px]">
                                    {grouped[status].map((app) => (
                                        <motion.div
                                            key={app.id}
                                            layout
                                            draggable
                                            onDragStart={(e: any) => {
                                                e.dataTransfer.setData("appId", app.id!);
                                            }}
                                            onClick={() => openEdit(app)}
                                            className="bg-zinc-900/80 border border-white/5 rounded-xl p-3 cursor-pointer hover:border-white/10 transition-all hover:bg-zinc-800/80 group"
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <p className="font-bold text-sm text-white leading-tight">{app.role}</p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(app.id!); }}
                                                    className="p-1 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-zinc-400 mb-2">{app.company}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {app.location && (
                                                    <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                                                        <MapPin className="w-2.5 h-2.5" /> {app.location}
                                                    </span>
                                                )}
                                                {app.salary && (
                                                    <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                                                        <DollarSign className="w-2.5 h-2.5" /> {app.salary}
                                                    </span>
                                                )}
                                            </div>
                                            {app.url && (
                                                <a
                                                    href={app.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-1 text-[10px] text-orange-500 hover:text-orange-400 mt-2 transition-colors"
                                                >
                                                    <ExternalLink className="w-2.5 h-2.5" /> View Posting
                                                </a>
                                            )}
                                        </motion.div>
                                    ))}

                                    {grouped[status].length === 0 && (
                                        <div className="flex items-center justify-center h-24 text-zinc-700 text-xs">
                                            Drop here
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        <span className="col-span-3">Company</span>
                        <span className="col-span-3">Role</span>
                        <span className="col-span-2">Status</span>
                        <span className="col-span-1">Location</span>
                        <span className="col-span-1">Salary</span>
                        <span className="col-span-1">Date</span>
                        <span className="col-span-1"></span>
                    </div>
                    {filtered.length === 0 && (
                        <div className="px-4 py-12 text-center text-zinc-600 text-sm">
                            No applications found
                        </div>
                    )}
                    {filtered.map((app) => {
                        const config = STATUS_CONFIG[app.status];
                        return (
                            <div
                                key={app.id}
                                onClick={() => openEdit(app)}
                                className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors items-center text-sm"
                            >
                                <span className="col-span-3 font-bold text-white truncate">{app.company}</span>
                                <span className="col-span-3 text-zinc-300 truncate">{app.role}</span>
                                <span className="col-span-2">
                                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider", config.bgColor, config.color, config.borderColor, "border")}>
                                        {config.label}
                                    </span>
                                </span>
                                <span className="col-span-1 text-zinc-500 text-xs truncate">{app.location || "—"}</span>
                                <span className="col-span-1 text-zinc-500 text-xs truncate">{app.salary || "—"}</span>
                                <span className="col-span-1 text-zinc-600 text-xs">{app.appliedDate || "—"}</span>
                                <span className="col-span-1 flex justify-end">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(app.id!); }}
                                        className="p-1.5 text-zinc-700 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {applications.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                        <Briefcase className="w-7 h-7 text-zinc-700" />
                    </div>
                    <p className="text-lg font-bold text-zinc-600 mb-2">No applications yet</p>
                    <p className="text-sm text-zinc-700 mb-6">Start tracking your job search</p>
                    <button
                        onClick={() => { resetForm(); setShowAddModal(true); }}
                        className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add First Application
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => { setShowAddModal(false); resetForm(); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white">
                                    {editingApp ? "Edit Application" : "Add Application"}
                                </h2>
                                <button
                                    onClick={() => { setShowAddModal(false); resetForm(); }}
                                    className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Company *</label>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                                            placeholder="Google"
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Role *</label>
                                        <input
                                            type="text"
                                            value={formData.role}
                                            onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                                            placeholder="Software Engineer"
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Job Posting URL</label>
                                    <input
                                        type="url"
                                        value={formData.url}
                                        onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))}
                                        placeholder="https://..."
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as ApplicationStatus }))}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 appearance-none"
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Salary</label>
                                        <input
                                            type="text"
                                            value={formData.salary}
                                            onChange={(e) => setFormData((p) => ({ ...p, salary: e.target.value }))}
                                            placeholder="$120k"
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Location</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                                            placeholder="Remote"
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Applied Date</label>
                                    <input
                                        type="date"
                                        value={formData.appliedDate}
                                        onChange={(e) => setFormData((p) => ({ ...p, appliedDate: e.target.value }))}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                                        placeholder="Referral from John, uses React + Go stack..."
                                        rows={3}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => { setShowAddModal(false); resetForm(); }}
                                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm transition-colors border border-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingApp ? handleUpdate : handleAdd}
                                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-orange-900/20"
                                >
                                    {editingApp ? "Save Changes" : "Add Application"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
