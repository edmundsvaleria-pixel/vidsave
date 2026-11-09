// src/app/faq/page.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    q: "Is SwiftSave really free?",
    a: "Yes! The free tier allows you to download up to 5 videos per day. If you need more, you can upgrade to SwiftSave Pro for 100 downloads per day, batch processing, and access to Pro Tools.",
  },
  {
    q: "Do you add watermarks to the videos?",
    a: "Never. SwiftSave downloads the original file directly from the platform's servers. Your MP4 and MP3 files will always be clean, with no added watermarks or logos.",
  },
  {
    q: "Which platforms do you support?",
    a: "We currently support TikTok, Instagram (Reels, Posts, and Carousels), YouTube, Facebook, X (Twitter), Pinterest, and Audiomack.",
  },
  {
    q: "How do I use the Pro Tools?",
    a: "After fetching a link, scroll down on the result card. You will see buttons for 'Get Stats' (to see view and like counts) and 'Remove Text' (to clean up the video thumbnail). These are available on Pro and Pro Plus plans.",
  },
  {
    q: "Can I download private videos?",
    a: "No. SwiftSave only works with public, accessible links. If a video is private, deleted, or region-locked, the download will fail.",
  },
  {
    q: "How do I cancel my Pro subscription?",
    a: "You can manage or cancel your subscription at any time by reaching out to us via the Contact page or WhatsApp. You will retain Pro access until the end of your billing cycle.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0A0A0C] py-24 px-6 relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
      
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h1 className="heading-display text-5xl text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-[15px] text-[#A1A1AA]">Everything you need to know about SwiftSave.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-[#27272A] bg-[#141416] rounded-xl overflow-hidden transition-colors hover:border-[#3B82F6]/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-[15px] font-medium text-white">{faq.q}</span>
                {openIndex === index ? (
                  <ChevronUp size={18} className="text-[#3B82F6] shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-[#A1A1AA] shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 text-[14px] leading-relaxed text-[#A1A1AA]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}