// src/app/api/chat/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const text = message.toLowerCase();

    // Simple rule-based matching
    let reply = "";

    if (text.includes("price") || text.includes("cost") || text.includes("pro") || text.includes("plan")) {
      reply = "Our Pro plan is $3.99/month (100 downloads/day, 1080p, Batch Mode, Pro Tools). Our Pro Plus plan is $9.99/month (Unlimited downloads, 4K). The Free plan gives you 5 downloads per day.";
    } 
    else if (text.includes("free") || text.includes("limit")) {
      reply = "The Free plan allows 5 downloads per day. If you hit the limit, you can either wait until tomorrow or upgrade to Pro for 100 downloads per day.";
    } 
    else if (text.includes("batch") || text.includes("multiple")) {
      reply = "Batch mode is a Pro feature! It lets you paste up to 5 links at once and download them all simultaneously.";
    } 
    else if (text.includes("api") || text.includes("developer")) {
      reply = "We have a Developer API! You can generate API keys on the /developers page. Basic is free (50 calls), Pro is $29/month for 5,000 calls.";
    } 
    else if (text.includes("platform") || text.includes("tiktok") || text.includes("youtube") || text.includes("instagram")) {
      reply = "SwiftSave supports TikTok, Instagram, YouTube, X (Twitter), Pinterest, and Facebook. We do not support adult sites or private videos.";
    } 
    else if (text.includes("mp3") || text.includes("audio") || text.includes("music")) {
      reply = "Yes! You can extract MP3 audio from TikTok and YouTube videos. Just click the 'Extract MP3' button on the result card.";
    } 
    else if (text.includes("cancel") || text.includes("refund")) {
      reply = "You can cancel your subscription anytime. Just reply to your Paystack receipt email or contact us via WhatsApp.";
    } 
    else if (text.includes("watermark")) {
      reply = "Never! We download the original file directly from the platform servers. Your videos will always be clean with no added watermarks.";
    } 
    else if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
      reply = "Hello! I am the SwiftSave support bot. Ask me about our pricing, supported platforms, or how to use the app!";
    } 
    else {
      reply = "I'm not sure about that. Please contact our human support on WhatsApp for faster help: https://wa.me/233559326645";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}