// src/app/api/paystack/callback/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(`${origin}/pricing?error=no_reference`);
  }

  try {
    // Verify the transaction with Paystack
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await res.json();

    // Check if Paystack confirmed the payment was successful
    if (data.status && data.data.status === "success") {
      // Payment is successful. The webhook will update the DB, 
      // so we just redirect the user to the success page.
      return NextResponse.redirect(`${origin}/?upgraded=true`);
    } else {
      return NextResponse.redirect(`${origin}/pricing?error=payment_failed`);
    }
  } catch (error) {
    return NextResponse.redirect(`${origin}/pricing?error=verification_failed`);
  }
}