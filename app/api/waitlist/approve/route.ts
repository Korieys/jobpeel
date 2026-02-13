import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const getResend = () => new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email, uid, name } = await request.json();

        // Send email
        const { data, error } = await getResend().emails.send({
            from: 'JobPeel <onboarding@resend.dev>',
            to: [email],
            subject: "You're in! Welcome to JobPeel.",
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
