// src/components/DownloadCard.tsx
"use client";

import { useState } from "react";
import { detectPlatform, PLATFORM_LABELS, isValidHttpUrl } from "@/lib/platform";

type Props = {
  url: string;
  setUrl: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
};

export default function DownloadCard({ url, setUrl, onSubmit, loading, error }: Props) {
  const [pasted, setPasted] = useState(false);
  const [isBatch, setIsBatch] = useState(false);
  
  const detected = isValidHttpUrl(url) ? detectPlatform(url) : "other";
  const platformLabel = detected !== "other" ? PLATFORM_LABELS[detected] : null;

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#A1A1AA]">
              {isBatch ? "Multiple links (one per line)" : "Video link"}
            </label>
            {!isBatch && platformLabel && (
              <span className="rounded bg-[#3B82F6]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#3B82F6]">
                {platformLabel} detected
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => { setIsBatch(!isBatch); setUrl(""); }}
              className="flex items-center gap-1 text-[10px] font-medium text-[#A1A1AA] transition-colors hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              {isBatch ? "Single Mode" : "Batch Mode"}
            </button>
            
            {!isBatch && (
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1 text-[10px] font-medium text-[#A1A1AA] transition-colors hover:text-white"
              >
                {pasted ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
                {pasted ? "Pasted" : "Paste"}
              </button>
            )}
          </div>
        </div>

        <div className="relative mb-4">
          {isBatch ? (
            <textarea
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-minimal resize-none h-32 font-mono text-sm"
              disabled={loading}
              spellCheck={false}
            />
          ) : (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-minimal"
              disabled={loading}
              spellCheck={false}
              autoComplete="off"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading || url.trim().length === 0}
          className="btn-primary h-14 w-full"
        >
          {loading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>Fetching…</span>
            </>
          ) : (
            <>
              <span>{isBatch ? "Process Batch" : "Download"}</span>
              <span className="text-base leading-none">→</span>
            </>
          )}
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-[12px] leading-relaxed text-red-400">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}