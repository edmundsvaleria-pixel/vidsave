// src/app/api/fetch-spotify/route.ts
import { NextResponse } from "next/server";
// @ts-ignore - Type definitions might not be perfect for this package
import SpotifyDL from "spotidownloader";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !url.includes("spotify.com/track/")) {
      throw new Error("Please provide a valid Spotify track link.");
    }

    // Call the free spotidownloader package
    const track = await SpotifyDL.get(url);

    if (track.error) {
      throw new Error(track.error);
    }

    return NextResponse.json({
      title: track.title || "Spotify Track",
      author: track.artist || "Unknown Artist",
      thumbnail: track.cover || "",
      videoUrl: track.download, // The direct MP3 link
      audioUrl: track.download,
      platform: "spotify",
      audioPending: false,
      kind: "video", // We use "video" kind so the UI renders correctly
      items: [],
      formats: null,
    });
  } catch (error: any) {
    console.error("Spotify error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Spotify track." },
      { status: 400 }
    );
  }
}