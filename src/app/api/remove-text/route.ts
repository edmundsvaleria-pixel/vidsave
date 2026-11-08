// src/app/api/remove-text/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    const apiKey = process.env.CLIPDROP_API_KEY;

    if (!apiKey) throw new Error("Clipdrop API key not configured.");

    // 1. Fetch the image from the CDN
    const imageRes = await fetch(imageUrl);
    const imageBlob = await imageRes.blob();

    // 2. Send to Clipdrop
    const formData = new FormData();
    formData.append("image_file", imageBlob, "image.jpg");

    const res = await fetch("https://clipdrop-api.co/remove-text/v1", {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to remove text.");
    }

    // 3. Return the new image as a base64 string
    const buffer = await res.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    const mimeType = res.headers.get("content-type") || "image/jpeg";

    return NextResponse.json({ 
      processedImage: `data:${mimeType};base64,${base64Image}` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}