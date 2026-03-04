import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
});

// Price IDs per tier and billing period
const PRICE_IDS: Record<string, { monthly: string; annual: string }> = {
    standard: {
        monthly: "price_1T7CdxCYf2eRPS4dT667THqn",
        annual: "price_1T7CdxCYf2eRPS4dT667THqn", // Update with annual price ID when available
    },
    pro: {
        monthly: "price_1T7CeQCYf2eRPS4dHEgYhJ2W",
        annual: "price_1T7CeQCYf2eRPS4dHEgYhJ2W", // Update with annual price ID when available
    },
};

export async function POST(req: NextRequest) {
    try {
        const { tier, billing = "monthly", userId, email } = await req.json();

        const tierPrices = PRICE_IDS[tier as string];
        if (!tierPrices) {
            return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
        }

        const priceId = billing === "annual" ? tierPrices.annual : tierPrices.monthly;
        const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${baseUrl}/dashboard/upgrade?success=true&tier=${tier}`,
            cancel_url: `${baseUrl}/dashboard/upgrade?cancelled=true`,
            customer_email: email || undefined,
            metadata: {
                userId: userId || "",
                tier,
                billing,
            },
            subscription_data: {
                metadata: {
                    userId: userId || "",
                    tier,
                },
            },
            allow_promotion_codes: true,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe checkout error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
