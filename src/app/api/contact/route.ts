// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required." },
        { status: 400 }
      );
    }

    // ⚠️ IMPORTANT: This MUST be the email you signed up to Resend with.
    const toEmail = "ygakharter@gmail.com"; 

    const { data, error } = await resend.emails.send({
      to: toEmail,
      
      // ⚠️ Using your specific Resend test domain
      from: "VidSave Contact <anything@uutreneozo.resend.app>", 
      
      subject: `New VidSave Message from ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #3B82F6;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; border: 1px solid #e4e4e7;">
            ${message.replace(/\n/g, "<br>")}
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}