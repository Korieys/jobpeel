import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
});

// Required: disable Next.js body parsing so we get the raw body for signature verification
export const config = {
    api: { bodyParser: false },
};

// Map Stripe price IDs → plan names
const PRICE_TO_PLAN: Record<string, string> = {
    "price_1T7CdxCYf2eRPS4dT667THqn": "standard", // Monthly
    "price_1T7tRXCYf2eRPS4dhyW9h52r": "standard", // Annual
    "price_1T7CeQCYf2eRPS4dHEgYhJ2W": "pro",      // Monthly
    "price_1T7tSBCYf2eRPS4dFcw63zkK": "pro",      // Annual
};

async function findUserByStripeCustomer(customerId: string): Promise<string | null> {
    if (!adminDb) return null;
    const usersRef = adminDb.collection("users");
    const snap = await usersRef.where("stripeCustomerId", "==", customerId).get();
    if (!snap.empty) return snap.docs[0].id;
    return null;
}

async function updateUserPlan(userId: string, plan: string, stripeCustomerId?: string) {
    if (!adminDb) return;
    const userRef = adminDb.collection("users").doc(userId);
    const update: Record<string, any> = {
        plan,
        // Reset the generation counter when upgrading to a paid plan
        ...(plan !== "free" ? { generationsUsed: 0 } : {}),
    };
    if (stripeCustomerId) update.stripeCustomerId = stripeCustomerId;
    await userRef.update(update);
}

export async function POST(req: NextRequest) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET is not set");
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const tier = session.metadata?.tier || "standard";
                const customerId = session.customer as string;

                if (userId) {
                    await updateUserPlan(userId, tier, customerId);
                    console.log(`✅ Plan activated: user=${userId} tier=${tier}`);
                }
                break;
            }

            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription;
                const customerId = sub.customer as string;
                const priceId = sub.items.data[0]?.price?.id;
                const plan = PRICE_TO_PLAN[priceId] || "standard";
                const status = sub.status;

                // Only update if subscription is active
                if (status === "active" || status === "trialing") {
                    const userId = sub.metadata?.userId || await findUserByStripeCustomer(customerId);
                    if (userId) {
                        await updateUserPlan(userId, plan, customerId);
                        console.log(`✅ Subscription updated: user=${userId} plan=${plan}`);
                    }
                }
                break;
            }

            case "customer.subscription.deleted": {
                // Subscription cancelled — downgrade user to free
                const sub = event.data.object as Stripe.Subscription;
                const customerId = sub.customer as string;
                const userId = sub.metadata?.userId || await findUserByStripeCustomer(customerId);

                if (userId) {
                    await updateUserPlan(userId, "free");
                    console.log(`⬇️ Subscription cancelled: user=${userId} → free`);
                }
                break;
            }

            case "invoice.payment_failed": {
                // Payment failed — optionally notify or restrict
                const invoice = event.data.object as Stripe.Invoice;
                console.warn(`⚠️ Payment failed for customer: ${invoice.customer}`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (err) {
        console.error("Error processing webhook event:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
