// src/app/api/fetch-audiomack/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // Extract the track path (e.g., "skyzen-1/song/veki-veki")
    // Audiomack URLs can be: audiomack.com/artist/song/title OR audiomack.com/song/artist/title
    let match = url.match(/audiomack\.com\/([^/]+)\/song\/([^/?#]+)/);
    
    // Fallback for URLs like audiomack.com/song/artist/title
    if (!match) {
      match = url.match(/audiomack\.com\/song\/([^/]+)\/([^/?#]+)/);
    }

    if (!match) {
      throw new Error("Invalid Audiomack URL. Please provide a direct song link.");
    }

    const artist = match[1];
    const songSlug = match[2];
    const trackPath = `${artist}/song/${songSlug}`;

    // Call Audiomack's public playback API (no auth required)
    const apiRes = await fetch(`https://www.audiomack.com/api/music/url/song/${trackPath}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!apiRes.ok) {
      throw new Error("Could not reach Audiomack. The song may be private or deleted.");
    }

    const data = await apiRes.json();

    if (!data.url) {
      throw new Error("Could not extract the audio URL from Audiomack.");
    }

    // Clean up the title and artist from the URL slug
    const title = songSlug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    const author = artist.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

    return NextResponse.json({
      title,
      author,
      thumbnail: "", // Audiomack API doesn't return a thumbnail in this endpoint
      videoUrl: data.url,
      audioUrl: data.url,
      platform: "audiomack",
      audioPending: false,
      kind: "video", // We use "video" kind so the UI renders correctly (it's handled as audio)
      items: [],
      formats: null,
    });
  } catch (error: any) {
    console.error("Audiomack error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Audiomack song." },
      { status: 400 }
    );
  }
}