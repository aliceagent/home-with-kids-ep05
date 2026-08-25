#!/usr/bin/env node
/**
 * Repair OCR damage in extracted dialogue.
 *
 * Screenshot OCR produces two kinds of noise:
 *   1. Near-duplicate lines — the same subtitle captured on two adjacent
 *      frames, where one capture is garbled.
 *   2. Wrong characters inside an otherwise good line.
 *
 * Run after build:beats, before translate/inject.
 * Usage: node scripts/clean-dialogue.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BEATS_PATH = path.join(__dirname, "../src/data/ep05-beats.json");

/** Garbled captures whose clean twin appears on an adjacent frame */
const DROP_IDS = new Set([
  "020", // 乒真球 / stray punctuation — 021 is the clean capture
  "049", // 杰可爱 — 048 is clean
  "081", // 你是不定决心 — 082 is clean
  "123", // 你正那边去 — 124 is clean
  "125", // 摘下来得T — 126 is clean
  "132", // 真的别美 — 133 is clean
  "146", // spacing-only duplicate of 147
  "151", // 你懂徥够多煎呀 — 150 is clean
  "158", // 喂养隳 — 159 is clean
]);

/** id → corrected Chinese text */
const TEXT_FIXES = {
  "021": "排球 网球 乒乓球 还有铅球。",
  "036": "咱都已经四十了。",
  "055": "肯定都描写什么猫呀狗呀的。",
  "057": "太好笑了 阿姨。",
  "059": "我 我害怕。",
  "071": "怕耗子的这毛病我算是落下了。",
  "073": "对耗子的感情比对我还深呢。",
  "090": "今天已经变小耗子了。",
  "107": "反而会禁锢了你的想象力呀。",
  "138": "怎么又弄一活的来。",
  "152": "好 没问题。",
  "164": "对了 好像也养过小老鼠。",
  "181": "跟我有什么关系呀。",
};

/**
 * Lines that address a character by name cannot be spoken by that character.
 * The block-based extractor mis-assigned these.
 */
const SPEAKER_FIXES = {
  "109": "刘梅", // 是不是啊 夏东海
  "169": "刘梅", // 夏东海 你快帮我拿一下
  "173": "刘梅", // 夏东海 给你茶
  "102": "刘梅", // advising 小雪
  "103": "刘梅",
  "104": "刘梅",
  "105": "刘梅",
  "106": "刘梅",
  "107": "刘梅",
  "108": "刘梅",
};

/** Characters that only ever appear as OCR noise */
const NOISE_CHARS = /[『』〖〗｜]/g;

function cleanText(text) {
  return text
    .replace(NOISE_CHARS, "")
    .replace(/^["'”’]+/, "")
    .replace(/\s*-\s*。/, "。")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function main() {
  const beats = JSON.parse(fs.readFileSync(BEATS_PATH, "utf8"));

  let dropped = 0;
  let textFixed = 0;
  let speakerFixed = 0;
  let scrubbed = 0;

  const out = [];
  for (const beat of beats) {
    if (beat.type === "dialogue" && DROP_IDS.has(beat.id)) {
      dropped++;
      continue;
    }

    const next = { ...beat };

    if (TEXT_FIXES[beat.id]) {
      next.chinese = TEXT_FIXES[beat.id];
      // Pinyin and English were derived from the broken text
      next.pinyin = "";
      next.english = "";
      textFixed++;
    } else if (beat.chinese) {
      const cleaned = cleanText(beat.chinese);
      if (cleaned !== beat.chinese) {
        next.chinese = cleaned;
        scrubbed++;
      }
    }

    if (SPEAKER_FIXES[beat.id]) {
      next.speaker = SPEAKER_FIXES[beat.id];
      speakerFixed++;
    }

    out.push(next);
  }

  fs.writeFileSync(BEATS_PATH, JSON.stringify(out, null, 2));
  console.log(
    `Cleaned dialogue: dropped ${dropped}, retyped ${textFixed}, scrubbed ${scrubbed}, respeakered ${speakerFixed}`,
  );
  console.log(`Beats: ${beats.length} → ${out.length}`);
}

main();
