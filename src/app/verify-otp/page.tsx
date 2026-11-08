// src/app/verify-otp/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyContent() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();

  // ⚠️ This matches your Supabase setting (6 digits)
  const OTP_LENGTH = 6; 

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setErrorMsg(null);

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token: otp }),
    });
    const data = await res.json();

    if (!res.ok) {
      setErrorMsg(data.error);
      setLoading(false);
    } else {
      // Verification successful! Send them to the homepage
      router.push("/");
      router.refresh(); // Refreshes the header so your email appears instantly
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#27272A] bg-[#141416] p-8 shadow-2xl text-center">
        <h1 className="heading-display text-2xl text-white mb-2">Check your email</h1>
        
        {/* Dynamic text based on OTP_LENGTH */}
        <p className="text-[13px] text-[#A1A1AA] mb-8">
          We sent a {OTP_LENGTH}-digit code to <span className="text-white font-medium">{email}</span>.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            maxLength={OTP_LENGTH}
            placeholder={`Enter ${OTP_LENGTH}-digit code`}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allows numbers
            required
            className="w-full text-center tracking-[0.5em] rounded-lg border border-[#27272A] bg-[#0A0A0A] px-4 py-4 text-xl font-mono text-white placeholder-[#555555] focus:border-[#3B82F6] focus:outline-none"
          />
          {errorMsg && <p className="text-[12px] text-red-400 bg-red-500/10 p-2 rounded">{errorMsg}</p>}
          <button 
            type="submit" 
            disabled={loading || otp.length < OTP_LENGTH} 
            className="w-full rounded-lg bg-[#3B82F6] px-4 py-3 text-[13px] font-semibold text-white hover:bg-[#2563EB] disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0C]" />}>
      <VerifyContent />
    </Suspense>
  );
}