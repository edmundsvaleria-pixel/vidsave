// src/lib/platform.ts
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
  | "audiomack" // <-- Added
  | "spotify"   // <-- Added
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
  audiomack: "Audiomack",
  spotify: "Spotify",
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
  if (host.endsWith("pinterest.com") || host === "pin.it") return "pinterest";
  if (host.endsWith("rutube.ru")) return "rutube";
  if (host.endsWith("likee.video")) return "likee";
  if (host.endsWith("audiomack.com")) return "audiomack"; // <-- Added
  if (host.endsWith("spotify.com")) return "spotify";     // <-- Added

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