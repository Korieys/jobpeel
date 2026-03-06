import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

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
                className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${open ? "border-orange-500/50 ring-2 ring-orange-500/20" : "border-white/10 hover:border-white/20"
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
                        className="absolute z-50 w-full mt-1.5 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden max-h-48 overflow-y-auto"
                    >
                        {options.map((opt) => (
                            <li key={opt}>
                                <button
                                    type="button"
                                    onClick={() => { onChange(opt); setOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-2 transition-colors duration-150 ${value === opt
                                        ? "bg-orange-600/20 text-orange-400"
                                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                        }`}
                                >
                                    {opt}
                                    {value === opt && <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
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

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const { user, userProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
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
        if (!user) {
            toast.error("You must be logged in to send a request.");
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, "contact_messages"), {
                userId: user.uid,
                email: user.email,
                name: userProfile ? `${userProfile.firstName} ${userProfile.lastName}`.trim() : "Unknown",
                ...form,
                status: "unread",
                createdAt: new Date().toISOString()
            });

            toast.success("Request sent successfully!", {
                description: "We'll get back to you within 1-2 business days."
            });
            setForm({
                phone: "",
                jobTitle: "",
                institutionName: "",
                programType: "",
                studentRange: "",
                website: "",
                message: "",
            });
            onClose();
        } catch (error) {
            console.error("Error sending request:", error);
            toast.error("Failed to send request", {
                description: "Please try again later or email us directly at team@JobPeel.com"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-white">University Inquiry</h2>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        Fill out the details below, or email <span className="text-orange-400 font-medium">team@JobPeel.com</span>
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">

                                {/* Phone + Title */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                            Phone <span className="text-zinc-700 normal-case font-normal">(optional)</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={set("phone")}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-zinc-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Your Title</label>
                                        <input
                                            type="text"
                                            value={form.jobTitle}
                                            onChange={set("jobTitle")}
                                            required
                                            placeholder="Career Director"
                                            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-zinc-600"
                                        />
                                    </div>
                                </div>

                                {/* Institution Name */}
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Institution Name</label>
                                    <input
                                        type="text"
                                        value={form.institutionName}
                                        onChange={set("institutionName")}
                                        required
                                        placeholder="University of Texas at Austin"
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Program Type + Students */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="z-20">
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Program Type</label>
                                        <CustomSelect
                                            value={form.programType}
                                            onChange={setField("programType")}
                                            options={programTypes}
                                            placeholder="Select type..."
                                            required
                                        />
                                    </div>
                                    <div className="z-10">
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
                                    <input
                                        type="url"
                                        value={form.website}
                                        onChange={set("website")}
                                        placeholder="https://careers.university.edu"
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-zinc-600"
                                    />
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
                                        placeholder="Tell us about your program's biggest pain points..."
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-zinc-600 resize-none"
                                    />
                                </div>

                                {/* Footer Actions */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-white/5">
                                    <p className="text-xs text-zinc-600">
                                        We typically respond within 1–2 business days.
                                    </p>
                                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 w-full sm:w-auto text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || !form.programType || !form.studentRange}
                                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Send Request
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
