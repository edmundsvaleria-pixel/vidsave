// src/app/pricing/page.tsx
"use client";

import { useState } from "react";
import { Check, X, ShieldCheck, Zap, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handlePayment(plan: "pro" | "pro_plus") {
    setIsProcessingPayment(plan);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment.");

      const { default: PaystackPop } = await import("@paystack/inline-js");
      const popup = new PaystackPop();

      popup.resumeTransaction(data.access_code, {
        // Force the payment channels in the popup
        channels: ["card", "mobile_money", "bank_transfer"],
        onSuccess: async (transaction: any) => {
          const verifyRes = await fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: transaction.reference }),
          });
          
          if (verifyRes.ok) {
            router.push("/?upgraded=true");
            router.refresh();
          } else {
            setErrorMsg("Payment verification failed. Please contact support.");
          }
          setIsProcessingPayment(null);
        },
        onCancel: () => {
          setIsProcessingPayment(null);
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsProcessingPayment(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] py-24 px-6 relative">
      <div className="absolute top-8 left-6 sm:left-12">
        <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#A1A1AA] hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to SwiftSave
        </Link>
      </div>

      <div className="mx-auto max-w-6xl pt-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#27272A] bg-[#141416] px-3 py-1 text-[11px] font-medium text-[#A1A1AA] mb-6">
            <ShieldCheck size={14} className="text-[#3B82F6]" />
            Secure checkout via Paystack
          </div>
          <h1 className="heading-display text-5xl text-white mb-4">Upgrade to SwiftSave Pro</h1>
          <p className="text-[15px] text-[#A1A1AA] mb-8">Choose the plan that fits your needs. Cancel anytime.</p>
          
          <div className="inline-flex items-center gap-4 bg-[#141416] border border-[#27272A] rounded-full p-1">
            <button onClick={() => setIsYearly(false)} className={`px-6 py-2 rounded-full text-[12px] font-semibold transition-colors ${!isYearly ? 'bg-[#27272A] text-white' : 'text-[#A1A1AA] hover:text-white'}`}>Monthly</button>
            <button onClick={() => setIsYearly(true)} className={`px-6 py-2 rounded-full text-[12px] font-semibold transition-colors flex items-center gap-2 ${isYearly ? 'bg-[#27272A] text-white' : 'text-[#A1A1AA] hover:text-white'}`}>Yearly <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[9px]">Save 20%</span></button>
          </div>
        </div>

        {errorMsg && (
          <div className="max-w-md mx-auto mb-8 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-[13px] text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Free Tier */}
          <div className="border border-[#27272A] bg-[#0A0A0A] rounded-2xl p-8 flex flex-col h-full">
            <h2 className="text-xl font-bold text-white mb-2">Free</h2>
            <p className="text-[13px] text-[#A1A1AA] mb-6">For casual downloading.</p>
            <div className="text-4xl font-bold text-white mb-8">$0</div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><Check size={16} className="text-green-500 shrink-0" /> 5 downloads per day</li>
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><Check size={16} className="text-green-500 shrink-0" /> Up to 720p quality</li>
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><X size={16} className="text-red-500 shrink-0" /> No Batch downloads</li>
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><X size={16} className="text-red-500 shrink-0" /> No Pro Tools</li>
            </ul>
            <button disabled className="w-full py-3 rounded-lg border border-[#27272A] text-white font-semibold text-[13px] opacity-50 cursor-not-allowed">Current Plan</button>
          </div>

          {/* Pro Tier */}
          <div className="border border-[#3B82F6] bg-[#0A0A0A] rounded-2xl p-8 flex flex-col h-full relative shadow-[0_0_40px_rgba(59,130,246,0.15)] md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#3B82F6] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
              <Zap size={10} /> Most Popular
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Pro</h2>
            <p className="text-[13px] text-[#A1A1AA] mb-6">For power users and creators.</p>
            <div className="text-4xl font-bold text-white mb-8">
              ${isYearly ? "38" : "3.99"}<span className="text-[14px] text-[#A1A1AA] font-normal">/{isYearly ? "yr" : "mo"}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-[13px] text-white"><Check size={16} className="text-[#3B82F6] shrink-0" /> 100 downloads per day</li>
              <li className="flex items-center gap-3 text-[13px] text-white"><Check size={16} className="text-[#3B82F6] shrink-0" /> Up to 1080p quality</li>
              <li className="flex items-center gap-3 text-[13px] text-white"><Check size={16} className="text-[#3B82F6] shrink-0" /> Batch Mode (5 links)</li>
              <li className="flex items-center gap-3 text-[13px] text-white"><Check size={16} className="text-[#3B82F6] shrink-0" /> Pro Tools (Stats/Text)</li>
            </ul>
            <button onClick={() => handlePayment("pro")} disabled={isProcessingPayment !== null} className="w-full py-3 rounded-lg bg-[#3B82F6] text-white font-semibold text-[13px] hover:bg-[#2563EB] transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50">
              {isProcessingPayment === "pro" ? "Opening Checkout..." : "Upgrade to Pro"}
            </button>
          </div>

          {/* Pro Plus Tier */}
          <div className="border border-[#27272A] bg-[#0A0A0A] rounded-2xl p-8 flex flex-col h-full">
            <h2 className="text-xl font-bold text-white mb-2">Pro Plus</h2>
            <p className="text-[13px] text-[#A1A1AA] mb-6">For agencies and heavy usage.</p>
            <div className="text-4xl font-bold text-white mb-8">
              ${isYearly ? "95" : "9.99"}<span className="text-[14px] text-[#A1A1AA] font-normal">/{isYearly ? "yr" : "mo"}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><Check size={16} className="text-green-500 shrink-0" /> Unlimited downloads*</li>
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><Check size={16} className="text-green-500 shrink-0" /> Up to 4K / 8K quality</li>
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><Check size={16} className="text-green-500 shrink-0" /> Batch Mode (20 links)</li>
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><Check size={16} className="text-green-500 shrink-0" /> Priority API Queue</li>
            </ul>
            <button onClick={() => handlePayment("pro_plus")} disabled={isProcessingPayment !== null} className="w-full py-3 rounded-lg border border-[#27272A] text-white font-semibold text-[13px] hover:bg-[#1A1A1C] transition-colors disabled:opacity-50">
              {isProcessingPayment === "pro_plus" ? "Opening Checkout..." : "Upgrade to Pro Plus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}