"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Building2, Loader2, CheckCircle2, GraduationCap, Users, Mail, Phone, Globe, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Custom Dropdown ─────────────────────────────────── */

function CustomSelect({
    value,
    onChange,
    options,
    placeholder,
    required,
}: {
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder: string;
    required?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative w-full">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`w-full bg-black/20 border rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${open ? "border-indigo-500/50 ring-2 ring-indigo-500/20" : "border-white/10 hover:border-white/20"
                    } ${value ? "text-white" : "text-zinc-500"}`}
            >
                <span>{value || placeholder}</span>
                <ChevronDown
                    className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-1.5 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
                    >
                        {options.map((opt) => (
                            <li key={opt}>
                                <button
                                    type="button"
                                    onClick={() => { onChange(opt); setOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 transition-colors duration-150 ${value === opt
                                            ? "bg-indigo-600/20 text-indigo-300"
                                            : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                        }`}
                                >
                                    {opt}
                                    {value === opt && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>

            {/* Hidden native input for form required validation */}
            {required && (
                <input
                    tabIndex={-1}
                    required
                    value={value}
                    onChange={() => { }}
                    className="absolute inset-0 opacity-0 h-0 w-0 pointer-events-none"
                    aria-hidden
                />
            )}
        </div>
    );
}

/* ─── Data ────────────────────────────────────────────── */

const programTypes = [
    "University / College",
    "Bootcamp / Coding School",
    "MBA Program",
    "Community College",
    "Workforce Development",
    "Other",
];

const studentRanges = [
    "Under 100",
    "100 – 500",
    "500 – 1,000",
    "1,000 – 5,000",
    "5,000+",
];

/* ─── Page ───────────────────────────────────────────── */

export default function RequestDemoPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        jobTitle: "",
        institutionName: "",
        programType: "",
        studentRange: "",
        website: "",
        message: "",
    });

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const setField = (field: string) => (val: string) =>
        setForm((prev) => ({ ...prev, [field]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.programType || !form.studentRange) {
            toast.error("Please select a program type and student range.");
            return;
        }
        setLoading(true);
        try {
            await addDoc(collection(db, "demo_requests"), {
                ...form,
                createdAt: serverTimestamp(),
            });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 blur-[160px] rounded-full -z-10" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-lg"
                >
                    <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">We&apos;ll be in touch soon!</h1>
                    <p className="text-zinc-400 leading-relaxed mb-8">
                        Thanks for your interest in JobPeel for{" "}
                        <span className="text-white font-medium">{form.institutionName}</span>. Our team will reach out to{" "}
                        <span className="text-white font-medium">{form.email}</span> within 1–2 business days to schedule your demo.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
                    >
                        Back to Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/8 blur-[150px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/5 blur-[120px] rounded-full -z-10" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] -z-10" />

            <div className="max-w-6xl mx-auto px-6 py-16">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm mb-12">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="grid lg:grid-cols-[1fr_1.6fr] gap-16 items-start">

                    {/* Left: Pitch */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:sticky lg:top-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <Building2 className="w-3.5 h-3.5" />
                            For Career Programs
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
                            See JobPeel in action for your program.
                        </h1>
                        <p className="text-zinc-400 text-lg leading-relaxed mb-10">
                            Schedule a personalized demo and we&apos;ll show you exactly how JobPeel can scale your career center — from student tooling to placement analytics.
                        </p>

                        <div className="space-y-5">
                            {[
                                {
                                    icon: <GraduationCap className="w-5 h-5 text-indigo-400" />,
                                    title: "Built for programs like yours",
                                    desc: "Whether you have 50 or 5,000 students, we tailor the setup to your program's workflow.",
                                },
                                {
                                    icon: <Users className="w-5 h-5 text-indigo-400" />,
                                    title: "Dedicated onboarding",
                                    desc: "We handle setup, training, and configuration. Your team is live in days, not months.",
                                },
                                {
                                    icon: <CheckCircle2 className="w-5 h-5 text-indigo-400" />,
                                    title: "Proven placement outcomes",
                                    desc: "Partner programs see an average 18% increase in placement rates within one semester.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
                                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white mb-1">{item.title}</p>
                                        <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <div className="bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-2">Request Your Demo</h2>
                            <p className="text-sm text-zinc-500 mb-8">We&apos;ll reach out within 1–2 business days.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Name Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={form.firstName}
                                            onChange={set("firstName")}
                                            required
                                            placeholder="Jane"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-zinc-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={form.lastName}
                                            onChange={set("lastName")}
                                            required
                                            placeholder="Smith"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-zinc-600"
                                        />
                                    </div>
                                </div>

                                {/* Work Email */}
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Work Email</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={set("email")}
                                            required
                                            placeholder="jane@university.edu"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-zinc-600"
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    </div>
                                </div>

                                {/* Phone + Title */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                            Phone <span className="text-zinc-700 normal-case font-normal">(optional)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={set("phone")}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-zinc-600"
                                            />
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Your Title</label>
                                        <input
                                            type="text"
                                            value={form.jobTitle}
                                            onChange={set("jobTitle")}
                                            required
                                            placeholder="Career Director"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-zinc-600"
                                        />
                                    </div>
                                </div>

                                {/* Institution Name */}
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Institution Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={form.institutionName}
                                            onChange={set("institutionName")}
                                            required
                                            placeholder="University of Texas at Austin"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-zinc-600"
                                        />
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    </div>
                                </div>

                                {/* Program Type + Students — Custom dropdowns */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Program Type</label>
                                        <CustomSelect
                                            value={form.programType}
                                            onChange={setField("programType")}
                                            options={programTypes}
                                            placeholder="Select type..."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Students / Year</label>
                                        <CustomSelect
                                            value={form.studentRange}
                                            onChange={setField("studentRange")}
                                            options={studentRanges}
                                            placeholder="Select range..."
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Website */}
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                        Program Website <span className="text-zinc-700 normal-case font-normal">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={form.website}
                                            onChange={set("website")}
                                            placeholder="https://careers.university.edu"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-zinc-600"
                                        />
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                        Anything else? <span className="text-zinc-700 normal-case font-normal">(optional)</span>
                                    </label>
                                    <textarea
                                        value={form.message}
                                        onChange={set("message")}
                                        rows={3}
                                        placeholder="Tell us about your program's biggest pain points or what you're hoping to solve..."
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-zinc-600 resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Demo →"}
                                </button>

                                <p className="text-center text-xs text-zinc-600">
                                    No commitment required. We respond within 1–2 business days.
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
