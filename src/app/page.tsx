// src/app/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import JobCard, { type Job } from "@/components/JobCard";
import PlatformIcons from "@/components/PlatformIcons";
import RecentDownloads from "@/components/RecentDownloads";
import { useIsland } from "@/components/island/IslandContext";
import type { VideoResult } from "@/lib/videoApi";

function makeJob(url = ""): Job {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `job-${Date.now()}`,
    url, loading: false, error: null, result: null,
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

function HomeContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>(() => [makeJob()]);
  const { setState, clearState } = useIsland();

  useEffect(() => {
    const sharedUrl = searchParams.get("url") || searchParams.get("text");
    if (sharedUrl) {
      setJobs([makeJob(sharedUrl)]);
      window.history.replaceState({}, '', '/');
      setTimeout(() => {
        const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (btn) btn.click();
      }, 500);
    }
  }, [searchParams]);

  function updateJob(id: string, patch: Partial<Job>) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }

  async function submitJob(id: string) {
    const job = jobs.find((j) => j.id === id);
    if (!job || job.url.trim().length === 0) return;

    const urls = job.url.split("\n").map((u) => u.trim()).filter(Boolean);
    
    if (urls.length > 1) {
      updateJob(id, { url: urls[0] });
      const newJobs = urls.slice(1).map((u) => makeJob(u));
      setJobs((prev) => [...prev, ...newJobs]);
      newJobs.forEach((nj) => {
         setTimeout(() => document.getElementById(`submit-${nj.id}`)?.click(), 100);
      });
    }

    updateJob(id, { loading: true, error: null, result: null });
    setState({ type: "loading", message: urls.length > 1 ? `Processing ${urls.length} links...` : "Extracting video..." });

    try {
      const res = await fetch("/api/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urls[0] }),
      });
      const data = await res.json();
      if (!res.ok) {
        updateJob(id, { loading: false, error: data?.error ?? "Could not fetch video." });
        setState({ type: "error", message: data?.error ?? "Download failed." });
        return;
      }
      updateJob(id, { loading: false, result: data as VideoResult });
      saveRecent(urls[0]);
      setState({ type: "success", message: "Video ready" });
    } catch {
      updateJob(id, { loading: false, error: "Network error. Try again." });
      setState({ type: "error", message: "Network error. Try again." });
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
            <a href="/contact" className="transition-colors hover:text-white">Contact</a>
          </nav>
          <a href="#download" className="rounded-lg bg-[#3B82F6] px-4 py-2 text-[11px] font-semibold text-white transition-transform hover:scale-105 hover:bg-[#2563EB]">
            Start Downloading
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 pt-40 pb-24 text-center">
        {/* Badge removed, just the clean headline */}
        <h1 className="display mx-auto text-[56px] leading-[1] tracking-[-0.03em] text-white sm:text-[72px]">
          Download videos <br />
          <span className="text-[#A1A1AA]">from anywhere.</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-[#A1A1AA]">
          Save public videos from TikTok, Instagram, YouTube, and X in original quality. Fast, free, and no watermarks.
        </p>

        <div id="download" className="mt-12 text-left">
          {jobs.map((job, idx) => (
            <div key={job.id} className="mb-4" id={`job-${job.id}`}>
              <JobCard
                job={job}
                onUrlChange={(u) => updateJob(job.id, { url: u })}
                onSubmit={() => submitJob(job.id)}
                onReset={() => { resetJob(job.id); clearState(); }}
                onAddAnother={addJob}
                onRemove={idx > 0 ? () => removeJob(job.id) : undefined}
              />
            </div>
          ))}
          
          <RecentDownloads onSelect={(u) => {
            const empty = jobs.find(j => !j.url && !j.result);
            if (empty) updateJob(empty.id, { url: u });
            else { addJob(); setTimeout(() => setJobs(prev => prev.map((j, i) => i === prev.length - 1 ? { ...j, url: u } : j)), 10); }
          }} />
        </div>

        <div className="mt-32">
          <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-[#A1A1AA]">
            Works seamlessly with
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-left">
            <PlatformIcons />
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
          <div className="flex gap-4 text-[12px] text-[#A1A1AA]">
            <a href="/legal/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/legal/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}