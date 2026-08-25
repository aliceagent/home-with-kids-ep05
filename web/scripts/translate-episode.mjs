#!/usr/bin/env node
/**
 * Fill empty english fields via xAI chat API.
 * Usage: node --env-file=.env.local scripts/translate-episode.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BEATS_PATH = path.join(ROOT, "src/data/ep05-beats.json");
const API_KEY = process.env.XAI_API_KEY;

if (!API_KEY) {
  console.error("Missing XAI_API_KEY");
  process.exit(1);
}

async function translateBatch(lines) {
  const numbered = lines.map((l, i) => `${i + 1}. ${l.chinese}`).join("\n");
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-3-mini",
      messages: [
        {
          role: "system",
          content:
            "Translate each numbered Mandarin dialogue line to natural English for a Chinese learner app. Return ONLY a JSON array of strings, same order and count as input. Keep F4, character names. Subtitles style — concise.",
        },
        { role: "user", content: numbered },
      ],
      temperature: 0.2,
    }),
  });
  if (!res.ok) throw new Error(`Chat ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "";
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON array in response: " + raw.slice(0, 200));
  return JSON.parse(match[0]);
}

async function main() {
  const beats = JSON.parse(fs.readFileSync(BEATS_PATH, "utf8"));
  const pending = beats
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => b.chinese && !b.english);

  console.log(`Translating ${pending.length} lines...`);

  for (let start = 0; start < pending.length; start += 12) {
    const chunk = pending.slice(start, start + 12);
    const translations = await translateBatch(chunk.map((c) => c.b));
    chunk.forEach(({ b, i }, j) => {
      beats[i].english = translations[j] ?? b.english;
    });
    console.log(`✓ ${Math.min(start + 12, pending.length)}/${pending.length}`);
    fs.writeFileSync(BEATS_PATH, JSON.stringify(beats, null, 2));
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
