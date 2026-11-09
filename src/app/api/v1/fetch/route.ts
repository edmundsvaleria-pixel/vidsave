// src/app/api/v1/fetch/route.ts
import { NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/apiAuth";
import { fetchVideoInfo } from "@/lib/videoApi";

export async function POST(req: Request) {
  // 1. Authenticate the API Key
  const auth = await verifyApiKey(req, "basic");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // 2. Parse the request
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  // 3. Fetch the video (Reusing your existing logic!)
  try {
    const result = await fetchVideoInfo(url);
    
    // 4. Return a clean JSON response
    return NextResponse.json({
      success: true,
      data: {
        title: result.title,
        author: result.author,
        thumbnail: result.thumbnail,
        download_url: result.videoUrl,
        audio_url: result.audioUrl,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}