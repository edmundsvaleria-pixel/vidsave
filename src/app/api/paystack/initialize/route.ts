// src/app/api/paystack/initialize/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    }

    const { plan } = await req.json();
    // Amounts in the lowest currency unit (e.g., pesewas for GHS, cents for USD)
    // Example: GHS 39.00 = 3900
    const amount = plan === "pro" ? 3990 : 9990; 

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount,
        currency: "GHS", // Change to your local currency
        metadata: {
          user_id: user.id,
          plan: plan,
        },
      }),
    });

    const data = await res.json();
    if (!data.status) throw new Error(data.message);

    return NextResponse.json({ access_code: data.data.access_code });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}