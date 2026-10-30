// src/lib/videoApi.ts
import axios from "axios";
import { detectPlatform, type Platform } from "./platform";

export type { Platform };
export { detectPlatform };

export type MediaItem = {
  type: "video" | "image";
  url: string;
  thumbnail: string;
};

export type QualityOption = {
  label: string;
  value: string;
  credits: number;
  filesize: number | null;
};

export type VideoResult = {
  title: string;
  author: string;
  thumbnail: string;
  videoUrl: string;
  audioUrl: string | null;
  platform: Platform;
  audioPending: boolean;
  kind: "video" | "image" | "album";
  items: MediaItem[];
  formats: QualityOption[] | null;
};

const BASE = process.env.FASTSAVER_BASE_URL ?? "https://api.fastsaver.io/v1";
const KEY = process.env.APIFY_API_TOKEN;

function authHeaders(): Record<string, string> {
  if (!KEY) throw new Error("APIFY_API_TOKEN is not set in .env.local");
  return { "X-Api-Key": KEY, Accept: "application/json" };
}

function normalizeYouTube(raw: string): string {
  try {
    const u = new URL(raw);
    if (u.hostname.replace(/^www\./, "") === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube.com/watch?v=${id}`;
    }
  } catch { /* noop */ }
  return raw;
}

function upstreamError(status: number, data: unknown): Error {
  const d = (data ?? {}) as Record<string, unknown>;
  const msg =
    (d.detail as string) || (d.reason as string) || (d.error as string) || (d.message as string) || `FastSaver returned ${status}`;
  return new Error(msg);
}

const QUALITY_WHITELIST = [
  { label: "240p", value: "240p", credits: 15 },
  { label: "480p", value: "480p", credits: 15 },
  { label: "720p", value: "720p", credits: 15 },
  { label: "1080p", value: "1080p", credits: 15 },
  { label: "2K", value: "1440p", credits: 25 },
  { label: "4K", value: "2160p", credits: 25 },
];

function normalizeFormat(raw: unknown): QualityOption | null {
  if (!raw || typeof raw !== "object") return null;
  const f = raw as Record<string, unknown>;
  const value = (f.format as string) || (f.quality as string) || (f.resolution as string) || (f.value as string) || "";
  if (!value) return null;

  const match = QUALITY_WHITELIST.find((q) => q.value === value || q.label === value);
  if (!match) return null;

  const size = typeof f.filesize === "number" ? f.filesize : typeof f.file_size === "number" ? f.file_size : typeof f.size === "number" ? f.size : null;
  return { label: match.label, value: match.value, credits: match.credits, filesize: size };
}

export async function fetchYouTubeInfo(input: string): Promise<VideoResult> {
  const url = normalizeYouTube(input);
  let title = "YouTube video";
  let author = "YouTube";
  let thumbnail = "";
  try {
    const o = await axios.get("https://www.youtube.com/oembed", { params: { url, format: "json" }, timeout: 10_000 });
    title = o.data?.title ?? title;
    author = o.data?.author_name ?? author;
    thumbnail = o.data?.thumbnail_url ?? "";
  } catch { /* best-effort */ }

  const res = await axios.get(`${BASE}/youtube/info`, {
    params: { url }, headers: authHeaders(), timeout: 30_000, validateStatus: () => true,
  });

  if (res.status !== 200) throw upstreamError(res.status, res.data);
  const d = res.data ?? {};
  if (d.ok === false) throw upstreamError(200, d);

  const rawFormats: unknown[] = Array.isArray(d.formats) ? d.formats : Array.isArray(d.available_formats) ? d.available_formats : [];
  const formats: QualityOption[] = rawFormats.map(normalizeFormat).filter((f): f is QualityOption => f !== null).sort((a, b) => {
    const order = QUALITY_WHITELIST.findIndex((q) => q.value === a.value);
    const orderB = QUALITY_WHITELIST.findIndex((q) => q.value === b.value);
    return order - orderB;
  });

  const seen = new Set<string>();
  const unique = formats.filter((f) => { if (seen.has(f.value)) return false; seen.add(f.value); return true; });

  return {
    title: d.title || title, author: d.author || d.channel || author,
    thumbnail: d.thumbnail_url || thumbnail, videoUrl: "", audioUrl: null,
    platform: "youtube", audioPending: true, kind: "video",
    items: [{ type: "video", url: "", thumbnail }],
    formats: unique.length > 0 ? unique : null,
  };
}

export async function fetchYouTubeDownload(input: string, format: string): Promise<string> {
  const allowed = QUALITY_WHITELIST.some((q) => q.value === format);
  if (!allowed) throw new Error(`Unsupported quality: ${format}`);

  const url = normalizeYouTube(input);
  const res = await axios.post(`${BASE}/youtube/download`, { url, format }, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    timeout: 120_000, validateStatus: () => true,
  });

  if (res.status !== 200) throw upstreamError(res.status, res.data);
  const d = res.data ?? {};
  if (d.ok === false) throw upstreamError(200, d);

  const videoUrl: string | undefined = d.download_url;
  if (!videoUrl) throw new Error("No download_url in YouTube response");
  return videoUrl;
}

async function fetchUniversal(input: string): Promise<VideoResult> {
  const res = await axios.get(`${BASE}/fetch`, {
    params: { url: input }, headers: authHeaders(), timeout: 45_000, validateStatus: () => true,
  });

  if (res.status !== 200) throw upstreamError(res.status, res.data);
  const d = res.data ?? {};
  if (d.ok === false) throw upstreamError(200, d);

  const platform = detectPlatform(input);
  const rawItems: any[] = Array.isArray(d.items) ? d.items : [];

  if (d.type === "album" && rawItems.length > 0) {
    const items: MediaItem[] = rawItems.filter((it: any) => typeof it.download_url === "string").map((it: any) => ({
      type: it.type === "video" ? "video" : "image", url: it.download_url, thumbnail: it.thumbnail_url || it.download_url,
    }));
    const firstUrl = items[0]?.url ?? "";
    const firstThumb = items[0]?.thumbnail ?? d.thumbnail_url ?? "";
    return {
      title: d.caption || "Album", author: d.author || d.source || "Unknown",
      thumbnail: firstThumb, videoUrl: firstUrl, audioUrl: d.music_url || null,
      platform, audioPending: false, kind: "album", items, formats: null,
    };
  }

  const videoUrl: string | undefined = d.download_url;
  if (!videoUrl) throw new Error("No download_url in FastSaver response");

  const thumb = d.thumbnail_url || d.thumbnail || "";
  const isImage = d.type === "image" || /\.(jpe?g|png|webp|heic)(\?|$)/i.test(videoUrl);

  return {
    title: d.caption || d.title || d.desc || "Untitled", author: d.author || d.username || d.source || "Unknown",
    thumbnail: thumb, videoUrl, audioUrl: d.music_url || null, platform, audioPending: false,
    kind: isImage ? "image" : "video", items: [{ type: isImage ? "image" : "video", url: videoUrl, thumbnail: thumb }], formats: null,
  };
}

export async function fetchVideoInfo(input: string): Promise<VideoResult> {
  const platform = detectPlatform(input);
  if (platform === "suno") throw new Error("Suno downloads are temporarily unavailable. Try YouTube or TikTok.");
  if (platform === "youtube") return fetchYouTubeInfo(input);
  return fetchUniversal(input);
}

export async function fetchAudioUrl(input: string): Promise<string | null> {
  const platform = detectPlatform(input);
  if (platform === "youtube") {
    const url = normalizeYouTube(input);
    const res = await axios.post(`${BASE}/youtube/download`, { url, format: "audio" }, {
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      timeout: 120_000, validateStatus: () => true,
    });
    if (res.status !== 200) throw upstreamError(res.status, res.data);
    const d = res.data ?? {};
    if (d.ok === false) throw upstreamError(200, d);
    return d.download_url ?? null;
  }
  if (platform === "tiktok") {
    const res = await axios.get(`${BASE}/fetch`, {
      params: { url: input }, headers: authHeaders(), timeout: 45_000, validateStatus: () => true,
    });
    if (res.status !== 200) throw upstreamError(res.status, res.data);
    return res.data?.music_url ?? null;
  }
  return null;
}