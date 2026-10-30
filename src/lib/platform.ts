// src/lib/platform.ts
// Pure, dependency-free URL detection. Safe for client AND server.

export type Platform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "x"
  | "facebook"
  | "suno"
  | "pinterest"
  | "rutube"
  | "likee"
  | "other";

export const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  x: "X / Twitter",
  facebook: "Facebook",
  suno: "Suno",
  pinterest: "Pinterest",
  rutube: "RuTube",
  likee: "Likee",
  other: "Unknown",
};

export function detectPlatform(raw: string): Platform {
  let host = "";
  try {
    host = new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "other";
  }

  if (host === "youtu.be" || host.endsWith("youtube.com")) return "youtube";
  if (host.endsWith("tiktok.com")) return "tiktok";
  if (host.endsWith("instagram.com")) return "instagram";
  if (host === "x.com" || host === "twitter.com") return "x";
  if (host.endsWith("facebook.com") || host === "fb.watch") return "facebook";
  if (host === "suno.com" || host === "app.suno.ai") return "suno";

  // ── New platforms ────────────────────────────────────────
  if (host.endsWith("pinterest.com") || host === "pin.it") return "pinterest";
  if (host.endsWith("rutube.ru")) return "rutube";
  if (host.endsWith("likee.video")) return "likee";

  return "other";
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}