// src/components/JobCard.tsx
"use client";

import { FormEvent } from "react";
import DownloadCard from "./DownloadCard";
import ResultCard from "./ResultCard";
import type { VideoResult } from "@/lib/videoApi";

export type Job = {
  id: string;
  url: string;
  loading: boolean;
  error: string | null;
  result: VideoResult | null;
};

type Props = {
  job: Job;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onAddAnother: () => void;
  onRemove?: () => void;
};

export default function JobCard({
  job,
  onUrlChange,
  onSubmit,
  onReset,
  onAddAnother,
  onRemove,
}: Props) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  if (job.result) {
    return (
      <ResultCard
        result={job.result}
        sourceUrl={job.url}
        onReset={onReset}
        onAddAnother={onAddAnother}
        onRemove={onRemove}
      />
    );
  }

  return (
    <div className="relative">
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label="Remove this card"
          className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#27272A] bg-[#0A0A0A] text-[14px] leading-none text-[#A1A1AA] transition-colors hover:border-red-500/50 hover:text-red-400"
        >
          ×
        </button>
      )}
      <DownloadCard
        url={job.url}
        setUrl={onUrlChange}
        onSubmit={handleSubmit}
        loading={job.loading}
        error={job.error}
      />
    </div>
  );
}