// src/lib/sunoApi.ts
import axios from "axios";
import type { VideoResult } from "./videoApi";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const ACTOR = "seymon~suno-downloader-actor";
const APIFY_BASE = "https://api.apify.com/v2";

function normalizeSunoUrl(input: string): string {
  const trimmed = input.trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return `https://suno.com/song/${trimmed}`;
  }
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function extractDownloadUrl(item: Record<string, unknown>): string | null {
  const candidates = [item.downloadUrl, item.download_url, item.audioUrl, item.audio_url, item.fileUrl, item.file_url, item.url, item.mp3, item.wav, item.output];
  for (const c of candidates) if (typeof c === "string" && /^https?:\/\//.test(c)) return c;
  const files = item.files;
  if (Array.isArray(files)) {
    for (const f of files) {
      if (f && typeof f === "object") {
        const url = (f as Record<string, unknown>).url ?? (f as Record<string, unknown>).file_url;
        if (typeof url === "string" && /^https?:\/\//.test(url)) return url;
      }
    }
  }
  return null;
}

async function waitForRun(runId: string): Promise<Record<string, unknown>> {
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await axios.get(`${APIFY_BASE}/actor-runs/${runId}`, {
      params: { token: APIFY_TOKEN }, timeout: 15_000, validateStatus: () => true,
    });
    if (res.status !== 200) throw new Error(`Apify poll failed (${res.status})`);
    const run = (res.data?.data ?? res.data) as Record<string, unknown>;
    const status = run?.status as string | undefined;
    if (status === "SUCCEEDED") return run;
    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Apify run ${status}: ${typeof run?.statusMessage === "string" ? run.statusMessage : "unknown"}`);
    }
  }
  throw new Error("Apify run timed out.");
}

export async function fetchSunoSong(inputUrl: string): Promise<VideoResult> {
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN is not set in .env.local");
  const sunoUrl = normalizeSunoUrl(inputUrl);

  const startRes = await axios.post(`${APIFY_BASE}/acts/${ACTOR}/runs`, { audios: [sunoUrl], format: "mp3" }, {
    params: { token: APIFY_TOKEN }, headers: { "Content-Type": "application/json" }, timeout: 30_000, validateStatus: () => true,
  });
  if (startRes.status === 401) throw new Error("Apify auth failed.");
  if (startRes.status === 402) throw new Error("Apify quota exceeded.");
  if (startRes.status !== 201 && startRes.status !== 200) {
    const msg = startRes.data?.error?.message || startRes.data?.error || `Apify returned ${startRes.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  const runData = (startRes.data?.data ?? startRes.data) as Record<string, unknown>;
  const runId = runData?.id as string | undefined;
  if (!runId) throw new Error("Apify did not return a run ID.");

  const finishedRun = await waitForRun(runId);
  const datasetId = finishedRun?.defaultDatasetId as string | undefined;
  if (!datasetId) throw new Error("Apify finished but no dataset ID.");

  const itemsRes = await axios.get(`${APIFY_BASE}/datasets/${datasetId}/items`, {
    params: { token: APIFY_TOKEN, format: "json" }, timeout: 20_000, validateStatus: () => true,
  });
  if (itemsRes.status !== 200) throw new Error(`Apify dataset fetch failed (${itemsRes.status})`);

  const items: Array<Record<string, unknown>> = Array.isArray(itemsRes.data) ? itemsRes.data : [];
  if (items.length === 0) throw new Error("Apify returned no results.");

  const item = items[0];
  const audioUrl = extractDownloadUrl(item);
  if (!audioUrl) throw new Error("Apify item has no download URL.");

  return {
    title: (typeof item.title === "string" && item.title) || "Suno song",
    author: (typeof item.author === "string" && item.author) || "Suno AI",
    thumbnail: (typeof item.imageUrl === "string" && item.imageUrl) || "",
    videoUrl: audioUrl, audioUrl, platform: "suno", audioPending: false,
    kind: "video", items: [{ type: "video", url: audioUrl, thumbnail: "" }], formats: null,
  };
}