"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Trash2,
    Download,
    Loader2,
    FileText,
    Sparkles,
    Save,
    GripVertical,
    ChevronDown,
    ChevronUp,
    X,
    User,
    Briefcase,
    GraduationCap,
    Wrench,
    FolderOpen,
    AlignLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import {
    Resume,
    ResumeData,
    ExperienceItem,
    EducationItem,
    SkillCategory,
    ProjectItem,
    emptyResumeData,
    emptyPersonalInfo,
    generateId,
    createResume,
    getResumes,
    updateResume,
    deleteResume,
} from "@/lib/resumeService";

// ===== AI Enhance Helper =====
async function enhanceText(text: string, type: "bullet" | "summary" = "bullet"): Promise<string> {
    const res = await fetch("/api/resume-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type }),
    });
    if (!res.ok) throw new Error("Failed to enhance");
    const data = await res.json();
    return data.enhanced;
}

// --- Input Component Helpers ---
const InputField = ({ label, value, onChange, placeholder, className: cls }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) => (
    <div className={cn("space-y-1.5", cls)}>
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"
        />
    </div>
);

export default function ResumeBuilderPage() {
    const { user } = useAuth();

    // Resume list
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
    const [isLoadingResumes, setIsLoadingResumes] = useState(true);

    // Editor state
    const [data, setData] = useState<ResumeData>({ ...emptyResumeData });
    const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
    const [template, setTemplate] = useState<"clean" | "modern" | "classic">("clean");
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<string>("personalInfo");
    const [enhancingId, setEnhancingId] = useState<string | null>(null);

    // Load resumes
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const list = await getResumes(user.uid);
                setResumes(list);
                if (list.length > 0) {
                    setActiveResumeId(list[0].id!);
                    setData(list[0].data);
                    setResumeTitle(list[0].title);
                    setTemplate(list[0].template);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingResumes(false);
            }
        })();
    }, [user]);

    // Auto-save debounce
    const handleSave = useCallback(async () => {
        if (!user || !activeResumeId) return;
        setIsSaving(true);
        try {
            await updateResume(activeResumeId, { data, title: resumeTitle, template });
            toast.success("Resume saved");
        } catch {
            toast.error("Failed to save");
        } finally {
            setIsSaving(false);
        }
    }, [user, activeResumeId, data, resumeTitle, template]);

    // Create new resume
    const handleNewResume = async () => {
        if (!user) return;
        try {
            const id = await createResume(user.uid, "Untitled Resume");
            const newResume: Resume = {
                id,
                userId: user.uid,
                title: "Untitled Resume",
                template: "clean",
                data: { ...emptyResumeData, personalInfo: { ...emptyPersonalInfo } },
            };
            setResumes((prev) => [newResume, ...prev]);
            setActiveResumeId(id);
            setData({ ...emptyResumeData, personalInfo: { ...emptyPersonalInfo } });
            setResumeTitle("Untitled Resume");
            setTemplate("clean");
            toast.success("New resume created");
        } catch {
            toast.error("Failed to create resume");
        }
    };

    // Delete resume
    const handleDeleteResume = async (id: string) => {
        try {
            await deleteResume(id);
            setResumes((prev) => prev.filter((r) => r.id !== id));
            if (activeResumeId === id) {
                const remaining = resumes.filter((r) => r.id !== id);
                if (remaining.length > 0) {
                    setActiveResumeId(remaining[0].id!);
                    setData(remaining[0].data);
                    setResumeTitle(remaining[0].title);
                } else {
                    setActiveResumeId(null);
                    setData({ ...emptyResumeData });
                    setResumeTitle("Untitled Resume");
                }
            }
            toast.success("Resume deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    // Switch resume
    const handleSwitchResume = (resume: Resume) => {
        setActiveResumeId(resume.id!);
        setData(resume.data);
        setResumeTitle(resume.title);
        setTemplate(resume.template);
    };

    // --- Section Data Helpers ---
    const updateField = (path: string, value: any) => {
        setData((prev) => {
            const newData = JSON.parse(JSON.stringify(prev));
            const keys = path.split(".");
            let obj = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const addExperience = () => {
        const item: ExperienceItem = { id: generateId(), company: "", role: "", startDate: "", endDate: "", current: false, bullets: [""] };
        setData((prev) => ({ ...prev, experience: [...prev.experience, item] }));
    };

    const removeExperience = (id: string) => {
        setData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
    };

    const addBullet = (expId: string) => {
        setData((prev) => ({
            ...prev,
            experience: prev.experience.map((e) =>
                e.id === expId ? { ...e, bullets: [...e.bullets, ""] } : e
            ),
        }));
    };

    const updateBullet = (expId: string, bulletIdx: number, value: string) => {
        setData((prev) => ({
            ...prev,
            experience: prev.experience.map((e) =>
                e.id === expId
                    ? { ...e, bullets: e.bullets.map((b, i) => (i === bulletIdx ? value : b)) }
                    : e
            ),
        }));
    };

    const removeBullet = (expId: string, bulletIdx: number) => {
        setData((prev) => ({
            ...prev,
            experience: prev.experience.map((e) =>
                e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== bulletIdx) } : e
            ),
        }));
    };

    const addEducation = () => {
        const item: EducationItem = { id: generateId(), school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" };
        setData((prev) => ({ ...prev, education: [...prev.education, item] }));
    };

    const removeEducation = (id: string) => {
        setData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
    };

    const addSkillCategory = () => {
        const item: SkillCategory = { id: generateId(), category: "", skills: [] };
        setData((prev) => ({ ...prev, skills: [...prev.skills, item] }));
    };

    const removeSkillCategory = (id: string) => {
        setData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s.id !== id) }));
    };

    const addProject = () => {
        const item: ProjectItem = { id: generateId(), name: "", description: "", technologies: "", link: "" };
        setData((prev) => ({ ...prev, projects: [...prev.projects, item] }));
    };

    const removeProject = (id: string) => {
        setData((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
    };

    // AI enhance bullet
    const handleEnhanceBullet = async (expId: string, bulletIdx: number) => {
        const exp = data.experience.find((e) => e.id === expId);
        if (!exp || !exp.bullets[bulletIdx]) return;
        const key = `${expId}-${bulletIdx}`;
        setEnhancingId(key);
        try {
            const improved = await enhanceText(exp.bullets[bulletIdx], "bullet");
            updateBullet(expId, bulletIdx, improved);
            toast.success("Bullet point enhanced!");
        } catch {
            toast.error("Enhancement failed");
        } finally {
            setEnhancingId(null);
        }
    };

    // AI enhance summary
    const handleEnhanceSummary = async () => {
        if (!data.summary) return;
        setEnhancingId("summary");
        try {
            const improved = await enhanceText(data.summary, "summary");
            updateField("summary", improved);
            toast.success("Summary enhanced!");
        } catch {
            toast.error("Enhancement failed");
        } finally {
            setEnhancingId(null);
        }
    };

    // --- PDF Export ---
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const margin = 20;
        let y = margin;
        const pageWidth = doc.internal.pageSize.getWidth();
        const contentWidth = pageWidth - margin * 2;

        const checkPageBreak = (needed: number) => {
            if (y + needed > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                y = margin;
            }
        };

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text(data.personalInfo.fullName || "Your Name", margin, y);
        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        const contactParts = [data.personalInfo.title, data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean);
        doc.text(contactParts.join(" | "), margin, y);
        y += 4;
        const linkParts = [data.personalInfo.linkedin, data.personalInfo.website].filter(Boolean);
        if (linkParts.length) { doc.text(linkParts.join(" | "), margin, y); y += 4; }
        doc.setTextColor(0);
        y += 4;

        // Summary
        if (data.summary) {
            doc.setDrawColor(200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("PROFESSIONAL SUMMARY", margin, y);
            y += 6;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
            checkPageBreak(summaryLines.length * 5);
            doc.text(summaryLines, margin, y);
            y += summaryLines.length * 5 + 4;
        }

        // Experience
        if (data.experience.length > 0) {
            doc.setDrawColor(200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("EXPERIENCE", margin, y);
            y += 8;

            data.experience.forEach((exp) => {
                checkPageBreak(30);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text(exp.role || "Role", margin, y);
                const dateStr = `${exp.startDate}${exp.endDate ? ` - ${exp.current ? "Present" : exp.endDate}` : ""}`;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.text(dateStr, pageWidth - margin, y, { align: "right" });
                y += 5;
                doc.setFont("helvetica", "italic");
                doc.text(exp.company || "Company", margin, y);
                y += 6;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                exp.bullets.filter(Boolean).forEach((bullet) => {
                    const lines = doc.splitTextToSize(`• ${bullet}`, contentWidth - 5);
                    checkPageBreak(lines.length * 5);
                    doc.text(lines, margin + 5, y);
                    y += lines.length * 5;
                });
                y += 4;
            });
        }

        // Education
        if (data.education.length > 0) {
            doc.setDrawColor(200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("EDUCATION", margin, y);
            y += 8;

            data.education.forEach((edu) => {
                checkPageBreak(20);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text(`${edu.degree}${edu.field ? ` in ${edu.field}` : ""}`, margin, y);
                const dateStr = `${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ""}`;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.text(dateStr, pageWidth - margin, y, { align: "right" });
                y += 5;
                doc.setFont("helvetica", "italic");
                doc.text(edu.school || "School", margin, y);
                if (edu.gpa) { doc.text(`GPA: ${edu.gpa}`, pageWidth - margin, y, { align: "right" }); }
                y += 8;
            });
        }

        // Skills
        if (data.skills.length > 0) {
            doc.setDrawColor(200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("SKILLS", margin, y);
            y += 8;

            doc.setFontSize(10);
            data.skills.forEach((cat) => {
                checkPageBreak(10);
                doc.setFont("helvetica", "bold");
                doc.text(`${cat.category}: `, margin, y);
                const labelWidth = doc.getTextWidth(`${cat.category}: `);
                doc.setFont("helvetica", "normal");
                doc.text(cat.skills.join(", "), margin + labelWidth, y);
                y += 6;
            });
        }

        // Projects
        if (data.projects.length > 0) {
            doc.setDrawColor(200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("PROJECTS", margin, y);
            y += 8;

            data.projects.forEach((proj) => {
                checkPageBreak(20);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text(proj.name || "Project", margin, y);
                y += 5;
                doc.setFont("helvetica", "normal");
                if (proj.description) {
                    const lines = doc.splitTextToSize(proj.description, contentWidth);
                    doc.text(lines, margin, y);
                    y += lines.length * 5;
                }
                if (proj.technologies) {
                    doc.setFont("helvetica", "italic");
                    doc.setFontSize(9);
                    doc.text(`Tech: ${proj.technologies}`, margin, y);
                    y += 6;
                }
                y += 2;
            });
        }

        doc.save(`${resumeTitle || "Resume"}.pdf`);
        toast.success("PDF exported!");
    };

// --- Section definitions ---
const sections = [
    { id: "personalInfo", label: "Personal Info", icon: User },
    { id: "summary", label: "Summary", icon: AlignLeft },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "projects", label: "Projects", icon: FolderOpen },
];

// Loading state
if (isLoadingResumes) {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-zinc-500 text-sm font-mono">LOADING RESUMES...</p>
            </div>
        </div>
    );
}

// --- PDF Export ---

return (
    <div className="space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Resume Builder</h1>
                <p className="text-zinc-400">Build professional, ATS-friendly resumes.</p>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !activeResumeId}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 border border-white/5 transition-colors disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                </button>
                <button
                    onClick={handleExportPDF}
                    disabled={!activeResumeId}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-900/20 transition-colors disabled:opacity-50"
                >
                    <Download className="w-4 h-4" /> Export PDF
                </button>
            </div>
        </header>

        {/* Resume Selector Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {resumes.map((r) => (
                <button
                    key={r.id}
                    onClick={() => handleSwitchResume(r)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border",
                        activeResumeId === r.id
                            ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
                            : "bg-zinc-900/50 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white"
                    )}
                >
                    <FileText className="w-3.5 h-3.5" />
                    {r.title}
                    <span
                        onClick={(e) => { e.stopPropagation(); handleDeleteResume(r.id!); }}
                        className="ml-1 p-0.5 rounded hover:bg-white/10 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </span>
                </button>
            ))}
            <button
                onClick={handleNewResume}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-zinc-500 hover:text-white border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all whitespace-nowrap"
            >
                <Plus className="w-4 h-4" /> New Resume
            </button>
        </div>

        {!activeResumeId ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                    <FileText className="w-8 h-8 text-zinc-700" />
                </div>
                <p className="text-lg font-bold text-zinc-600 mb-2">No resumes yet</p>
                <p className="text-sm text-zinc-700 mb-6">Create your first resume to get started</p>
                <button onClick={handleNewResume} className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Resume
                </button>
            </div>
        ) : (
            <div className="grid lg:grid-cols-2 gap-6 min-h-[calc(100vh-16rem)]">
                {/* Left: Editor */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                    {/* Resume title */}
                    <div className="px-6 py-4 border-b border-white/5 bg-zinc-950/30">
                        <input
                            type="text"
                            value={resumeTitle}
                            onChange={(e) => setResumeTitle(e.target.value)}
                            className="bg-transparent text-white font-bold text-lg outline-none w-full placeholder:text-zinc-600"
                            placeholder="Resume Title"
                        />
                    </div>

                    {/* Section tabs */}
                    <div className="flex gap-1 px-4 py-3 border-b border-white/5 overflow-x-auto scrollbar-hide">
                        {sections.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
                                    activeSection === s.id
                                        ? "bg-orange-500/10 text-orange-500"
                                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <s.icon className="w-3.5 h-3.5" />
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Section content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {/* Personal Info */}
                        {activeSection === "personalInfo" && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Full Name" value={data.personalInfo.fullName} onChange={(v) => updateField("personalInfo.fullName", v)} placeholder="John Doe" />
                                    <InputField label="Professional Title" value={data.personalInfo.title} onChange={(v) => updateField("personalInfo.title", v)} placeholder="Software Engineer" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Email" value={data.personalInfo.email} onChange={(v) => updateField("personalInfo.email", v)} placeholder="john@example.com" />
                                    <InputField label="Phone" value={data.personalInfo.phone} onChange={(v) => updateField("personalInfo.phone", v)} placeholder="(555) 123-4567" />
                                </div>
                                <InputField label="Location" value={data.personalInfo.location} onChange={(v) => updateField("personalInfo.location", v)} placeholder="San Francisco, CA" />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="LinkedIn" value={data.personalInfo.linkedin} onChange={(v) => updateField("personalInfo.linkedin", v)} placeholder="linkedin.com/in/johndoe" />
                                    <InputField label="Website" value={data.personalInfo.website} onChange={(v) => updateField("personalInfo.website", v)} placeholder="johndoe.com" />
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        {activeSection === "summary" && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Professional Summary</label>
                                    <button
                                        onClick={handleEnhanceSummary}
                                        disabled={!data.summary || enhancingId === "summary"}
                                        className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-500 hover:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg transition-all disabled:opacity-50"
                                    >
                                        {enhancingId === "summary" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        AI Enhance
                                    </button>
                                </div>
                                <textarea
                                    value={data.summary}
                                    onChange={(e) => updateField("summary", e.target.value)}
                                    placeholder="Write a 2-3 sentence professional summary..."
                                    rows={5}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none transition-all"
                                />
                            </div>
                        )}

                        {/* Experience */}
                        {activeSection === "experience" && (
                            <div className="space-y-4">
                                {data.experience.map((exp, ei) => (
                                    <div key={exp.id} className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-zinc-400">Experience {ei + 1}</span>
                                            <button onClick={() => removeExperience(exp.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="Company" value={exp.company} onChange={(v) => updateField(`experience.${ei}.company`, v)} placeholder="Google" />
                                            <InputField label="Role" value={exp.role} onChange={(v) => updateField(`experience.${ei}.role`, v)} placeholder="Software Engineer" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="Start Date" value={exp.startDate} onChange={(v) => updateField(`experience.${ei}.startDate`, v)} placeholder="Jan 2022" />
                                            <InputField label="End Date" value={exp.endDate} onChange={(v) => updateField(`experience.${ei}.endDate`, v)} placeholder="Present" />
                                        </div>

                                        {/* Bullets */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Bullet Points</label>
                                            {exp.bullets.map((bullet, bi) => (
                                                <div key={bi} className="flex items-start gap-2">
                                                    <span className="text-zinc-600 mt-2 text-sm">•</span>
                                                    <textarea
                                                        value={bullet}
                                                        onChange={(e) => updateBullet(exp.id, bi, e.target.value)}
                                                        placeholder="Led cross-functional team to deliver..."
                                                        rows={2}
                                                        className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none"
                                                    />
                                                    <div className="flex flex-col gap-1 mt-1">
                                                        <button
                                                            onClick={() => handleEnhanceBullet(exp.id, bi)}
                                                            disabled={!bullet || enhancingId === `${exp.id}-${bi}`}
                                                            className="p-1.5 text-orange-500 hover:bg-orange-500/10 rounded transition-colors disabled:opacity-30"
                                                            title="AI Enhance"
                                                        >
                                                            {enhancingId === `${exp.id}-${bi}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                        </button>
                                                        <button onClick={() => removeBullet(exp.id, bi)} className="p-1.5 text-zinc-600 hover:text-red-400 rounded transition-colors">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => addBullet(exp.id)} className="text-xs text-zinc-500 hover:text-white font-bold uppercase tracking-wider px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors">
                                                + Add Bullet
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addExperience} className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-wider">
                                    + Add Experience
                                </button>
                            </div>
                        )}

                        {/* Education */}
                        {activeSection === "education" && (
                            <div className="space-y-4">
                                {data.education.map((edu, ei) => (
                                    <div key={edu.id} className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-zinc-400">Education {ei + 1}</span>
                                            <button onClick={() => removeEducation(edu.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <InputField label="School" value={edu.school} onChange={(v) => updateField(`education.${ei}.school`, v)} placeholder="MIT" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="Degree" value={edu.degree} onChange={(v) => updateField(`education.${ei}.degree`, v)} placeholder="B.S." />
                                            <InputField label="Field of Study" value={edu.field} onChange={(v) => updateField(`education.${ei}.field`, v)} placeholder="Computer Science" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <InputField label="Start" value={edu.startDate} onChange={(v) => updateField(`education.${ei}.startDate`, v)} placeholder="2018" />
                                            <InputField label="End" value={edu.endDate} onChange={(v) => updateField(`education.${ei}.endDate`, v)} placeholder="2022" />
                                            <InputField label="GPA" value={edu.gpa} onChange={(v) => updateField(`education.${ei}.gpa`, v)} placeholder="3.8" />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addEducation} className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-wider">
                                    + Add Education
                                </button>
                            </div>
                        )}

                        {/* Skills */}
                        {activeSection === "skills" && (
                            <div className="space-y-4">
                                {data.skills.map((cat, si) => (
                                    <div key={cat.id} className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <InputField label="Category" value={cat.category} onChange={(v) => updateField(`skills.${si}.category`, v)} placeholder="Programming Languages" className="flex-1" />
                                            <button onClick={() => removeSkillCategory(cat.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors ml-3 mt-5">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Skills (comma separated)</label>
                                            <input
                                                type="text"
                                                value={cat.skills.join(", ")}
                                                onChange={(e) => updateField(`skills.${si}.skills`, e.target.value.split(",").map((s) => s.trim()))}
                                                placeholder="JavaScript, TypeScript, React, Node.js"
                                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addSkillCategory} className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-wider">
                                    + Add Skill Category
                                </button>
                            </div>
                        )}

                        {/* Projects */}
                        {activeSection === "projects" && (
                            <div className="space-y-4">
                                {data.projects.map((proj, pi) => (
                                    <div key={proj.id} className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-zinc-400">Project {pi + 1}</span>
                                            <button onClick={() => removeProject(proj.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <InputField label="Project Name" value={proj.name} onChange={(v) => updateField(`projects.${pi}.name`, v)} placeholder="E-Commerce Platform" />
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Description</label>
                                            <textarea
                                                value={proj.description}
                                                onChange={(e) => updateField(`projects.${pi}.description`, e.target.value)}
                                                placeholder="Built a full-stack e-commerce platform with..."
                                                rows={3}
                                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="Technologies" value={proj.technologies} onChange={(v) => updateField(`projects.${pi}.technologies`, v)} placeholder="React, Node.js, MongoDB" />
                                            <InputField label="Link" value={proj.link} onChange={(v) => updateField(`projects.${pi}.link`, v)} placeholder="github.com/..." />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addProject} className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-wider">
                                    + Add Project
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Live Preview */}
                <div className="bg-zinc-200 rounded-3xl p-4 md:p-6 overflow-y-auto shadow-inner max-h-[calc(100vh-16rem)]">
                    <div className="bg-white min-h-[900px] w-full shadow-2xl p-8 md:p-12 text-zinc-900" style={{ fontFamily: '"Georgia", "Times New Roman", Times, serif' }}>
                        {/* Preview Header */}
                        <div className="mb-6 border-b-2 border-zinc-200 pb-6">
                            <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: template === "modern" ? '"Helvetica", sans-serif' : undefined }}>
                                {data.personalInfo.fullName || "Your Name"}
                            </h1>
                            {data.personalInfo.title && (
                                <p className="text-zinc-600 text-sm font-medium mb-2">{data.personalInfo.title}</p>
                            )}
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                                {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                                {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
                                {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
                                {data.personalInfo.linkedin && <span>• {data.personalInfo.linkedin}</span>}
                                {data.personalInfo.website && <span>• {data.personalInfo.website}</span>}
                            </div>
                        </div>

                        {/* Preview Summary */}
                        {data.summary && (
                            <div className="mb-5">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 border-b border-zinc-100 pb-1">Professional Summary</h2>
                                <p className="text-sm leading-relaxed text-zinc-700">{data.summary}</p>
                            </div>
                        )}

                        {/* Preview Experience */}
                        {data.experience.length > 0 && (
                            <div className="mb-5">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 border-b border-zinc-100 pb-1">Experience</h2>
                                <div className="space-y-4">
                                    {data.experience.map((exp) => (
                                        <div key={exp.id}>
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h3 className="font-bold text-sm">{exp.role || "Role"}</h3>
                                                <span className="text-xs text-zinc-400">
                                                    {exp.startDate}{exp.endDate ? ` — ${exp.current ? "Present" : exp.endDate}` : ""}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 font-medium italic mb-1.5">{exp.company || "Company"}</p>
                                            <ul className="list-disc list-outside ml-4 space-y-0.5">
                                                {exp.bullets.filter(Boolean).map((b, i) => (
                                                    <li key={i} className="text-xs text-zinc-700 leading-relaxed">{b}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preview Education */}
                        {data.education.length > 0 && (
                            <div className="mb-5">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 border-b border-zinc-100 pb-1">Education</h2>
                                <div className="space-y-3">
                                    {data.education.map((edu) => (
                                        <div key={edu.id} className="flex justify-between items-baseline">
                                            <div>
                                                <p className="font-bold text-sm">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                                                <p className="text-xs text-zinc-500 italic">{edu.school}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-zinc-400">{edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}</span>
                                                {edu.gpa && <p className="text-xs text-zinc-400">GPA: {edu.gpa}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preview Skills */}
                        {data.skills.length > 0 && (
                            <div className="mb-5">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 border-b border-zinc-100 pb-1">Skills</h2>
                                <div className="space-y-1.5">
                                    {data.skills.map((cat) => (
                                        <div key={cat.id} className="text-xs text-zinc-700">
                                            <span className="font-bold">{cat.category}: </span>
                                            {cat.skills.join(", ")}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preview Projects */}
                        {data.projects.length > 0 && (
                            <div className="mb-5">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 border-b border-zinc-100 pb-1">Projects</h2>
                                <div className="space-y-3">
                                    {data.projects.map((proj) => (
                                        <div key={proj.id}>
                                            <h3 className="font-bold text-sm">{proj.name || "Project"}</h3>
                                            {proj.description && <p className="text-xs text-zinc-700 leading-relaxed mt-0.5">{proj.description}</p>}
                                            {proj.technologies && <p className="text-xs text-zinc-500 italic mt-0.5">Tech: {proj.technologies}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!data.summary && data.experience.length === 0 && data.education.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-300">
                                <FileText className="w-12 h-12 mb-4" />
                                <p className="font-bold">Start filling in your details</p>
                                <p className="text-sm text-zinc-400 mt-1">Your resume preview will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
);
}
