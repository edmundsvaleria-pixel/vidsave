// src/lib/quota.ts
import { createClient } from "@/utils/supabase/server";

export const PLAN_LIMITS = {
  free: 5,
  pro: 100,
  pro_plus: 9999,
};

export async function checkAndIncrementQuota() {
  const supabase = await createClient();
  
  // 1. Get the logged-in user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { allowed: false, error: "You must be signed in to download." };
  }

  // 2. Get their profile
  let { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle(); // <-- Changed from .single() to prevent crashes

  // 3. If profile is missing (e.g., OAuth signup), create it automatically
  if (!profile) {
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email ?? "no-email@provided.com",
        plan: "free",
        daily_downloads: 0,
        last_download_date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single();
      
    if (createError) {
      console.error("Failed to auto-create profile:", createError);
      return { allowed: false, error: "Could not create user profile." };
    }
    profile = newProfile;
  }

  const plan = profile.plan || "free";
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || 5;

  // 4. Check if it's a new day (reset the counter)
  const today = new Date().toISOString().split("T")[0];
  const lastDate = profile.last_download_date;

  let currentDownloads = profile.daily_downloads || 0;

  if (today !== lastDate) {
    currentDownloads = 0;
  }

  // 5. Check limit
  if (currentDownloads >= limit) {
    return { 
      allowed: false, 
      error: `Daily limit reached (${limit}). Please upgrade to Pro to download more.` 
    };
  }

  // 6. Increment the counter
  await supabase
    .from("profiles")
    .update({
      daily_downloads: currentDownloads + 1,
      last_download_date: today,
    })
    .eq("id", user.id);

  return { allowed: true };
}