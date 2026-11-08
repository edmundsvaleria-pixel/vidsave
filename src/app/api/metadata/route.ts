// src/app/api/metadata/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const apiKey = process.env.SUPADATA_API_KEY;

    if (!apiKey) {
      throw new Error("Supadata API key not configured.");
    }

    const res = await fetch(`https://api.supadata.ai/v1/metadata?url=${encodeURIComponent(url)}`, {
      headers: { 
        "x-api-key": apiKey 
      }
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch metadata.");
    }

    return NextResponse.json({ metadata: data });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" }, 
      { status: 400 }
    );
  }
}