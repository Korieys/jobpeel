"use client";

<<<<<<< HEAD
import { User, Bell, Shield, Mail, CreditCard, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
=======
import { User, Bell, Shield, Smartphone, Mail, CreditCard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d

export default function SettingsPage() {
    const { user, userProfile, updateUserProfile } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
<<<<<<< HEAD
    const [saving, setSaving] = useState(false);

    // Local form state — only writes to Firestore on save
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        bio: "",
    });

    // Populate form when profile loads
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

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUserProfile(form);
            toast.success("Profile updated!");
        } catch {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const hasChanges =
        form.firstName !== (userProfile?.firstName || "") ||
        form.lastName !== (userProfile?.lastName || "") ||
        form.phoneNumber !== (userProfile?.phoneNumber || "") ||
        form.bio !== (userProfile?.bio || "");
=======
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "account", label: "Account", icon: Shield },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "billing", label: "Billing", icon: CreditCard },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Settings</h1>
                <p className="text-zinc-400">Manage your account preferences and subscription.</p>
            </header>

            <div className="grid md:grid-cols-[240px_1fr] gap-8">
                {/* Sidebar */}
                <div className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-zinc-800 text-white shadow-lg border border-white/5"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-orange-500" : ""}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 min-h-[500px]">
                    {activeTab === "profile" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Public Profile</h3>
                                <p className="text-sm text-zinc-500 mb-6">Manage how others view your profile.</p>

                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-white/10 flex items-center justify-center text-2xl font-bold text-zinc-500 overflow-hidden">
                                            {user?.photoURL ? (
                                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
<<<<<<< HEAD
                                                (form.firstName?.[0] || "") + (form.lastName?.[0] || user?.email?.[0]?.toUpperCase() || "U")
=======
                                                (userProfile?.firstName?.[0] || "") + (userProfile?.lastName?.[0] || user?.email?.[0]?.toUpperCase() || "U")
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
                                            )}
                                        </div>
                                        <button className="absolute bottom-0 right-0 p-2 bg-orange-600 rounded-full text-white hover:bg-orange-500 transition-colors shadow-lg border border-zinc-950">
                                            <User className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">First Name</label>
                                                <input
                                                    type="text"
<<<<<<< HEAD
                                                    value={form.firstName}
                                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
=======
                                                    defaultValue={userProfile?.firstName || ""}
                                                    onChange={(e) => updateUserProfile({ firstName: e.target.value })}
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
                                                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white w-full focus:outline-none focus:border-orange-500/50 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Last Name</label>
                                                <input
                                                    type="text"
<<<<<<< HEAD
                                                    value={form.lastName}
                                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
=======
                                                    defaultValue={userProfile?.lastName || ""}
                                                    onChange={(e) => updateUserProfile({ lastName: e.target.value })}
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
                                                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white w-full focus:outline-none focus:border-orange-500/50 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Phone Number</label>
                                            <input
                                                type="tel"
<<<<<<< HEAD
                                                value={form.phoneNumber}
                                                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
=======
                                                defaultValue={userProfile?.phoneNumber || ""}
                                                onChange={(e) => updateUserProfile({ phoneNumber: e.target.value })}
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
                                                className="bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white w-full focus:outline-none focus:border-orange-500/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Bio</label>
                                        <textarea
                                            rows={4}
<<<<<<< HEAD
                                            value={form.bio}
                                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
=======
                                            defaultValue={userProfile?.bio || ""}
                                            onChange={(e) => updateUserProfile({ bio: e.target.value })}
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </div>
<<<<<<< HEAD

                                {/* Save Button */}
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={handleSave}
                                        disabled={!hasChanges || saving}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${hasChanges
                                            ? "bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-900/30"
                                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                            }`}
                                    >
                                        <Check className="w-4 h-4" />
                                        {saving ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
                                    </button>
                                </div>
=======
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
                            </div>
                        </div>
                    )}

                    {activeTab === "account" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Account Security</h3>
                                <p className="text-sm text-zinc-500 mb-6">Manage your login preferences.</p>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl border border-white/5 bg-black/20 flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-medium">Email Address</p>
                                            <p className="text-sm text-zinc-500">{user?.email}</p>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20">
                                            Verified
                                        </div>
                                    </div>

                                    <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors text-sm font-bold">
                                        Reset Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Notification Preferences</h3>
                                <p className="text-sm text-zinc-500 mb-6">Choose how we communicate with you.</p>

                                <div className="space-y-4">
                                    {["Product Updates", "New Features", "Security Alerts"].map((item) => (
                                        <div key={item} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                    <Mail className="w-5 h-5 text-zinc-500" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{item}</p>
                                                    <p className="text-xs text-zinc-500">Receive emails about {item.toLowerCase()}</p>
                                                </div>
                                            </div>
                                            <div className="w-12 h-6 bg-orange-600 rounded-full relative cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "billing" && (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-6 border border-white/5">
                                <CreditCard className="w-8 h-8 text-zinc-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Free Plan</h3>
                            <p className="text-zinc-500 max-w-xs mb-8">You are currently on the free tier. Upgrade to unlock premium features.</p>
                            <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">
                                Upgrade to Pro
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
