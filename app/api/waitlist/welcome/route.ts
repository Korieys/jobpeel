import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

        const { data, error } = await resend.emails.send({
            from: 'JobPeel <noreply@jobpeel.com>',
            to: [email],
            template: {
                id: "jobpeel-waitlist-sign-up",
                variables: {
                    name: name || 'there'
                }
            },
        });

        if (error) {
            console.error("Resend Error:", error);
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
