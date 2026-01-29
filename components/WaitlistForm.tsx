"use client";

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const WaitlistForm = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        programName: '',
        contactName: '',
        workEmail: '',
        programType: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, "jobpeel_waitlist"), {
                program_name: formData.programName,
                contact_name: formData.contactName,
                work_email: formData.workEmail,
                program_type: formData.programType,
                status: "pending",
                created_at: serverTimestamp()
            });

            // Trigger Welcome Email
            await fetch('/api/waitlist/welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.workEmail,
                    name: formData.contactName
                })
            });

            setSuccess(true);
            toast.success("Application submitted successfully!");
        } catch (error) {
            console.error("Error submitting form: ", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-zinc-900/50 border border-green-500/20 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-green-500/10 rounded-full border border-green-500/20">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Application Received</h3>
                <p className="text-zinc-400">
                    Thanks for applying to the JobPeel pilot. We'll be in touch with {formData.workEmail} shortly.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            <div>
                <label htmlFor="programName" className="block text-sm font-medium text-zinc-400 mb-1">
                    Program / Institution Name
                </label>
                <input
                    type="text"
                    id="programName"
                    name="programName"
                    required
                    value={formData.programName}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-sans"
                    placeholder="e.g. University of Tech"
                />
            </div>

            <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-zinc-400 mb-1">
                    Contact Name
                </label>
                <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    required
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-sans"
                    placeholder="Jane Doe"
                />
            </div>

            <div>
                <label htmlFor="workEmail" className="block text-sm font-medium text-zinc-400 mb-1">
                    Work Email
                </label>
                <input
                    type="email"
                    id="workEmail"
                    name="workEmail"
                    required
                    value={formData.workEmail}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-sans"
                    placeholder="jane@university.edu"
                />
            </div>

            <div>
                <label htmlFor="programType" className="block text-sm font-medium text-zinc-400 mb-1">
                    Program Type
                </label>
                <div className="relative">
                    <select
                        id="programType"
                        name="programType"
                        required
                        value={formData.programType}
                        onChange={handleChange}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none font-sans"
                    >
                        <option value="" disabled>Select a type...</option>
                        <option value="University">University</option>
                        <option value="Bootcamp">Bootcamp</option>
                        <option value="Non-Profit">Non-Profit</option>
                        <option value="Government">Government</option>
                        <option value="Other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    "Apply for the pilot"
                )}
            </button>

            <p className="text-center text-xs text-zinc-500 mt-4">
                Limited spots available for the initial cohort.
            </p>
        </form>
    );
};
