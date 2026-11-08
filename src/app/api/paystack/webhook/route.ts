// src/app/api/paystack/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) return NextResponse.json({ error: "No signature" }, { status: 401 });

    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");

    const isValid = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const { metadata } = event.data;
      const userId = metadata?.user_id;
      const plan = metadata?.plan;

      if (userId && plan) {
        const supabase = await createClient();
        await supabase.from("profiles").update({ plan }).eq("id", userId);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}