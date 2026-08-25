#!/usr/bin/env node
/**
 * Fill empty pinyin fields from Chinese text.
 * Usage: node scripts/fill-pinyin.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pinyin } from "pinyin-pro";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BEATS_PATH = path.join(__dirname, "../src/data/ep05-beats.json");

const beats = JSON.parse(fs.readFileSync(BEATS_PATH, "utf8"));

let filled = 0;
for (const beat of beats) {
  if (!beat.chinese?.trim()) continue;
  if (beat.pinyin?.trim()) continue;
  if (!/[\u4e00-\u9fff]/.test(beat.chinese)) continue;
  beat.pinyin = pinyin(beat.chinese, { toneType: "symbol", separator: " " });
  filled++;
}

fs.writeFileSync(BEATS_PATH, JSON.stringify(beats, null, 2));
console.log(`Filled pinyin for ${filled} beats`);
