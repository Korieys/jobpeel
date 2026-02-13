import { NextResponse } from 'next/server';
import { Resend } from 'resend';

<<<<<<< HEAD
const getResend = () => new Resend(process.env.RESEND_API_KEY);
=======
const resend = new Resend(process.env.RESEND_API_KEY);
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

<<<<<<< HEAD
        const { data, error } = await getResend().emails.send({
=======
        const { data, error } = await resend.emails.send({
>>>>>>> 85dee1cdd8abf17bc256436f1b072e76013e7b9d
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
