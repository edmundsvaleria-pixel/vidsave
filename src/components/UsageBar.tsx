// src/components/UsageBar.tsx
"use client";

import { useEffect, useState } from "react";
import { Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function UsageBar({ refreshTrigger }: { refreshTrigger: number }) {
  const [usage, setUsage] = useState<{ plan: string; limit: number; used: number; remaining: number } | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/usage");
        if (res.ok) {
          const data = await res.json();
          setUsage(data);
        }
      } catch { /* ignore */ }
    }
    fetchUsage();
  }, [refreshTrigger]);

  if (!usage) return null;

  const isPro = usage.plan === "pro" || usage.plan === "pro_plus";
  const percentage = Math.min(100, (usage.used / usage.limit) * 100);

  return (
    <div className="mb-6 flex flex-col gap-2 rounded-xl border border-[#27272A] bg-[#0A0A0A] p-4">
      <div className="flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-2">
          {isPro ? (
            <ShieldCheck size={14} className="text-[#3B82F6]" />
          ) : (
            <Zap size={14} className="text-[#F59E0B]" />
          )}
          <span className="font-semibold uppercase tracking-wider text-white">
            {isPro ? "Pro Plan" : "Free Plan"}
          </span>
        </div>
        <span className="text-[#A1A1AA]">
          {usage.remaining} / {usage.limit} remaining today
        </span>
      </div>
      
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#27272A]">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isPro ? "bg-[#3B82F6]" : "bg-[#F59E0B]"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {!isPro && usage.remaining <= 2 && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-[#EF4444]">Running low on downloads.</span>
          <Link href="/pricing" className="text-[10px] font-bold text-[#3B82F6] hover:underline">
            Upgrade to Pro →
          </Link>
        </div>
      )}
    </div>
  );
}