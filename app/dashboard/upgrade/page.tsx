"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Zap, CheckCircle, Crown, Sparkles, Building2, Lock, ArrowRight, Star
} from "lucide-react";
import { toast } from "sonner";

const FREE_TIER_LIMIT = 10;

const TIERS = [
    {
        id: "free",
        name: "Free",
        price: { monthly: 0, annual: 0 },
        description: "Get started and see what JobPeel can do.",
        icon: Zap,
        color: "zinc",
        features: [
            "10 cover letter generations",
            "Job scanner (URL + paste)",
            "Resume upload & parsing",
            "Basic interview prep",
            "Application tracker",
        ],
        cta: "Current Plan",
        ctaDisabled: true,
        highlight: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: { monthly: 12, annual: 9 },
        description: "Unlimited generation power for active job seekers.",
        icon: Crown,
        color: "orange",
        features: [
            "Unlimited cover letter generations",
            "Priority AI processing",
            "Advanced tone & style controls",
            "Resume optimizer (coming soon)",
            "Custom templates (coming soon)",
            "Priority support",
        ],
        cta: "Upgrade to Pro",
        ctaDisabled: false,
        highlight: true,
        badge: "Most Popular",
    },
    {
        id: "university",
        name: "University",
        price: { monthly: null, annual: null },
        description: "Bulk access for career centers and academic programs.",
        icon: Building2,
        color: "indigo",
        features: [
            "Everything in Pro",
            "All students get unlimited access",
            "Career center admin dashboard",
            "Analytics & reporting",
            "Dedicated onboarding",
            "Custom branding (coming soon)",
        ],
        cta: "Contact Us",
        ctaDisabled: false,
        highlight: false,
    },
];

const COLOR_MAP: Record<string, {
    badge: string; border: string; icon: string; cta: string; glow: string; ring: string;
}> = {
    zinc: {
        badge: "bg-zinc-800 text-zinc-400 border-zinc-700",
        border: "border-white/5",
        icon: "text-zinc-400 bg-zinc-800 border-zinc-700",
        cta: "bg-zinc-800 text-zinc-400 cursor-not-allowed",
        glow: "",
        ring: "",
    },
    orange: {
        badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        border: "border-orange-500/30",
        icon: "text-orange-400 bg-orange-500/10 border-orange-500/20",
        cta: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white",
        glow: "shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)]",
        ring: "ring-1 ring-orange-500/20",
    },
    indigo: {
        badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        border: "border-indigo-500/20",
        icon: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        cta: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white",
        glow: "",
        ring: "",
    },
};

export default function UpgradePage() {
    const { user, userProfile } = useAuth();
    const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const generationsUsed = userProfile?.generationsUsed ?? 0;
    const isUniversityUser = userProfile?.isUniversityUser ?? false;
    const currentPlan = isUniversityUser ? "university" : "free";

    const handleUpgrade = async (tierId: string) => {
        if (tierId === "free") return;
        if (tierId === "university") {
            window.location.href = "mailto:hello@jobpeel.co?subject=University Plan Inquiry";
            return;
        }

        setLoadingTier(tierId);
        try {
            // Stripe checkout session will be created here once keys are provided
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tier: tierId,
                    billing,
                    userId: user?.uid,
                    email: user?.email,
                }),
            });

            if (!res.ok) throw new Error("Checkout failed");
            const { url } = await res.json();
            window.location.href = url;
        } catch (e) {
            toast.error("Checkout unavailable", { description: "Stripe is not yet configured. Please try again soon." });
        } finally {
            setLoadingTier(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="text-center max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <Sparkles className="w-5 h-5 text-orange-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-orange-400">JobPeel Plans</span>
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
                    Supercharge your job search
                </h1>
                <p className="text-zinc-400 text-base">
                    Generate unlimited cover letters, land more interviews, and track every application — all in one place.
                </p>
            </header>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3">
                <span className={cn("text-sm font-medium transition-colors", billing === "monthly" ? "text-white" : "text-zinc-500")}>Monthly</span>
                <button
                    onClick={() => setBilling(b => b === "monthly" ? "annual" : "monthly")}
                    className={cn(
                        "relative w-12 h-6 rounded-full transition-colors border",
                        billing === "annual" ? "bg-orange-500/20 border-orange-500/30" : "bg-zinc-800 border-white/10"
                    )}
                >
                    <div className={cn(
                        "absolute top-0.5 w-5 h-5 rounded-full transition-all",
                        billing === "annual" ? "left-6 bg-orange-400" : "left-0.5 bg-zinc-500"
                    )} />
                </button>
                <span className={cn("text-sm font-medium transition-colors flex items-center gap-1.5", billing === "annual" ? "text-white" : "text-zinc-500")}>
                    Annual
                    <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full">Save 25%</span>
                </span>
            </div>

            {/* Usage Notice for free B2C users */}
            {!isUniversityUser && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "max-w-md mx-auto flex items-center justify-between gap-4 px-4 py-3 rounded-xl border text-sm",
                        generationsUsed >= FREE_TIER_LIMIT
                            ? "bg-red-900/20 border-red-500/20 text-red-300"
                            : "bg-zinc-900/50 border-white/5 text-zinc-400"
                    )}
                >
                    <div className="flex items-center gap-2">
                        {generationsUsed >= FREE_TIER_LIMIT
                            ? <Lock className="w-4 h-4 text-red-400 shrink-0" />
                            : <Zap className="w-4 h-4 text-orange-400 shrink-0" />}
                        <span>
                            {generationsUsed >= FREE_TIER_LIMIT
                                ? "You've hit your free limit. Upgrade to keep going."
                                : `${generationsUsed} of ${FREE_TIER_LIMIT} free generations used.`}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full", generationsUsed >= FREE_TIER_LIMIT ? "bg-red-500" : "bg-orange-500")}
                                style={{ width: `${Math.min((generationsUsed / FREE_TIER_LIMIT) * 100, 100)}%` }}
                            />
                        </div>
                        <span className="text-xs font-mono text-zinc-600">{generationsUsed}/{FREE_TIER_LIMIT}</span>
                    </div>
                </motion.div>
            )}

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                {TIERS.map((tier, i) => {
                    const colors = COLOR_MAP[tier.color];
                    const isCurrentPlan = tier.id === currentPlan;
                    const Icon = tier.icon;
                    const price = billing === "annual" ? tier.price.annual : tier.price.monthly;
                    const isLoading = loadingTier === tier.id;

                    return (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className={cn(
                                "relative flex flex-col bg-zinc-900/50 border rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px]",
                                colors.border,
                                colors.glow,
                                colors.ring,
                                tier.highlight && "bg-zinc-900/80"
                            )}
                        >
                            {tier.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border flex items-center gap-1", colors.badge)}>
                                        <Star className="w-2.5 h-2.5" />
                                        {tier.badge}
                                    </span>
                                </div>
                            )}

                            {/* Icon + Name */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className={cn("p-2.5 rounded-xl border", colors.icon)}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-base">{tier.name}</p>
                                    <p className="text-xs text-zinc-500">{tier.description}</p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                {price === null ? (
                                    <p className="text-2xl font-bold text-white">Custom pricing</p>
                                ) : price === 0 ? (
                                    <p className="text-4xl font-bold text-white">Free</p>
                                ) : (
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-bold text-white">${price}</span>
                                        <span className="text-zinc-500 text-sm mb-1.5">/month</span>
                                    </div>
                                )}
                                {billing === "annual" && price !== null && price > 0 && (
                                    <p className="text-xs text-green-400 mt-1">Billed ${price * 12}/year</p>
                                )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-2.5 flex-1 mb-6">
                                {tier.features.map((feat) => (
                                    <li key={feat} className="flex items-start gap-2.5 text-sm text-zinc-300">
                                        <CheckCircle className={cn("w-4 h-4 mt-0.5 shrink-0", tier.color === "orange" ? "text-orange-400" : tier.color === "indigo" ? "text-indigo-400" : "text-zinc-600")} />
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            {isCurrentPlan ? (
                                <div className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-widest rounded-xl bg-white/5 text-zinc-500 border border-white/5">
                                    Current Plan
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade(tier.id)}
                                    disabled={tier.ctaDisabled || isLoading}
                                    className={cn(
                                        "w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                        colors.cta,
                                        isLoading && "opacity-70 cursor-wait"
                                    )}
                                >
                                    {isLoading ? (
                                        <span className="animate-pulse">Redirecting...</span>
                                    ) : (
                                        <>
                                            {tier.cta}
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* FAQ / Trust Line */}
            <p className="text-center text-xs text-zinc-600 mt-6">
                Secure payments via Stripe · Cancel anytime · No hidden fees
            </p>
        </div>
    );
}
