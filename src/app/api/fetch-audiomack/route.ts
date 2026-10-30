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
    const fullUrl = `https://www.audiomack.com/${trackPath}`;

    // 1. Try the unofficial API first (using www.audiomack.com)
    const timestamp = Date.now();
    const apiUrl = `http://www.audiomack.com/api/music/url/song/${trackPath}?extended=1&_=${timestamp}`;

    let audioUrl: string | null = null;
    let thumbnail = "";

    try {
      const apiRes = await fetch(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Referer": fullUrl,
        },
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.url) {
          audioUrl = data.url;
          thumbnail = data.image || "";
        }
      }
    } catch {
      // API failed, fall through to HTML extraction
    }

    // 2. Fallback: extract the MP3 URL directly from the HTML page
    if (!audioUrl) {
      const pageRes = await fetch(fullUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!pageRes.ok) {
        throw new Error("Could not reach Audiomack. The song may be private or deleted.");
      }

      const html = await pageRes.text();

      // Look for the direct MP3 URL in the page source
      const mp3Match = html.match(/"audio_url":"(https?:\/\/[^"]+\.mp3[^"]*)"/) ||
                       html.match(/"url":"(https?:\/\/[^"]+\.mp3[^"]*)"/) ||
                       html.match(/(https?:\/\/[^"']+\.mp3[^"']*)/);

      if (mp3Match && mp3Match[1]) {
        audioUrl = mp3Match[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
      }
    }

    if (!audioUrl) {
      throw new Error("Could not extract the audio URL from Audiomack.");
    }

    // Clean up the title and artist from the URL slug
    const title = songSlug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    const author = artist.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

    return NextResponse.json({
      title,
      author,
      thumbnail,
      videoUrl: audioUrl,
      audioUrl: audioUrl,
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