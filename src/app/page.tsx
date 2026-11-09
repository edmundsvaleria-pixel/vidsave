// src/app/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import JobCard, { type Job } from "@/components/JobCard";
import PlatformIcons from "@/components/PlatformIcons";
import RecentDownloads from "@/components/RecentDownloads";
import UsageBar from "@/components/UsageBar";
import { createClient } from "@/utils/supabase/client";
import type { VideoResult } from "@/lib/videoApi";
import { Menu, X, Lock, Zap } from "lucide-react";

function makeJob(url = ""): Job {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `job-${Date.now()}`,
    url, loading: false, error: null, result: null,
  };
}

function saveRecent(url: string) {
  try {
    const stored = localStorage.getItem("swiftsave_recent");
    let recent: string[] = stored ? JSON.parse(stored) : [];
    recent = recent.filter((u) => u !== url);
    recent.unshift(url);
    recent = recent.slice(0, 5);
    localStorage.setItem("swiftsave_recent", JSON.stringify(recent));
  } catch { /* ignore */ }
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>(() => [makeJob()]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [loadingAuth, setLoadingAuth] = useState(true);
  const supabase = createClient();

  const [showPaywall, setShowPaywall] = useState(false);
  const [usageRefresh, setUsageRefresh] = useState(0);

  useEffect(() => {
    const fetchUserAndPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
        if (profile && profile.plan) setUserPlan(profile.plan);
      }
      setLoadingAuth(false);
    };
    
    fetchUserAndPlan();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => { 
        setUser(session?.user ?? null); 
        if (session?.user) {
          const { data: profile } = await supabase.from("profiles").select("plan").eq("id", session.user.id).single();
          if (profile && profile.plan) setUserPlan(profile.plan);
        } else {
          setUserPlan("free");
        }
        setLoadingAuth(false);
      }
    );

    return () => { authListener.subscription.unsubscribe(); };
  }, [supabase.auth]);

  useEffect(() => {
    const sharedUrl = searchParams.get("url") || searchParams.get("text");
    if (sharedUrl && user) {
      const newJob = makeJob(sharedUrl);
      setJobs([newJob]);
      window.history.replaceState({}, '', '/');
      setTimeout(() => submitJob(newJob.id, sharedUrl), 500);
    }
  }, [searchParams, user]);

  function updateJob(id: string, patch: Partial<Job>) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }

  async function submitJob(id: string, overrideUrl?: string) {
    const job = jobs.find((j) => j.id === id);
    const urlToFetch = overrideUrl || job?.url;
    if (!urlToFetch || urlToFetch.trim().length === 0) return;

    const urls = urlToFetch.split("\n").map((u) => u.trim()).filter(Boolean);
    
    if (urls.length > 1) {
      updateJob(id, { url: urls[0] });
      const newJobs = urls.slice(1).map((u) => makeJob(u));
      setJobs((prev) => [...prev, ...newJobs]);
      newJobs.forEach((nj) => {
         setTimeout(() => document.getElementById(`submit-${nj.id}`)?.click(), 100);
      });
    }

    updateJob(id, { loading: true, error: null, result: null });

    try {
      const res = await fetch("/api/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urls[0] }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data?.error?.includes("Daily limit reached")) {
          setShowPaywall(true);
          updateJob(id, { loading: false, error: null });
          return;
        }

        updateJob(id, { loading: false, error: data?.error ?? "Could not fetch video." });
        return;
      }
      
      updateJob(id, { loading: false, result: data as VideoResult });
      saveRecent(urls[0]);
      setUsageRefresh(prev => prev + 1);
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

      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity z-50">
            <div className="h-2 w-2 rounded-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" />
            <span className="text-[13px] font-bold tracking-tight text-white">SwiftSave</span>
          </a>

          <nav className="hidden items-center gap-6 text-[12px] font-medium text-[#A1A1AA] sm:flex">
            <a href="/tiktok" className="transition-colors hover:text-white">TikTok</a>
            <a href="/instagram" className="transition-colors hover:text-white">Instagram</a>
            <a href="/youtube" className="transition-colors hover:text-white">YouTube</a>
            <a href="/x" className="transition-colors hover:text-white">X</a>
            <a href="/pricing" className="transition-colors hover:text-white text-[#3B82F6]">Pricing</a>
            <a href="/developers" className="transition-colors hover:text-white">Developers</a>
            <a href="/contact" className="transition-colors hover:text-white">Contact</a>
          </nav>
          
          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-[11px] text-[#A1A1AA]">{user.email}</span>
                <button 
                  onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
                  className="rounded-lg border border-[#27272A] bg-transparent px-4 py-2 text-[11px] font-semibold text-white hover:bg-white hover:text-black transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <a href="/login" className="rounded-lg bg-[#3B82F6] px-4 py-2 text-[11px] font-semibold text-white transition-transform hover:scale-105 hover:bg-[#2563EB]">
                Sign In
              </a>
            )}
          </div>

          <button 
            className="sm:hidden z-50 p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 border-b border-[#27272A] bg-[#0A0A0C] p-6 flex flex-col gap-4 shadow-2xl z-40">
            <a href="/tiktok" className="text-[14px] text-[#A1A1AA] hover:text-white">TikTok</a>
            <a href="/instagram" className="text-[14px] text-[#A1A1AA] hover:text-white">Instagram</a>
            <a href="/youtube" className="text-[14px] text-[#A1A1AA] hover:text-white">YouTube</a>
            <a href="/x" className="text-[14px] text-[#A1A1AA] hover:text-white">X</a>
            <a href="/pricing" className="text-[14px] text-[#3B82F6] font-semibold">Pricing</a>
            <a href="/developers" className="text-[14px] text-[#A1A1AA] hover:text-white">Developers</a>
            <a href="/contact" className="text-[14px] text-[#A1A1AA] hover:text-white">Contact</a>
            
            <div className="h-px w-full bg-[#27272A] my-2" />
            
            {user ? (
              <div className="flex flex-col gap-3">
                <span className="text-[12px] text-[#A1A1AA]">{user.email}</span>
                <button 
                  onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
                  className="w-full rounded-lg border border-[#27272A] bg-transparent py-3 text-[13px] font-semibold text-white hover:bg-white hover:text-black transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <a href="/login" className="w-full text-center rounded-lg bg-[#3B82F6] py-3 text-[13px] font-semibold text-white">
                Sign In
              </a>
            )}
          </div>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 pt-40 pb-24 text-center">
        <h1 className="display mx-auto text-[56px] leading-[1] tracking-[-0.03em] text-white sm:text-[72px]">
          Download videos <br />
          <span className="text-[#A1A1AA]">from anywhere.</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-[#A1A1AA]">
          Save public videos from TikTok, Instagram, YouTube, and X in original quality. Fast, free, and no watermarks.
        </p>

        <div id="download" className="mt-12 text-left">
          {loadingAuth ? (
             <div className="h-40 flex items-center justify-center text-[#A1A1AA]">Loading...</div>
          ) : user ? (
            <>
              <UsageBar refreshTrigger={usageRefresh} />

              {jobs.map((job, idx) => (
                <div key={job.id} className="mb-4" id={`job-${job.id}`}>
                  <JobCard
                    job={job}
                    userPlan={userPlan}
                    onUrlChange={(u) => updateJob(job.id, { url: u })}
                    onSubmit={() => submitJob(job.id)}
                    onReset={() => resetJob(job.id)}
                    onAddAnother={addJob}
                    onRemove={idx > 0 ? () => removeJob(job.id) : undefined}
                  />
                </div>
              ))}
              
              <RecentDownloads onSelect={(u) => {
                const empty = jobs.find(j => !j.url && !j.result);
                if (empty) {
                  updateJob(empty.id, { url: u });
                  setTimeout(() => submitJob(empty.id, u), 100);
                } else { 
                  addJob(); 
                  setTimeout(() => {
                    setJobs(prev => {
                      const newJobs = prev.map((j, i) => i === prev.length - 1 ? { ...j, url: u } : j);
                      const lastJob = newJobs[newJobs.length - 1];
                      submitJob(lastJob.id, u);
                      return newJobs;
                    });
                  }, 10); 
                }
              }} />
            </>
          ) : (
            <div className="border border-[#27272A] bg-[#0A0A0A] rounded-xl p-8 text-center shadow-lg">
              <div className="h-12 w-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-4">
                <Lock size={20} className="text-[#3B82F6]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sign in to download</h3>
              <p className="text-[13px] text-[#A1A1AA] mb-6">You need an account to use SwiftSave. It's free and takes 10 seconds.</p>
              <a href="/login" className="btn-primary flex h-12 w-full items-center justify-center">
                Sign In or Create Account
              </a>
            </div>
          )}
        </div>

        <div className="mt-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="border border-[#27272A] bg-[#0A0A0A] rounded-xl p-6">
              <div className="h-8 w-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] font-bold text-sm mb-4">1</div>
              <h3 className="text-white font-semibold mb-2">Copy the link</h3>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">Go to TikTok, Instagram, or YouTube and copy the link to the video you want to save.</p>
            </div>
            <div className="border border-[#27272A] bg-[#0A0A0A] rounded-xl p-6">
              <div className="h-8 w-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] font-bold text-sm mb-4">2</div>
              <h3 className="text-white font-semibold mb-2">Paste it here</h3>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">Paste the link into the box above and click "Download". Our servers will fetch the original file.</p>
            </div>
            <div className="border border-[#27272A] bg-[#0A0A0A] rounded-xl p-6">
              <div className="h-8 w-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] font-bold text-sm mb-4">3</div>
              <h3 className="text-white font-semibold mb-2">Save to your device</h3>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">Once the video appears, click "Download MP4" or "Extract MP3" to save it directly to your device.</p>
            </div>
          </div>
        </div>

        <div className="mt-20">
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
            <span className="text-[14px] font-bold text-white">SwiftSave</span>
          </div>
          <p className="text-[12px] text-[#A1A1AA]">© 2026 SwiftSave. All rights reserved.</p>
          <div className="flex gap-4 text-[12px] text-[#A1A1AA]">
            <a href="/faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="/developers" className="hover:text-white transition-colors">Developers</a>
            <a href="/legal/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/legal/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-6">
          <div className="w-full max-w-md rounded-2xl border border-[#3B82F6]/30 bg-[#0A0A0C] p-8 text-center shadow-[0_0_50px_rgba(59,130,246,0.2)]">
            <div className="h-16 w-16 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-6">
              <Zap size={28} className="text-[#3B82F6]" />
            </div>
            <h2 className="heading-display text-3xl text-white mb-3">Limit Reached</h2>
            <p className="text-[14px] text-[#A1A1AA] mb-8 leading-relaxed">
              You've used all 5 free downloads for today. Upgrade to SwiftSave Pro to unlock 100 downloads per day, Batch Mode, and Pro Tools.
            </p>
            <div className="space-y-3">
              <a href="/pricing" className="btn-primary flex h-12 w-full items-center justify-center">
                View Pro Plans
              </a>
              <button 
                onClick={() => { setShowPaywall(false); window.location.reload(); }}
                className="text-[12px] text-[#A1A1AA] hover:text-white transition-colors"
              >
                I'll wait until tomorrow
              </button>
            </div>
          </div>
        </div>
      )}
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