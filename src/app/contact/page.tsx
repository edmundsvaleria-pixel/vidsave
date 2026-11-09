// src/app/contact/page.tsx
"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-md rounded-2xl border border-[#27272A] bg-[#0A0A0A] p-8 shadow-2xl relative z-10">
        <h1 className="display text-3xl text-white mb-2">Get in touch</h1>
        <p className="text-[13px] text-[#A1A1AA] mb-8">Have a question, feature request, or DMCA takedown? Send us a message or reach out on WhatsApp.</p>

        {status === "success" ? (
          <div className="rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 p-4 text-center">
            <p className="text-white text-sm font-medium">Message sent successfully.</p>
            <p className="text-[#A1A1AA] text-xs mt-1">We'll get back to you within 24 hours.</p>
            <button onClick={() => setStatus("idle")} className="mt-4 text-[11px] text-[#3B82F6] hover:underline">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-[#A1A1AA] mb-1.5">Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-minimal" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-[#A1A1AA] mb-1.5">Message</label>
              <textarea 
                required 
                rows={4} 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-minimal resize-none" 
              />
            </div>
            
            {status === "error" && (
              <p className="text-[12px] text-red-400">Something went wrong. Please try again.</p>
            )}

            <button 
              type="submit" 
              disabled={status === "submitting"}
              className="btn-primary w-full h-12"
            >
              {status === "submitting" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}

        {/* WhatsApp Button */}
        <div className="mt-6 pt-6 border-t border-[#27272A]">
          <a
            href="https://wa.me/233559326645"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold text-[13px] hover:bg-[#25D366]/20 transition-colors"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-[11px] text-[#A1A1AA] hover:text-white transition-colors">← Back to SwiftSave</a>
        </div>
      </div>
    </div>
  );
}