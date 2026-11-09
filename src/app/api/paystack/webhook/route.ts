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
    const supabase = await createClient();

    if (event.event === "charge.success") {
      const { metadata, plan } = event.data;
      const userId = metadata?.user_id;
      const purchasedPlan = metadata?.plan;
      
      if (userId) {
        // 1. Handle Main App Plans (Pro / Pro Plus)
        if (purchasedPlan === "pro" || purchasedPlan === "pro_plus") {
          await supabase.from("profiles").update({ plan: purchasedPlan }).eq("id", userId);
          
          // Also upgrade their API keys just in case
          await supabase.from("api_keys").update({ 
            tier: purchasedPlan, 
            credits_remaining: purchasedPlan === "pro_plus" ? 20000 : 5000 
          }).eq("user_id", userId);
        }

        // 2. Handle API Plans (API Pro / API Enterprise)
        if (purchasedPlan === "api_pro" || purchasedPlan === "api_enterprise") {
          const apiTier = purchasedPlan === "api_pro" ? "pro" : "enterprise";
          const credits = purchasedPlan === "api_pro" ? 5000 : 20000;

          // Upgrade their existing keys, OR create a default one if they don't have any yet
          const { data: existingKeys } = await supabase.from("api_keys").select("id").eq("user_id", userId);
          
          if (existingKeys && existingKeys.length > 0) {
            await supabase.from("api_keys").update({ tier: apiTier, credits_remaining: credits }).eq("user_id", userId);
          } else {
            // They bought an API plan but have no keys, auto-create one for them
            await supabase.from("api_keys").insert({
              user_id: userId,
              name: "Default API Key",
              key_hash: crypto.createHash("sha256").update(`sw_live_${crypto.randomBytes(24).toString("hex")}`).digest("hex"),
              key_prefix: "sw_live_auto",
              tier: apiTier,
              credits_remaining: credits,
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}