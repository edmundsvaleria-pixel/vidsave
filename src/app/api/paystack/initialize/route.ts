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
    
    let planCode = "";
    let amount = 0;

    // Map the plan to the correct Paystack code AND the amount in Pesewas
    if (plan === "pro") {
      planCode = "PLN_i9ntuvjgna5o4az"; 
      amount = 3990; // GHS 39.90
    }
    if (plan === "pro_plus") {
      planCode = "PLN_x5lb8v28z5f7e5n"; 
      amount = 9990; // GHS 99.90
    }
    if (plan === "api_pro") {
      planCode = "PLN_0h8k11989tvifig"; 
      amount = 29000; // GHS 290.00
    }
    if (plan === "api_enterprise") {
      planCode = "PLN_a3fep60maqk5g0m"; 
      amount = 99000; // GHS 990.00
    }

    if (!planCode || amount === 0) {
      return NextResponse.json({ error: `Invalid plan selected: ${plan}` }, { status: 400 });
    }

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount, 
        currency: "GHS", 
        plan: planCode, 
        metadata: { user_id: user.id, plan: plan },
        // FORCE THE PAYMENT CHANNELS
        channels: ["card", "mobile_money", "bank_transfer"] 
      }),
    });

    const data = await res.json();
    
    if (!data.status) {
      return NextResponse.json({ error: data.message || "Paystack rejected the transaction" }, { status: 400 });
    }

    return NextResponse.json({ access_code: data.data.access_code });
  } catch (error: any) {
    console.error("Initialize Error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}