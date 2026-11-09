// src/app/api/usage/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, daily_downloads, last_download_date")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Calculate remaining based on plan
  const limits: Record<string, number> = { free: 5, pro: 100, pro_plus: 9999 };
  const limit = limits[profile.plan as keyof typeof limits] || 5;
  
  // Check if it's a new day, if so, they have full limit
  const today = new Date().toISOString().split("T")[0];
  const downloads = profile.last_download_date === today ? profile.daily_downloads : 0;
  const remaining = Math.max(0, limit - downloads);

  return NextResponse.json({ 
    plan: profile.plan, 
    limit, 
    used: downloads, 
    remaining 
  });
}