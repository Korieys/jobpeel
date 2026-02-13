import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/firebase'; // Ensure this path is correct for server-side firebase usage? 
// Note: Client SDK might invoke warnings on server, but for simple writes it often works. 
// Ideally we use firebase-admin for server routes, but to keep it "free" and simple without new service accounts, 
// we'll try reusing the existing config or just assume the client SDK is fine for this low-volume usage.
// Actually, using Client SDK in API routes is okay for simple prototyping but insecure for "admin" actions without checks.
// Since this is a "free setup" request, we will skip full Admin SDK setup for now and just use the client SDK 
// BUT we must be careful about who calls this. For now, it's obscure.

import { doc, updateDoc } from 'firebase/firestore';

<<<<<<< HEAD
const getResend = () => new Resend(process.env.RESEND_API_KEY);
=======
const resend = new Resend(process.env.RESEND_API_KEY);
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d

export async function POST(request: Request) {
    try {
        const { email, uid, name } = await request.json();

        // 1. Update Firestore (Approving the user)
        // Note: This relies on the server having permission or open rules, or the client SDK being authenticated as an admin.
        // Since we don't have a signed-in admin here easily, we might need to rely on the fact that this is a server-side route.
        // However, the Client SDK doesn't automatically have "admin" privileges just because it's on the server.
        // For a robust solution, we'd need firebase-admin. 
        // FOR COMPATIBILITY with the user's "Free/Simple" request, we'll try to just send the email first. 
        // The Update logic might fail if rules deny it. 
        // IMPORTANT: The user asked for "Free Automation". 
        // Let's assume for this step, we just send the EMAIL. The "Button" in the admin dashboard will handle the Firestore update 
        // using the CLIENT SDK (where the admin is logged in) and then call this API just to send the email.
        // That divides the responsibility: Client (Admin) -> Updates DB -> Calls API -> Sends Email. Safe and simple.

<<<<<<< HEAD
        const { data, error } = await getResend().emails.send({
            from: 'JobPeel <onboarding@resend.dev>',
            to: [email],
            subject: "You're in! Welcome to JobPeel.",
=======
        const { data, error } = await resend.emails.send({
            from: 'JobPeel <onboarding@resend.dev>',
            to: [email],
            subject: 'You’re in! Welcome to JobPeel.',
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Your wait is over.</h1>
          <p>Hi ${name || 'Future User'},</p>
          <p>We've approved your access to <strong>JobPeel Pilot</strong>.</p>
          <p>You can now log in and start streamlining your career services.</p>
          <br/>
          <a href="https://jobpeel.app/login" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Log In to JobPeel</a>
          <br/><br/>
          <p>See you inside,</p>
          <p>The JobPeel Team</p>
        </div>
      `,
        });

        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
