// src/app/api/fetch-audiomack/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // Extract the track path (e.g., "alorg/song/wowo")
    let match = url.match(/audiomack\.com\/([^/]+)\/song\/([^/?#]+)/);
    
    if (!match) {
      match = url.match(/audiomack\.com\/song\/([^/]+)\/([^/?#]+)/);
    }

    if (!match) {
      throw new Error("Invalid Audiomack URL. Please provide a direct song link.");
    }

    const artist = match[1];
    const songSlug = match[2];
    const trackPath = `${artist}/song/${songSlug}`;

    // Use the non-www host and add a timestamp to prevent caching/blocking
    const timestamp = Date.now();
    const apiUrl = `http://audiomack.com/api/music/url/song/${trackPath}?extended=1&_=${timestamp}`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://audiomack.com/",
      },
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      throw new Error(`Audiomack responded with ${apiRes.status}: ${errorText.substring(0, 100)}`);
    }

    const data = await apiRes.json();

    if (!data.url) {
      throw new Error("Could not extract the audio URL from Audiomack.");
    }

    const title = songSlug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    const author = artist.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

    return NextResponse.json({
      title,
      author,
      thumbnail: data.image || "",
      videoUrl: data.url,
      audioUrl: data.url,
      platform: "audiomack",
      audioPending: false,
      kind: "video",
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