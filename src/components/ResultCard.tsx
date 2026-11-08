// src/components/ResultCard.tsx
"use client";

import { useMemo, useState } from "react";
import { BarChart2, Eraser } from "lucide-react";
import type { VideoResult, QualityOption } from "@/lib/videoApi";

type Props = {
  result: VideoResult;
  sourceUrl: string;
  onReset: () => void;
  onAddAnother?: () => void;
  onRemove?: () => void;
};

// Custom Spinner Component
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

function getProxyUrl(url: string, title: string, type: "video" | "audio" | "image" = "video") {
  const cleanTitle = title.substring(0, 30);
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
  const isAudioOnly = isSuno || result.platform === "audiomack" || result.platform === "spotify";
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

  // Pro Features State
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  
  const [textRemovalLoading, setTextRemovalLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

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
      if (!res.ok) { setAudioError(data?.error ?? "Could not extract audio."); return; }
      setGeneratedAudio(data.audioUrl as string);
    } catch { setAudioError("Network error. Try again."); } finally { setAudioLoading(false); }
  }

  async function handleYouTubeDownload() {
    if (finalUrl) { triggerSave(finalUrl, result.title, "video"); return; }
    setDlLoading(true); setDlError(null);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl, format: selectedFormat }),
      });
      const data = await res.json();
      if (!res.ok) { setDlError(data?.error ?? "Download failed."); return; }
      setFinalUrl(data.videoUrl as string);
      triggerSave(data.videoUrl as string, result.title, "video");
    } catch { setDlError("Network error. Try again."); } finally { setDlLoading(false); }
  }

  async function handleDownloadAll() {
    setDownloadingAll(true); setDownloadProgress(0);
    for (let i = 0; i < result.items.length; i++) {
      triggerSave(result.items[i].url, `${result.title}_${i + 1}`, result.items[i].type);
      setDownloadProgress(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
    }
    setDownloadingAll(false); setDownloadProgress(0);
  }

  async function handleGetMetadata() {
    setMetadataLoading(true);
    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      });
      const data = await res.json();
      if (res.ok) setMetadata(data.metadata);
    } catch { /* ignore */ } finally { setMetadataLoading(false); }
  }

  async function handleRemoveText() {
    if (!result.thumbnail) return;
    setTextRemovalLoading(true);
    try {
      const res = await fetch("/api/remove-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: result.thumbnail }),
      });
      const data = await res.json();
      if (res.ok) setProcessedImage(data.processedImage);
    } catch { /* ignore */ } finally { setTextRemovalLoading(false); }
  }

  const kindLabel = result.kind === "album" ? `Album — ${result.items.length} items` : result.kind === "image" ? "Image" : isSuno ? "Song" : "Video";

  return (
    <div className="border border-[#27272A] bg-[#0A0A0A] rounded-xl p-6 w-full shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#A1A1AA]">Ready · {kindLabel}</span>
        <div className="flex gap-3">
          <button onClick={onReset} className="text-[11px] font-medium text-[#A1A1AA] hover:text-white transition-colors">← New</button>
          {onRemove && <button onClick={onRemove} className="text-[16px] leading-none text-[#A1A1AA] hover:text-red-400 transition-colors">×</button>}
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row">
        {(processedImage || result.thumbnail) && (
          <div className="w-full shrink-0 sm:w-40">
            <div className={`aspect-square overflow-hidden rounded-lg border border-[#27272A] bg-black sm:aspect-video relative transition-opacity duration-300 ${textRemovalLoading ? 'opacity-50' : 'opacity-100'}`}>
              <img
                src={processedImage || result.thumbnail}
                alt="Thumbnail"
                className="h-full w-full object-cover"
              />
              {textRemovalLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <Spinner size={24} />
                </div>
              )}
              {processedImage && !textRemovalLoading && (
                <div className="absolute top-2 right-2 bg-[#3B82F6] text-white text-[8px] font-bold px-2 py-1 rounded">TEXT REMOVED</div>
              )}
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
                        <button key={f.value} onClick={() => { setSelectedFormat(f.value); setDlError(null); setFinalUrl(null); }}
                          className={selectedFormat === f.value ? "border border-[#3B82F6] bg-[#3B82F6] px-3 py-1 text-[11px] font-semibold text-white transition-all" : "border border-[#27272A] px-3 py-1 text-[11px] font-semibold text-[#A1A1AA] transition-all hover:border-[#3B82F6]/50 hover:text-white"}>
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

              {!isYouTube && !isAudioOnly && (
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

              {/* ── PRO FEATURE BUTTONS ── */}
              <div className="pt-4 mt-2 border-t border-[#27272A]">
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#A1A1AA] mb-3">Utilities</p>
                <div className="flex gap-2">
                  <button onClick={handleGetMetadata} disabled={metadataLoading} className="flex-1 flex h-9 items-center justify-center gap-2 rounded-lg border border-[#27272A] bg-[#141416] text-[11px] font-medium text-white hover:bg-[#1A1A1C] transition-colors">
                    {metadataLoading ? <Spinner size={12} /> : <BarChart2 size={13} className="text-[#3B82F6]" />}
                    <span>Get Stats</span>
                  </button>
                  
                  {result.thumbnail && (
                    <button onClick={handleRemoveText} disabled={textRemovalLoading} className="flex-1 flex h-9 items-center justify-center gap-2 rounded-lg border border-[#27272A] bg-[#141416] text-[11px] font-medium text-white hover:bg-[#1A1A1C] transition-colors">
                      {textRemovalLoading ? <Spinner size={12} /> : <Eraser size={13} className="text-[#3B82F6]" />}
                      <span>Remove Text</span>
                    </button>
                  )}
                </div>
                
                {/* Metadata Skeleton & Display */}
                {metadataLoading && (
                  <div className="mt-3 space-y-2 p-3 bg-[#141416] border border-[#27272A] rounded-lg">
                    <div className="h-3 w-1/2 animate-pulse bg-[#27272A] rounded" />
                    <div className="h-3 w-1/3 animate-pulse bg-[#27272A] rounded" />
                  </div>
                )}
                
                {metadata && !metadataLoading && (
                  <div className="mt-3 bg-[#141416] border border-[#27272A] rounded-lg p-3 text-[11px] text-[#A1A1AA]">
                    <p><strong className="text-white">Views:</strong> {metadata.views?.toLocaleString() || "N/A"}</p>
                    <p><strong className="text-white">Likes:</strong> {metadata.likes?.toLocaleString() || "N/A"}</p>
                  </div>
                )}
              </div>

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

      {onAddAnother && (
        <button onClick={onAddAnother} className="mt-6 flex w-full items-center justify-center rounded-lg border border-dashed border-[#27272A] py-3 text-[11px] uppercase tracking-[0.1em] text-[#A1A1AA] transition-colors hover:border-[#3B82F6]/50 hover:text-white">
          + Download another video
        </button>
      )}
    </div>
  );
}