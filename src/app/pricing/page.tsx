// src/app/pricing/page.tsx
"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0C] py-24 px-6">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="heading-display text-5xl text-white mb-4">Upgrade your workflow.</h1>
          <p className="text-[15px] text-[#A1A1AA] mb-8">Choose the plan that fits your needs. Cancel anytime.</p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-[#141416] border border-[#27272A] rounded-full p-1">
            <button 
              onClick={() => setIsYearly(false)} 
              className={`px-6 py-2 rounded-full text-[12px] font-semibold transition-colors ${!isYearly ? 'bg-[#27272A] text-white' : 'text-[#A1A1AA]'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsYearly(true)} 
              className={`px-6 py-2 rounded-full text-[12px] font-semibold transition-colors ${isYearly ? 'bg-[#27272A] text-white' : 'text-[#A1A1AA]'}`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Free Tier */}
          <div className="border border-[#27272A] bg-[#0A0A0A] rounded-2xl p-8 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-2">Free</h2>
            <p className="text-[13px] text-[#A1A1AA] mb-6">For casual downloading.</p>
            <div className="text-4xl font-bold text-white mb-8">$0</div>
            
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><Check size={16} className="text-green-500" /> 10 downloads per day</li>
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><Check size={16} className="text-green-500" /> Up to 720p quality</li>
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><X size={16} className="text-red-500" /> No Batch downloads</li>
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><X size={16} className="text-red-500" /> No Pro Tools (Stats/Text Removal)</li>
            </ul>
            
            <button className="w-full py-3 rounded-lg border border-[#27272A] text-white font-semibold text-[13px] hover:bg-[#1A1A1C] transition-colors">
              Current Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="border border-[#3B82F6] bg-[#0A0A0A] rounded-2xl p-8 flex flex-col relative shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#3B82F6] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Pro</h2>
            <p className="text-[13px] text-[#A1A1AA] mb-6">For power users and creators.</p>
            <div className="text-4xl font-bold text-white mb-8">
              ${isYearly ? "38" : "3.99"}<span className="text-[14px] text-[#A1A1AA] font-normal">/{isYearly ? "yr" : "mo"}</span>
            </div>
            
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-[13px] text-white"><Check size={16} className="text-[#3B82F6]" /> 100 downloads per day</li>
              <li className="flex items-center gap-3 text-[13px] text-white"><Check size={16} className="text-[#3B82F6]" /> Up to 1080p quality</li>
              <li className="flex items-center gap-3 text-[13px] text-white"><Check size={16} className="text-[#3B82F6]" /> Batch Mode (5 links)</li>
              <li className="flex items-center gap-3 text-[13px] text-white"><Check size={16} className="text-[#3B82F6]" /> Pro Tools (Stats/Text Removal)</li>
            </ul>
            
            <button className="w-full py-3 rounded-lg bg-[#3B82F6] text-white font-semibold text-[13px] hover:bg-[#2563EB] transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              Upgrade to Pro
            </button>
          </div>

          {/* Pro Plus Tier */}
          <div className="border border-[#27272A] bg-[#0A0A0A] rounded-2xl p-8 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-2">Pro Plus</h2>
            <p className="text-[13px] text-[#A1A1AA] mb-6">For agencies and heavy usage.</p>
            <div className="text-4xl font-bold text-white mb-8">
              ${isYearly ? "95" : "9.99"}<span className="text-[14px] text-[#A1A1AA] font-normal">/{isYearly ? "yr" : "mo"}</span>
            </div>
            
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><Check size={16} className="text-green-500" /> Unlimited downloads*</li>
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><Check size={16} className="text-green-500" /> Up to 4K / 8K quality</li>
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><Check size={16} className="text-green-500" /> Batch Mode (20 links)</li>
              <li className="flex items-center gap-3 text-[13px] text-[#A1A1AA]"><Check size={16} className="text-green-500" /> Priority API Queue</li>
            </ul>
            
            <button className="w-full py-3 rounded-lg border border-[#27272A] text-white font-semibold text-[13px] hover:bg-[#1A1A1C] transition-colors">
              Upgrade to Pro Plus
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}