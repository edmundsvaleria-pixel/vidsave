// src/app/api/paystack/verify/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await res.json();
    
    if (data.status && data.data.status === "success") {
      // The webhook handles the DB update, but we can verify it here too
      return NextResponse.json({ success: true });
    }
    
    throw new Error("Payment verification failed.");
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}