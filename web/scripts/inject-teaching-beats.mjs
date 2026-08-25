#!/usr/bin/env node
/**
 * Compose the playable timeline: dialogue + teaching pauses from the curriculum.
 *
 * Idempotent — strips any previously injected teaching beats first, so this can
 * be re-run after editing src/data/curriculum.ts.
 *
 * Usage: node --experimental-strip-types scripts/inject-teaching-beats.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BEATS_PATH = path.join(__dirname, "../src/data/ep05-beats.json");
const CURRICULUM_PATH = path.join(__dirname, "../src/data/curriculum.ts");

const {
  BEIJING_NOTES,
  IDIOMS,
  GRAMMAR_STEPS,
  VOCAB_DECKS,
  CULTURE_CARDS,
} = await import(CURRICULUM_PATH);

/** Injected beats carry this marker in their id */
const INJECT_MARK = "-t-";

const beats = JSON.parse(fs.readFileSync(BEATS_PATH, "utf8"));

// Strip previous injections and any inline badges we will re-derive
const base = beats
  .filter((b) => !b.id.includes(INJECT_MARK))
  .map((b) => {
    const next = { ...b };
    delete next.beijingBadge;
    delete next.beijingTags;
    delete next.standard;
    return next;
  });

const byId = new Map(base.map((b) => [b.id, b]));

/**
 * Tag anchored dialogue with every Beijing feature it contains — a single line
 * can carry more than one (e.g. 晚上咱吃什么呀 has both 咱 and final 呀).
 */
for (const note of BEIJING_NOTES) {
  for (const anchorId of note.anchors) {
    const beat = byId.get(anchorId);
    if (!beat || beat.type !== "dialogue") continue;
    if (!beat.beijingTags) beat.beijingTags = [];
    beat.beijingTags.push({ badge: note.badge, standard: note.standard });
  }
}

/** teachAfter id → list of pause beats to insert */
const pauses = new Map();

function queue(afterId, beat) {
  if (!byId.has(afterId)) {
    console.warn(`  ! anchor ${afterId} not found — skipping ${beat.id}`);
    return;
  }
  if (!pauses.has(afterId)) pauses.set(afterId, []);
  pauses.get(afterId).push(beat);
}

function pauseBeat(afterId, type, suffix, payload) {
  const anchor = byId.get(afterId);
  return {
    id: `${afterId}${INJECT_MARK}${suffix}`,
    type,
    timestamp: anchor?.timestamp ?? "0:00",
    durationSec: payload.durationSec ?? 7,
    speaker: null,
    source: anchor?.source ?? null,
    ...payload,
  };
}

for (const note of BEIJING_NOTES) {
  queue(
    note.teachAfter,
    pauseBeat(note.teachAfter, "beijing", note.id, {
      chinese: note.feature,
      pinyin: note.featurePinyin,
      english: note.english,
      standard: note.standard,
      notes: note.explanation,
      narratorScript: note.narratorScript,
      durationSec: 9,
    }),
  );
}

for (const idiom of IDIOMS) {
  queue(
    idiom.teachAfter,
    pauseBeat(idiom.teachAfter, "idiom", idiom.id, {
      chinese: idiom.chinese,
      pinyin: idiom.pinyin,
      english: idiom.english,
      literal: idiom.literal,
      trap: idiom.trap,
      idiom: idiom.chinese,
      narratorScript: idiom.narratorScript,
      durationSec: 8,
    }),
  );
}

for (const step of GRAMMAR_STEPS) {
  queue(
    step.teachAfter,
    pauseBeat(step.teachAfter, "grammar", step.id, {
      chinese: step.pattern,
      pinyin: step.patternPinyin,
      english: step.english,
      grammar: step.pattern,
      ladder: step.ladder,
      example: step.example,
      examplePinyin: step.examplePinyin,
      exampleEnglish: step.exampleEnglish,
      drill: step.drill,
      drillAnswer: step.drillAnswer,
      narratorScript: step.narratorScript,
      durationSec: 9,
    }),
  );
}

for (const card of CULTURE_CARDS) {
  queue(
    card.teachAfter,
    pauseBeat(card.teachAfter, "culture", card.id, {
      chinese: card.title,
      pinyin: card.titlePinyin,
      english: card.english,
      cultureBody: card.body,
      narratorScript: card.narratorScript,
      durationSec: 10,
    }),
  );
}

for (const deck of VOCAB_DECKS) {
  queue(
    deck.teachAfter,
    pauseBeat(deck.teachAfter, "deck", deck.id, {
      chinese: deck.title,
      pinyin: "",
      english: deck.titleEn,
      deckTitle: deck.title,
      deckTitleEn: deck.titleEn,
      deckTheme: deck.theme,
      deckItems: deck.items.map((i) => ({
        chinese: i.chinese,
        pinyin: i.pinyin,
        english: i.english,
        breakdown: i.breakdown,
        note: i.note,
      })),
      narratorScript: deck.narratorScript,
      durationSec: 12,
    }),
  );
}

/** Order pauses so short cards come before long reviews */
const TYPE_ORDER = { beijing: 0, idiom: 1, grammar: 2, vocab: 3, culture: 4, deck: 5 };

const out = [];
for (const beat of base) {
  out.push(beat);
  const queued = pauses.get(beat.id);
  if (!queued) continue;
  queued.sort((a, b) => (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9));
  out.push(...queued);
}

fs.writeFileSync(BEATS_PATH, JSON.stringify(out, null, 2));

const counts = {};
for (const b of out) counts[b.type] = (counts[b.type] ?? 0) + 1;
const tagged = out.filter((b) => b.beijingTags?.length);
const multi = tagged.filter((b) => b.beijingTags.length > 1).length;

console.log(`Timeline: ${base.length} base → ${out.length} beats`);
console.log(
  Object.entries(counts)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n"),
);
console.log(
  `  (${tagged.length} lines carry a Beijing badge, ${multi} carry more than one)`,
);
