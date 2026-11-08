// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SwiftSave — Premium Video Downloader",
    template: "%s | SwiftSave",
  },
  description: "Download public videos from TikTok, Instagram, YouTube, Facebook, X, and Suno. Fast, free, no account required.",
  applicationName: "SwiftSave",
  authors: [{ name: "SwiftSave" }],
  creator: "SwiftSave",
  publisher: "SwiftSave",
  category: "technology",
  verification: {
    google: "eYax6tdfNw8-Db69u7NhySJQLSloZhMoSXQ54ZSjyqQ",
  },
  alternates: { canonical: "/" },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website", locale: "en_US", url: "/", siteName: "SwiftSave",
    title: "SwiftSave — Premium Video Downloader",
    description: "Download public videos from TikTok, Instagram, YouTube, Facebook, X, and Suno.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftSave — Premium Video Downloader",
    description: "Download public videos from TikTok, Instagram, YouTube, Facebook, X, and Suno.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="relative min-h-screen bg-[#0A0A0C] text-[#F5F3EF] antialiased font-sans">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}