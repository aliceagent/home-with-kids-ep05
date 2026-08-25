#!/usr/bin/env node
/**
 * Generate xAI TTS audio for episode beats.
 * Usage: node --env-file=.env.local scripts/generate-audio.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BEATS_FILE =
  process.env.BEATS_FILE || path.join(ROOT, "src/data/ep05-beats.json");
const beats = JSON.parse(fs.readFileSync(BEATS_FILE, "utf8"));

const API_KEY = process.env.XAI_API_KEY;
if (!API_KEY) {
  console.error("Missing XAI_API_KEY");
  process.exit(1);
}

const VOICES = {
  夏雪: "eve",
  刘梅: "ara",
  夏东海: "rex",
  夏雨: "leo",
  narrator: "aurora",
};

const OUT =
  process.env.AUDIO_OUT ||
  path.join(ROOT, "public/lessons/ep05/audio");
fs.mkdirSync(OUT, { recursive: true });

async function tts({ text, voiceId, language, outPath, speed = 1 }) {
  if (!text?.trim()) return;
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
    console.log(`skip ${path.basename(outPath)}`);
    return;
  }
  const res = await fetch("https://api.x.ai/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice_id: voiceId,
      language,
      speed,
      output_format: { codec: "mp3", sample_rate: 24000, bit_rate: 128000 },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS ${res.status} for ${outPath}: ${err}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buf);
  console.log(`✓ ${path.basename(outPath)} (${buf.length} bytes)`);
}

function voiceFor(beat) {
  return VOICES[beat.speaker] || VOICES.narrator;
}

const TEACHING_TYPES = new Set([
  "idiom",
  "grammar",
  "vocab",
  "note",
  "beijing",
  "culture",
  "deck",
]);

async function main() {
  const skipLayers = process.env.SKIP_ENGLISH === "1";
  for (const beat of beats) {
    if (!beat.chinese?.trim() && !beat.narratorScript?.trim()) continue;
    const voice = voiceFor(beat);
    const base = path.join(OUT, beat.id);
    const isTeaching = TEACHING_TYPES.has(beat.type);
    const isTitle = beat.type === "title";

    if (isTeaching || isTitle) {
      if (beat.narratorScript?.trim()) {
        await tts({
          text: beat.narratorScript,
          voiceId: VOICES.narrator,
          language: "en",
          outPath: `${base}-narrator.mp3`,
          speed: 0.92,
        });
      }
      if (isTeaching) continue;
    }

    await tts({
      text: beat.chinese,
      voiceId: voice,
      language: "zh",
      outPath: `${base}-chinese.mp3`,
      speed: 0.95,
    });

    if (!skipLayers && beat.english?.trim()) {
      await tts({
        text: beat.english,
        voiceId: voice,
        language: "en",
        outPath: `${base}-english.mp3`,
      });
    }

    await tts({
      text: beat.chinese,
      voiceId: voice,
      language: "zh",
      outPath: `${base}-pinyin.mp3`,
      speed: 0.75,
    });
  }
  console.log("\nDone. Audio written to", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
