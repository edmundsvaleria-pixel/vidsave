// src/components/ResultCard.tsx
"use client";

import { useMemo, useState } from "react";
import type { VideoResult, QualityOption } from "@/lib/videoApi";
import AffiliateLinks from "./AffiliateLinks";

type Props = {
  result: VideoResult;
  sourceUrl: string;
  onReset: () => void;
  onAddAnother?: () => void;
  onRemove?: () => void;
};

function Spinner({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function pickDefaultFormat(formats: QualityOption[]): string {
  const order = ["1080p", "720p", "480p", "240p", "1440p", "2160p"];
  for (const v of order) {
    if (formats.find((f) => f.value === v)) return v;
  }
  return formats[formats.length - 1]?.value ?? "";
}

// ── UPDATED: Proxy URL generator ──
function getProxyUrl(url: string, title: string, type: "video" | "audio" | "image" = "video") {
  const cleanTitle = title.substring(0, 30); // Keep filename short
  return `/api/download-file?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(cleanTitle)}&type=${type}`;
}

function triggerSave(url: string, title: string, type: "video" | "audio" | "image" = "video") {
  const proxyUrl = getProxyUrl(url, title, type);
  const a = document.createElement("a");
  a.href = proxyUrl;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function ResultCard({ result, sourceUrl, onReset, onAddAnother, onRemove }: Props) {
  const isSuno = result.platform === "suno";
  const isAlbum = result.kind === "album" && result.items.length > 1;
  const isYouTube = result.platform === "youtube" && !!result.formats?.length;

  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);

  const defaultFormat = useMemo(() => (result.formats ? pickDefaultFormat(result.formats) : ""), [result.formats]);
  const [selectedFormat, setSelectedFormat] = useState<string>(defaultFormat);
  const [dlLoading, setDlLoading] = useState(false);
  const [dlError, setDlError] = useState<string | null>(null);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);

  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const selectedOpt = result.formats?.find((f) => f.value === selectedFormat);
  const audioHref = result.audioUrl ?? generatedAudio;
  const canGenerateAudio = !audioHref && result.audioPending && !isSuno;

  async function handleExtractAudio() {
    setAudioLoading(true);
    setAudioError(null);
    try {
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAudioError(data?.error ?? "Could not extract audio.");
        return;
      }
      setGeneratedAudio(data.audioUrl as string);
    } catch {
      setAudioError("Network error. Try again.");
    } finally {
      setAudioLoading(false);
    }
  }

  async function handleYouTubeDownload() {
    if (finalUrl) {
      triggerSave(finalUrl, result.title, "video");
      return;
    }
    setDlLoading(true);
    setDlError(null);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl, format: selectedFormat }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDlError(data?.error ?? "Download failed.");
        return;
      }
      setFinalUrl(data.videoUrl as string);
      triggerSave(data.videoUrl as string, result.title, "video");
    } catch {
      setDlError("Network error. Try again.");
    } finally {
      setDlLoading(false);
    }
  }

  async function handleDownloadAll() {
    setDownloadingAll(true);
    setDownloadProgress(0);
    for (let i = 0; i < result.items.length; i++) {
      triggerSave(result.items[i].url, `${result.title}_${i + 1}`, result.items[i].type);
      setDownloadProgress(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
    }
    setDownloadingAll(false);
    setDownloadProgress(0);
  }

  const kindLabel = result.kind === "album" ? `Album — ${result.items.length} items` : result.kind === "image" ? "Image" : isSuno ? "Song" : "Video";

  return (
    <div className="border border-[#27272A] bg-[#0A0A0A] rounded-xl p-6 w-full shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#A1A1AA]">
          Ready · {kindLabel}
        </span>
        <div className="flex gap-3">
          <button onClick={onReset} className="text-[11px] font-medium text-[#A1A1AA] hover:text-white transition-colors">
            ← New
          </button>
          {onRemove && (
            <button onClick={onRemove} className="text-[16px] leading-none text-[#A1A1AA] hover:text-red-400 transition-colors">×</button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row">
        {result.thumbnail && (
          <div className="w-full shrink-0 sm:w-40">
            <div className="aspect-square overflow-hidden rounded-lg border border-[#27272A] bg-black sm:aspect-video">
              <img
                src={result.thumbnail}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-white">{result.title}</h2>
          <p className="mt-1.5 text-[11px] font-medium text-[#A1A1AA]">{result.author}</p>

          {!isAlbum && (
            <div className="mt-auto space-y-2 pt-5">
              {isYouTube && (
                <>
                  <div>
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em] text-[#A1A1AA]">Choose quality</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.formats!.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => { setSelectedFormat(f.value); setDlError(null); setFinalUrl(null); }}
                          className={selectedFormat === f.value ? "border border-[#3B82F6] bg-[#3B82F6] px-3 py-1 text-[11px] font-semibold text-white transition-all" : "border border-[#27272A] px-3 py-1 text-[11px] font-semibold text-[#A1A1AA] transition-all hover:border-[#3B82F6]/50 hover:text-white"}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleYouTubeDownload} disabled={dlLoading || !selectedFormat} className="btn-primary flex h-11 w-full items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-60 mt-2">
                    {dlLoading ? <><Spinner size={14} /> <span>Preparing…</span></> : finalUrl ? <><span>Save again</span><span>↓</span></> : <><span>Download {selectedOpt?.label ?? ""}</span><span>↓</span></>}
                  </button>
                  {dlError && <p className="border-l-2 border-red-500/60 pl-3 text-[11px] text-red-400/80">{dlError}</p>}
                </>
              )}

              {!isYouTube && !isSuno && (
                <a href={getProxyUrl(result.videoUrl, result.title, "video")} download className="btn-primary flex h-11 w-full items-center justify-center gap-2">
                  <span>{result.kind === "image" ? "Download Image" : "Download MP4"}</span>
                  <span>↓</span>
                </a>
              )}

              {audioHref && (
                <a href={getProxyUrl(audioHref, result.title, "audio")} download className="flex h-11 w-full items-center justify-center gap-2 border border-[#27272A] rounded-lg bg-[#0A0A0A] text-[11px] font-medium text-white transition-colors hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5">
                  <span>{isSuno ? "Download Song" : "Download MP3"}</span>
                  <span>↓</span>
                </a>
              )}

              {canGenerateAudio && (
                <button onClick={handleExtractAudio} disabled={audioLoading} className="flex h-11 w-full items-center justify-center gap-2 border border-[#27272A] rounded-lg bg-[#0A0A0A] text-[11px] font-medium text-white transition-colors hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5 disabled:cursor-wait disabled:opacity-60">
                  {audioLoading ? <><Spinner /> <span>Extracting…</span></> : <><span>Extract MP3</span><span>↓</span></>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isAlbum && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#A1A1AA]">All {result.items.length} items</span>
            <button onClick={handleDownloadAll} disabled={downloadingAll} className="btn-primary flex h-8 items-center gap-2 px-4 text-[9px] font-bold disabled:cursor-wait disabled:opacity-70">
              {downloadingAll ? <><Spinner size={11} /> <span>Saving {downloadProgress}/{result.items.length}…</span></> : <><span>Download All</span><span>↓</span></>}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {result.items.map((item, i) => (
              <a key={`${item.url}-${i}`} href={getProxyUrl(item.url, `${result.title}_${i + 1}`, item.type)} download className="group relative block overflow-hidden rounded-lg border border-[#27272A] bg-black transition-colors hover:border-[#3B82F6]/50">
                <div className="aspect-square">
                  {item.type === "video" ? (
                    <img src={item.thumbnail} alt={`Video ${i + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <img src={item.url} alt={`Image ${i + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { (e.currentTarget as HTMLImageElement).src = item.thumbnail; }} />
                  )}
                </div>
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-transparent to-transparent p-2">
                  <span className="text-[10px] font-semibold text-white">{i + 1}/{result.items.length}</span>
                  <span className="text-[10px] text-[#3B82F6]">↓</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {!isSuno && !isAlbum && <AffiliateLinks />}

      {onAddAnother && (
        <button onClick={onAddAnother} className="mt-4 flex w-full items-center justify-center rounded-lg border border-dashed border-[#27272A] py-3 text-[11px] uppercase tracking-[0.1em] text-[#A1A1AA] transition-colors hover:border-[#3B82F6]/50 hover:text-white">
          + Download another video
        </button>
      )}
    </div>
  );
}