// src/lib/apiAuth.ts
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function verifyApiKey(req: Request, requiredTier: "basic" | "pro" | "enterprise" = "basic") {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing API key", status: 401 };
  }

  const rawKey = authHeader.split(" ")[1];
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const supabase = await createClient();
  const { data: keyData } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key_hash", keyHash)
    .single();

  if (!keyData) return { error: "Invalid API key", status: 401 };
  if (keyData.credits_remaining <= 0) return { error: "Quota exceeded", status: 429 };

  // Check Tier permissions (e.g., Basic cannot access Pro features)
  const tiers = { basic: 1, pro: 2, enterprise: 3 };
  if (tiers[keyData.tier as keyof typeof tiers] < tiers[requiredTier]) {
    return { error: "Upgrade required for this endpoint", status: 403 };
  }

  // Deduct a credit (atomic update)
  await supabase.from("api_keys").update({ 
    credits_remaining: keyData.credits_remaining - 1,
    last_used_at: new Date().toISOString()
  }).eq("id", keyData.id);

  return { keyData }; // Success
}