// src/app/developers/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Copy, Check, Code2, ArrowLeft, AlertTriangle } from "lucide-react";
import FullScreenSpinner from "@/components/FullScreenSpinner";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  tier: string;
  credits_remaining: number;
  last_used_at: string | null;
};

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function DevelopersPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);

  async function fetchKeys() {
    try {
      const res = await fetch("/api/v1/keys", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load keys");
      setKeys(data.keys);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchKeys(); }, []);

  async function handleCreateKey() {
    if (!newKeyName) return;
    setIsCreating(true);
    setErrorMsg(null);
    
    try {
      const res = await fetch("/api/v1/keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create key");
      
      setGeneratedKey(data.apiKey);
      setNewKeyName("");
      setTimeout(() => fetchKeys(), 500); 
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function confirmDelete() {
    if (!keyToDelete) return;
    setIsDeleting(keyToDelete);
    
    try {
      await fetch(`/api/v1/keys/${keyToDelete}`, { method: "DELETE" });
      fetchKeys();
    } finally {
      setIsDeleting(null);
      setKeyToDelete(null);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handlePayment(plan: "api_pro" | "api_enterprise") {
    setIsProcessingPayment(plan);
    setErrorMsg(null);
    
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment");

      const { default: PaystackPop } = await import("@paystack/inline-js");
      const popup = new PaystackPop();

      popup.resumeTransaction(data.access_code, {
        onSuccess: async (transaction: any) => {
          const verifyRes = await fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: transaction.reference }),
          });
          
          if (verifyRes.ok) {
            router.refresh();
            fetchKeys();
          } else {
            setErrorMsg("Payment verification failed.");
          }
          setIsProcessingPayment(null);
        },
        onCancel: () => setIsProcessingPayment(null),
      });
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsProcessingPayment(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] py-24 px-6 relative">
      {isCreating && <FullScreenSpinner />}
      {isProcessingPayment && <FullScreenSpinner />}

      <div className="absolute top-8 left-6 sm:left-12">
        <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#A1A1AA] hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to SwiftSave
        </Link>
      </div>

      {keyToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#0A0A0C] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-semibold text-white">Delete API Key?</h3>
            </div>
            <p className="text-[14px] text-[#A1A1AA] mb-8 leading-relaxed">
              Are you sure? Any apps using this key will break immediately.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setKeyToDelete(null)} className="px-4 py-2 rounded-lg border border-[#27272A] text-white text-[13px] font-medium hover:bg-[#1A1A1C]">Cancel</button>
              <button onClick={confirmDelete} disabled={isDeleting !== null} className="px-4 py-2 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 flex items-center gap-2">
                {isDeleting ? <Spinner size={14} /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl pt-8">
        <div className="mb-12">
          <h1 className="heading-display text-4xl text-white mb-4">Developer API</h1>
          <p className="text-[15px] text-[#A1A1AA]">
            Integrate SwiftSave into your own apps, bots, or websites. Use the API to fetch direct download links programmatically.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* API PRICING SECTION */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#27272A] bg-[#0A0A0A] rounded-xl p-6 flex flex-col">
            <h3 className="text-white font-semibold mb-1">Basic</h3>
            <div className="text-2xl font-bold text-white mb-4">Free</div>
            <p className="text-[12px] text-[#A1A1AA] mb-4">For testing and side projects.</p>
            <div className="mt-auto pt-4 border-t border-[#27272A]">
              <p className="text-[13px] text-[#3B82F6] font-medium mb-3">50 requests / month</p>
              <button disabled className="w-full py-2 rounded-lg border border-[#27272A] text-white font-semibold text-[12px] opacity-50 cursor-not-allowed">
                Current Plan
              </button>
            </div>
          </div>
          
          <div className="border border-[#3B82F6]/40 bg-[#0A0A0A] rounded-xl p-6 flex flex-col relative shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <div className="absolute top-0 right-0 bg-[#3B82F6] text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
            <h3 className="text-white font-semibold mb-1">Pro</h3>
            {/* USD DISPLAYED HERE */}
            <div className="text-2xl font-bold text-white mb-4">$29<span className="text-sm text-[#A1A1AA] font-normal">/mo</span></div>
            <p className="text-[12px] text-[#A1A1AA] mb-4">For production bots and apps.</p>
            <div className="mt-auto pt-4 border-t border-[#27272A]">
              <p className="text-[13px] text-[#3B82F6] font-medium mb-3">5,000 requests / month</p>
              <button 
                onClick={() => handlePayment("api_pro")}
                disabled={isProcessingPayment !== null}
                className="w-full py-2 rounded-lg bg-[#3B82F6] text-white font-semibold text-[12px] hover:bg-[#2563EB] transition-colors disabled:opacity-50"
              >
                {isProcessingPayment === "api_pro" ? "Processing..." : "Upgrade to Pro"}
              </button>
            </div>
          </div>

          <div className="border border-[#27272A] bg-[#0A0A0A] rounded-xl p-6 flex flex-col">
            <h3 className="text-white font-semibold mb-1">Enterprise</h3>
            {/* USD DISPLAYED HERE */}
            <div className="text-2xl font-bold text-white mb-4">$99<span className="text-sm text-[#A1A1AA] font-normal">/mo</span></div>
            <p className="text-[12px] text-[#A1A1AA] mb-4">For high-traffic services.</p>
            <div className="mt-auto pt-4 border-t border-[#27272A]">
              <p className="text-[13px] text-[#3B82F6] font-medium mb-3">20,000 requests / month</p>
              <button 
                onClick={() => handlePayment("api_enterprise")}
                disabled={isProcessingPayment !== null}
                className="w-full py-2 rounded-lg border border-[#27272A] text-white font-semibold text-[12px] hover:bg-[#1A1A1C] transition-colors disabled:opacity-50"
              >
                {isProcessingPayment === "api_enterprise" ? "Processing..." : "Upgrade to Enterprise"}
              </button>
            </div>
          </div>
        </div>

        {generatedKey && (
          <div className="mb-8 rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 p-6">
            <h3 className="text-white font-semibold mb-2">Your new API key</h3>
            <p className="text-[12px] text-[#A1A1AA] mb-4">Please copy this key and store it securely. It will not be shown again.</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded bg-black p-3 text-[13px] text-green-400 font-mono break-all border border-[#27272A]">{generatedKey}</code>
              <button onClick={() => copyToClipboard(generatedKey)} className="btn-primary p-3 h-full rounded-md">
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <button onClick={() => setGeneratedKey(null)} className="mt-4 text-[12px] text-[#A1A1AA] hover:text-white underline">Done</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="border border-[#27272A] bg-[#0A0A0A] rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Generate a new key</h2>
              <input
                type="text"
                placeholder="Key name (e.g. My Discord Bot)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="input-minimal mb-4"
                disabled={isCreating}
              />
              <button onClick={handleCreateKey} disabled={isCreating || !newKeyName} className="btn-primary flex h-11 w-full items-center justify-center gap-2">
                {isCreating ? <><Spinner size={16} /> Creating...</> : <><Plus size={16} /> Create Key</>}
              </button>
            </div>

            <div className="border border-[#27272A] bg-[#0A0A0A] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Code2 size={18} className="text-[#3B82F6]" /> Quick Start
              </h2>
              <div className="bg-[#141416] rounded p-4 overflow-x-auto">
                <pre className="text-[11px] text-[#A1A1AA] font-mono leading-relaxed">
{`POST /api/v1/fetch
Headers:
  Authorization: Bearer <YOUR_KEY>
  Content-Type: application/json
Body:
  { "url": "https://tiktok.com/..." }`}
                </pre>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Your Keys</h2>
            {loading ? (
              <div className="flex justify-center py-10"><Spinner size={24} /></div>
            ) : keys.length === 0 ? (
              <div className="border border-dashed border-[#27272A] rounded-xl p-8 text-center">
                <Key size={24} className="mx-auto text-[#555555] mb-3" />
                <p className="text-[13px] text-[#A1A1AA]">You haven't generated any API keys yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => (
                  <div key={k.id} className="border border-[#27272A] bg-[#0A0A0A] rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{k.name}</p>
                        <p className="text-[11px] text-[#A1A1AA] font-mono mt-1">{k.key_prefix}••••••••</p>
                      </div>
                      <button onClick={() => setKeyToDelete(k.id)} className="text-[#A1A1AA] hover:text-red-400 p-1 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-3 border-t border-[#27272A]">
                      <span className="text-[#A1A1AA] capitalize">{k.tier} Tier</span>
                      <span className={k.credits_remaining > 0 ? "text-green-400" : "text-red-400"}>
                        {k.credits_remaining} credits left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}