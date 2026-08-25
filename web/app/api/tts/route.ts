import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  text?: string;
  voice?: string;
  voiceId?: string;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = body.text?.trim();
  const voice = body.voiceId || body.voice || "aurora";
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const apiKey = process.env.XAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TTS is not configured" },
      { status: 501 },
    );
  }

  const res = await fetch("https://api.x.ai/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice,
      format: "mp3",
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: "TTS upstream failed", detail },
      { status: 502 },
    );
  }

  const audio = await res.arrayBuffer();
  return new NextResponse(audio, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
