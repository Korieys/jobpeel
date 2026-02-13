"use client";

import { useState, useEffect } from "react";
import { User, Bell, Shield, Smartphone, Mail, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { user, userProfile, updateUserProfile } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [saving, setSaving] = useState(false);

    // Local form state to track changes
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        bio: "",
    });

    // Load initial data
    useEffect(() => {
        if (userProfile) {
            setForm({
                firstName: userProfile.firstName || "",
                lastName: userProfile.lastName || "",
                phoneNumber: userProfile.phoneNumber || "",
                bio: userProfile.bio || "",
            });
        }
    }, [userProfile]);

    const hasChanges =
        form.firstName !== (userProfile?.firstName || "") ||
        form.lastName !== (userProfile?.lastName || "") ||
        form.phoneNumber !== (userProfile?.phoneNumber || "") ||
        form.bio !== (userProfile?.bio || "");

    const handleSave = async () => {
        if (!hasChanges) return;
        setSaving(true);
        try {
            await updateUserProfile(form);
            toast.success("Profile updated successfully");
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
        { id: "billing", label: "Billing", icon: CreditCard },
    ];

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Settings</h1>
                <p className="text-zinc-400">Manage your account preferences and settings.</p>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <nav className="w-full md:w-64 flex-shrink-0 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                                activeTab === tab.id
                                    ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {activeTab === "profile" && (
                        <div className="space-y-6 max-w-2xl">
                            {/* Profile Picture */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                                <h2 className="text-lg font-bold text-white mb-6">Profile Picture</h2>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white ring-4 ring-black">
                                        {user?.photoURL ? (
                                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            (form.firstName?.[0] || "") + (form.lastName?.[0] || user?.email?.[0]?.toUpperCase() || "U")
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <button className="px-4 py-2 bg-white text-zinc-950 font-bold rounded-xl text-sm hover:bg-zinc-200 transition-colors">
                                            Change Photo
                                        </button>
                                        <p className="text-xs text-zinc-500">JPG, GIF or PNG. 1MB max.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 space-y-4">
                                <h2 className="text-lg font-bold text-white mb-2">Personal Information</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">First Name</label>
                                        <input
                                            type="text"
                                            value={form.firstName}
                                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Last Name</label>
                                        <input
                                            type="text"
                                            value={form.lastName}
                                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <input
                                            type="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Phone Number</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <input
                                            type="tel"
                                            value={form.phoneNumber}
                                            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Bio</label>
                                    <textarea
                                        value={form.bio}
                                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                        rows={3}
                                        placeholder="Tell us a bit about yourself..."
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={!hasChanges || saving}
                                    className={cn(
                                        "px-6 py-3 rounded-xl font-bold text-sm transition-all",
                                        hasChanges && !saving
                                            ? "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20 hover:scale-[1.02] active:scale-[0.98]"
                                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                    )}
                                >
                                    {saving ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/50 border border-white/5 rounded-3xl">
                            <Bell className="w-12 h-12 text-zinc-700 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Notifications</h3>
                            <p className="text-zinc-500 text-sm max-w-md">
                                Notification preferences coming soon. You'll be able to control email and push notifications here.
                            </p>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/50 border border-white/5 rounded-3xl">
                            <Shield className="w-12 h-12 text-zinc-700 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Security</h3>
                            <p className="text-zinc-500 text-sm max-w-md">
                                Security settings coming soon. You'll be able to manage your password and 2FA here.
                            </p>
                        </div>
                    )}

                    {activeTab === "billing" && (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/50 border border-white/5 rounded-3xl">
                            <CreditCard className="w-12 h-12 text-zinc-700 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Billing</h3>
                            <p className="text-zinc-500 text-sm max-w-md">
                                Billing management coming soon. You'll be able to view invoices and manage your subscription.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
