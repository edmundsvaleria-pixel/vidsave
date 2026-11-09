// src/app/api/v1/keys/generate/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name } = await req.json();
    if (!name) throw new Error("Key name is required");

    // 1. Generate the raw key
    const rawKey = `sw_live_${crypto.randomBytes(24).toString("hex")}`;
    
    // 2. Hash the key for storage
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.substring(0, 12);

    // 3. Insert into Supabase
    const { error } = await supabase.from("api_keys").insert({
      user_id: user.id,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      tier: "basic",
      credits_remaining: 50,
    });

    if (error) throw new Error(error.message);

    // 4. Return the RAW key ONLY ONCE
    return NextResponse.json({ apiKey: rawKey });
  } catch (error: any) {
    console.error("Key generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}