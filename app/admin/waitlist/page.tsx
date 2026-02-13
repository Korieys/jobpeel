"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';
import { Loader2, Check, User, Mail, School, ShieldCheck } from 'lucide-react';

interface WaitlistUser {
    id: string;
    contact_name: string;
    work_email: string;
    program_name: string;
    program_type: string;
    status: string;
    created_at: any;
}

export default function AdminWaitlistPage() {
    const [users, setUsers] = useState<WaitlistUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchWaitlist();
    }, []);

    const fetchWaitlist = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "jobpeel_waitlist"),
                where("status", "==", "pending"),
                orderBy("created_at", "desc")
            );
            const querySnapshot = await getDocs(q);
            const loadedUsers: WaitlistUser[] = [];
            querySnapshot.forEach((doc) => {
                loadedUsers.push({ id: doc.id, ...doc.data() } as WaitlistUser);
            });
            setUsers(loadedUsers);
        } catch (error) {
            console.error("Error fetching waitlist:", error);
            toast.error("Failed to load waitlist.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (user: WaitlistUser) => {
        setProcessingId(user.id);
        try {
            // 1. Update Firestore
            const userRef = doc(db, "jobpeel_waitlist", user.id);
            await updateDoc(userRef, { status: "approved" });

            // 2. Send Email
            const response = await fetch('/api/waitlist/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.work_email,
                    name: user.contact_name,
                    uid: user.id
                })
            });

            if (!response.ok) throw new Error("Failed to send email");

            toast.success(`Approved ${user.contact_name}`);

            // Remove from local list
            setUsers(prev => prev.filter(u => u.id !== user.id));

        } catch (error) {
            console.error("Approval error:", error);
            toast.error("Approval failed.", { description: "Database updated but email might have failed." });
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Waitlist Management</h1>
                        <p className="text-zinc-500">Review and approve access for pilot users.</p>
                    </div>
                    <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-white/10">
                        <span className="text-orange-500 font-bold">{users.length}</span> Pending
                    </div>
                </div>

                {users.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-white/5">
                        <ShieldCheck className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-zinc-400">All caught up!</h3>
                        <p className="text-zinc-600">No pending waitlist requests.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {users.map((user) => (
                            <div key={user.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-orange-500/20 transition-all">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        {user.program_name}
                                        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-white/5">
                                            {user.program_type}
                                        </span>
                                    </h3>

                                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-zinc-400">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            {user.contact_name}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {user.work_email}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleApprove(user)}
                                    disabled={processingId === user.id}
                                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
                                >
                                    {processingId === user.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Approve
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
