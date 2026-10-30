// src/app/api/download-file/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");
  const rawFilename = searchParams.get("filename") || "VidSave";
  const fileType = searchParams.get("type") || "video";

  if (!fileUrl) {
    return new NextResponse("Missing 'url' parameter", { status: 400 });
  }

  try {
    const response = await fetch(fileUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
    });

    if (!response.ok) {
      throw new Error(`CDN responded with ${response.status}`);
    }

    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    const contentLength = response.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    // Clean up the title so it is a safe filename (removes emojis/slashes)
    const safeFilename = rawFilename.replace(/[^a-zA-Z0-9 -_]/g, "").trim() || "VidSave";
    
    // Force the correct file extension
    let ext = ".mp4";
    if (fileType === "audio") ext = ".mp3";
    if (fileType === "image") ext = ".jpg";

    // Force the browser to download it instead of opening it
    headers.set("Content-Disposition", `attachment; filename="${safeFilename}${ext}"`);

    // Stream the file back to the user
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Failed to download file", { status: 500 });
  }
}