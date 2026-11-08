// src/app/login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

// Spinner component
function Spinner({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOAuth, setLoadingOAuth] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [useOtp, setUseOtp] = useState(false); // Toggle between password and OTP
  
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerified = searchParams.get("verified");

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (useOtp) {
      // Send OTP Code
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error);
        setLoading(false);
      } else {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }
    } else {
      // Sign in with Password
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    setLoadingOAuth(provider);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoadingOAuth(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#27272A] bg-[#141416] p-8 shadow-2xl">
        <h1 className="heading-display text-3xl text-white mb-2">Welcome back</h1>
        <p className="text-[13px] text-[#A1A1AA] mb-8">Sign in to access your dashboard.</p>

        {isVerified && (
          <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-[12px] text-green-400 text-center">
            Account verified! Please log in.
          </div>
        )}

        <div className="flex flex-col gap-3 mb-6">
          <button 
            onClick={() => handleOAuth("google")} 
            disabled={loadingOAuth !== null || loading} 
            className="flex items-center justify-center gap-3 rounded-lg border border-[#27272A] bg-[#0A0A0A] px-4 py-3 text-[13px] font-medium text-white hover:bg-[#1A1A1C] disabled:opacity-50 transition-colors"
          >
            {loadingOAuth === "google" ? (
              <Spinner size={18} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          <button 
            onClick={() => handleOAuth("github")} 
            disabled={loadingOAuth !== null || loading} 
            className="flex items-center justify-center gap-3 rounded-lg border border-[#27272A] bg-[#0A0A0A] px-4 py-3 text-[13px] font-medium text-white hover:bg-[#1A1A1C] disabled:opacity-50 transition-colors"
          >
            {loadingOAuth === "github" ? (
              <Spinner size={18} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            )}
            Continue with GitHub
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#27272A]"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-[#555555]"><span className="bg-[#141416] px-2">Or continue with email</span></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-4 py-3 text-[13px] text-white placeholder-[#555555] focus:border-[#3B82F6] focus:outline-none" 
          />
          
          {!useOtp && (
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-4 py-3 text-[13px] text-white placeholder-[#555555] focus:border-[#3B82F6] focus:outline-none" 
            />
          )}

          {errorMsg && <p className="text-[12px] text-red-400 bg-red-500/10 p-2 rounded">{errorMsg}</p>}
          
          <button 
            type="submit" 
            disabled={loading || loadingOAuth !== null} 
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-3 text-[13px] font-semibold text-white hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Spinner size={16} />
                <span>Please wait...</span>
              </>
            ) : useOtp ? (
              "Email me a login code"
            ) : (
              "Sign In with Password"
            )}
          </button>
        </form>

        <button 
          onClick={() => setUseOtp(!useOtp)} 
          className="mt-4 w-full text-center text-[12px] text-[#A1A1AA] hover:text-white transition-colors"
        >
          {useOtp ? "Use password instead" : "Forgot password? Log in with a code"}
        </button>

        <p className="mt-8 text-center text-[12px] text-[#A1A1AA]">
          Don't have an account? <a href="/signup" className="font-semibold text-white hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#0A0A0C]" />}><LoginContent /></Suspense>;
}