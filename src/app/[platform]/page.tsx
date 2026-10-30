// src/app/[platform]/page.tsx
"use client";

import { useState, useEffect } from "react";
import JobCard, { type Job } from "@/components/JobCard";
import PlatformIcons from "@/components/PlatformIcons";
import RecentDownloads from "@/components/RecentDownloads";
import type { VideoResult } from "@/lib/videoApi";
import { useParams } from "next/navigation";

function makeJob(): Job {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `job-${Date.now()}`,
    url: "", loading: false, error: null, result: null,
  };
}

function saveRecent(url: string) {
  try {
    const stored = localStorage.getItem("vidsave_recent");
    let recent: string[] = stored ? JSON.parse(stored) : [];
    recent = recent.filter((u) => u !== url);
    recent.unshift(url);
    recent = recent.slice(0, 5);
    localStorage.setItem("vidsave_recent", JSON.stringify(recent));
  } catch { /* ignore */ }
}

export default function PlatformPage() {
  const params = useParams();
  const platformSlug = (params?.platform as string) || "";
  const platformName = platformSlug.charAt(0).toUpperCase() + platformSlug.slice(1);

  const [jobs, setJobs] = useState<Job[]>(() => [makeJob()]);

  // Update document title based on platform
  useEffect(() => {
    if (platformName) {
      document.title = `${platformName} Video Downloader | VidSave`;
    }
  }, [platformName]);

  function updateJob(id: string, patch: Partial<Job>) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }

  async function submitJob(id: string) {
    const job = jobs.find((j) => j.id === id);
    if (!job || job.url.trim().length === 0) return;
    updateJob(id, { loading: true, error: null, result: null });

    try {
      const res = await fetch("/api/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: job.url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        updateJob(id, { loading: false, error: data?.error ?? "Could not fetch video." });
        return;
      }
      updateJob(id, { loading: false, result: data as VideoResult });
      saveRecent(job.url.trim());
    } catch {
      updateJob(id, { loading: false, error: "Network error. Try again." });
    }
  }

  function addJob() { setJobs((prev) => [...prev, makeJob()]); }
  function removeJob(id: string) { setJobs((prev) => (prev.length > 1 ? prev.filter((j) => j.id !== id) : prev)); }
  function resetJob(id: string) { updateJob(id, { url: "", error: null, result: null, loading: false }); }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-2 w-2 rounded-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" />
            <span className="text-[13px] font-bold tracking-tight text-white">VidSave</span>
          </a>
          <nav className="hidden items-center gap-6 text-[12px] font-medium text-[#A1A1AA] sm:flex">
            <a href="/tiktok" className="transition-colors hover:text-white">TikTok</a>
            <a href="/instagram" className="transition-colors hover:text-white">Instagram</a>
            <a href="/youtube" className="transition-colors hover:text-white">YouTube</a>
            <a href="/x" className="transition-colors hover:text-white">X</a>
          </nav>
          <a href="/" className="rounded-lg border border-[#27272A] bg-transparent px-4 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-white hover:text-black">
            All Platforms
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-40 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="display text-[56px] leading-[1] tracking-[-0.03em] text-white sm:text-[72px]">
            {platformName} <br />
            <span className="text-[#A1A1AA]">Video Downloader.</span>
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-[#A1A1AA]">
            Save public {platformName} videos in original quality. Fast, free, and no watermarks.
          </p>

          <div id="download" className="mt-10 text-left">
            {jobs.map((job, idx) => (
              <div key={job.id} className="mb-4">
                <JobCard
                  job={job}
                  onUrlChange={(u) => updateJob(job.id, { url: u })}
                  onSubmit={() => submitJob(job.id)}
                  onReset={() => resetJob(job.id)}
                  onAddAnother={addJob}
                  onRemove={idx > 0 ? () => removeJob(job.id) : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <footer className="border-t border-[#27272A] bg-[#000000] py-12 relative z-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#3B82F6]" />
            <span className="text-[14px] font-bold text-white">VidSave</span>
          </div>
          <p className="text-[12px] text-[#A1A1AA]">© 2026 VidSave. For personal, non-commercial use only.</p>
        </div>
      </footer>
    </div>
  );
}