// src/components/RecentDownloads.tsx
"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { detectPlatform, PLATFORM_LABELS } from "@/lib/platform";

type Props = {
  onSelect: (url: string) => void;
};

export default function RecentDownloads({ onSelect }: Props) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vidsave_recent");
      if (stored) setRecent(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  if (recent.length === 0) return null;

  return (
    <div className="mt-8 text-left">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#f5f3ef]/40">
          <History size={12} />
          Recent
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("vidsave_recent");
            setRecent([]);
          }}
          className="text-[9px] uppercase tracking-[0.15em] text-[#f5f3ef]/30 hover:text-red-400"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {recent.map((url, i) => {
          const platform = detectPlatform(url);
          return (
            <button
              key={`${url}-${i}`}
              onClick={() => onSelect(url)}
              className="group flex items-center justify-between border border-[#d4af37]/10 bg-[#d4af37]/[0.02] px-3 py-2 text-left transition-colors hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5"
            >
              <span className="truncate pr-4 text-[11px] text-[#f5f3ef]/60 group-hover:text-[#f5f3ef]">
                {url}
              </span>
              <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#d4af37]/50 group-hover:text-[#d4af37]">
                {PLATFORM_LABELS[platform]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}