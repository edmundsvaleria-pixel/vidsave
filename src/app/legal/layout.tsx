// src/app/legal/layout.tsx
import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF]">
      <header className="border-b border-[#27272A] bg-[#000000]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="h-2 w-2 rounded-full bg-[#3B82F6]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">VidSave</span>
          </Link>
          <Link href="/" className="text-[10px] uppercase tracking-[0.2em] text-[#A1A1AA] hover:text-white transition-colors">
            ← Back to App
          </Link>
        </div>
      </header>
      
      <main className="mx-auto max-w-3xl px-6 py-12 pb-24">
        <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#3B82F6] prose-p:text-[#A1A1AA] prose-li:text-[#A1A1AA]">
          {children}
        </div>
      </main>
    </div>
  );
}