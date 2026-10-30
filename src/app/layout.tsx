// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "VidSave — Premium Video Downloader", template: "%s | VidSave" },
  description: "Download public videos from TikTok, Instagram, YouTube, Facebook, X, and Suno.",
  // ... (rest of your metadata)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="relative min-h-screen bg-[#0A0A0C] text-[#F5F3EF] antialiased font-sans">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}