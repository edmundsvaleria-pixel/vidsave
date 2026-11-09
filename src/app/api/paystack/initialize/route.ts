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
    
    // HARDCODED PLAN CODES FOR TESTING
    let planCode = "";
    if (plan === "pro") planCode = "PLN_i9ntuvjgna5o4az";
    if (plan === "pro_plus") planCode = "PLN_x5lb8v28z5f7e5n";
    if (plan === "api_pro") planCode = "PLN_0h8k11989tvifig";
    if (plan === "api_enterprise") planCode = "PLN_a3fep60maqk5g0m";

    if (!planCode) {
      return NextResponse.json({ 
        error: `Invalid plan selected: ${plan}` 
      }, { status: 400 });
    }

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        plan: planCode,
        metadata: { user_id: user.id, plan: plan },
      }),
    });

    const data = await res.json();
    
    if (!data.status) {
      return NextResponse.json({ 
        error: data.message || "Paystack rejected the transaction" 
      }, { status: 400 });
    }

    return NextResponse.json({ access_code: data.data.access_code });
  } catch (error: any) {
    console.error("Initialize Error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}