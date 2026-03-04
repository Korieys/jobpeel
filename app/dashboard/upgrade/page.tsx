"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Zap, CheckCircle, Crown, Sparkles, Building2, Lock, ArrowRight, Star, Shield
} from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

const FREE_TIER_LIMIT = 10;

const TIERS = [
    {
        id: "free",
        name: "Free",
        price: { monthly: 0, annual: 0 },
        description: "Get started and explore the platform.",
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
        id: "standard",
        name: "Standard",
        price: { monthly: 9, annual: 7 },
        description: "Everything you need to run an active job search.",
        icon: Shield,
        color: "orange",
        features: [
            "Unlimited cover letter generations",
            "Job scanner (URL + paste)",
            "Resume upload & parsing",
            "Interview prep",
            "Application tracker",
            "Email support",
        ],
        cta: "Get Standard",
        ctaDisabled: false,
        highlight: false,
        badge: null,
    },
    {
        id: "pro",
        name: "Pro",
        price: { monthly: 19, annual: 14 },
        description: "Maximum power for serious job seekers.",
        icon: Crown,
        color: "gold",
        features: [
            "Everything in Standard",
            "Priority AI processing",
            "Advanced tone & style controls",
            "Resume optimizer",
            "Custom templates (coming soon)",
            "Priority support",
        ],
        cta: "Get Pro",
        ctaDisabled: false,
        highlight: true,
        badge: "Most Popular",
    },
    {
        id: "university",
        name: "University",
        price: { monthly: null, annual: null },
        description: "Bulk access for career centers & programs.",
        icon: Building2,
        color: "indigo",
        features: [
            "Everything in Pro",
            "All students get unlimited access",
            "Career center admin dashboard",
            "Analytics & reporting",
            "Dedicated onboarding",
        ],
        cta: "Contact Us",
        ctaDisabled: false,
        highlight: false,
    },
];

const COLOR_MAP: Record<string, {
    badge: string; border: string; icon: string; cta: string; glow: string; ring: string; check: string;
}> = {
    zinc: {
        badge: "bg-zinc-800 text-zinc-400 border-zinc-700",
        border: "border-white/5",
        icon: "text-zinc-400 bg-zinc-800 border-zinc-700",
        cta: "bg-zinc-800 text-zinc-400 cursor-not-allowed",
        glow: "",
        ring: "",
        check: "text-zinc-600",
    },
    orange: {
        badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        border: "border-orange-500/20",
        icon: "text-orange-400 bg-orange-500/10 border-orange-500/20",
        cta: "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white",
        glow: "shadow-[0_0_30px_-8px_rgba(249,115,22,0.25)]",
        ring: "ring-1 ring-orange-500/10",
        check: "text-orange-400",
    },
    gold: {
        badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        border: "border-yellow-500/30",
        icon: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
        cta: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-zinc-950",
        glow: "shadow-[0_0_40px_-10px_rgba(234,179,8,0.3)]",
        ring: "ring-1 ring-yellow-500/20",
        check: "text-yellow-400",
    },
    indigo: {
        badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        border: "border-indigo-500/20",
        icon: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        cta: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white",
        glow: "",
        ring: "",
        check: "text-indigo-400",
    },
};

function UpgradePageInner() {
    const { user, userProfile } = useAuth();
    const searchParams = useSearchParams();
    const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const generationsUsed = userProfile?.generationsUsed ?? 0;
    const isUniversityUser = userProfile?.isUniversityUser ?? false;
    const currentPlan = isUniversityUser ? "university" : "free";

    // Handle Stripe redirect results
    useEffect(() => {
        const success = searchParams.get("success");
        const cancelled = searchParams.get("cancelled");
        const tier = searchParams.get("tier");
        if (success === "true") {
            toast.success(`${tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : ""} plan activated!`, {
                description: "Your subscription is now active. Enjoy unlimited generations!"
            });
        } else if (cancelled === "true") {
            toast.info("Checkout cancelled", { description: "No charges were made." });
        }
    }, [searchParams]);

    const handleUpgrade = async (tierId: string) => {
        if (tierId === "free") return;
        if (tierId === "university") {
            window.location.href = "mailto:hello@jobpeel.co?subject=University Plan Inquiry";
            return;
        }

        setLoadingTier(tierId);
        try {
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

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Checkout failed");
            }

            const { url } = await res.json();
            window.location.href = url;
        } catch (e: any) {
            toast.error("Checkout failed", { description: e.message || "Please try again." });
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
                    Unlimited cover letters, smarter applications, and more interviews — starting today.
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

            {/* Usage Notice */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
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
                            transition={{ delay: i * 0.07 }}
                            className={cn(
                                "relative flex flex-col bg-zinc-900/50 border rounded-2xl p-5 transition-all duration-300 hover:translate-y-[-2px]",
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
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn("p-2 rounded-xl border", colors.icon)}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{tier.name}</p>
                                    <p className="text-[11px] text-zinc-500 leading-tight">{tier.description}</p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-5">
                                {price === null ? (
                                    <p className="text-2xl font-bold text-white">Custom</p>
                                ) : price === 0 ? (
                                    <p className="text-3xl font-bold text-white">Free</p>
                                ) : (
                                    <div className="flex items-end gap-1">
                                        <span className="text-3xl font-bold text-white">${price}</span>
                                        <span className="text-zinc-500 text-sm mb-1">/mo</span>
                                    </div>
                                )}
                                {billing === "annual" && price !== null && price > 0 && (
                                    <p className="text-[11px] text-green-400 mt-0.5">Billed ${price * 12}/year</p>
                                )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-2 flex-1 mb-5">
                                {tier.features.map((feat) => (
                                    <li key={feat} className="flex items-start gap-2 text-xs text-zinc-300">
                                        <CheckCircle className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", colors.check)} />
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            {isCurrentPlan ? (
                                <div className="w-full py-2 text-center text-[11px] font-bold uppercase tracking-widest rounded-xl bg-white/5 text-zinc-500 border border-white/5">
                                    Current Plan
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade(tier.id)}
                                    disabled={tier.ctaDisabled || isLoading}
                                    className={cn(
                                        "w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                        colors.cta,
                                        isLoading && "opacity-70 cursor-wait"
                                    )}
                                >
                                    {isLoading ? (
                                        <span className="animate-pulse">Redirecting...</span>
                                    ) : (
                                        <>
                                            {tier.cta}
                                            <ArrowRight className="w-3 h-3" />
                                        </>
                                    )}
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Trust Line */}
            <p className="text-center text-xs text-zinc-600 pb-4">
                Secure payments via Stripe · Cancel anytime · No hidden fees
            </p>
        </div>
    );
}

export default function UpgradePage() {
    return (
        <Suspense>
            <UpgradePageInner />
        </Suspense>
    );
}
