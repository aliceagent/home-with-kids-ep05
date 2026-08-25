import { NextResponse } from "next/server";
import { CHARACTER_VOICES, type CharacterId } from "@/lib/voices";

export const runtime = "nodejs";

/**
 * On-demand xAI TTS. Prefers pre-generated public MP3s when available;
 * this route is for regenerating or custom text.
 */
export async function POST(req: Request) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "XAI_API_KEY not configured on server" },
      { status: 500 },
    );
  }

  const body = await req.json();
  const {
    text,
    language = "zh",
    speaker = "narrator",
    speed = 1,
  }: {
    text?: string;
    language?: string;
    speaker?: CharacterId;
    speed?: number;
  } = body;

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const voice =
    CHARACTER_VOICES[speaker as CharacterId] ?? CHARACTER_VOICES.narrator;

  const res = await fetch("https://api.x.ai/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice_id: voice.voiceId,
      language,
      speed,
      output_format: { codec: "mp3", sample_rate: 24000, bit_rate: 128000 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `xAI TTS failed: ${err}` },
      { status: res.status },
    );
  }

  const audio = await res.arrayBuffer();
  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
      "X-Voice-Id": voice.voiceId,
      "X-Character-En": voice.nameEn,
    },
  });
}
