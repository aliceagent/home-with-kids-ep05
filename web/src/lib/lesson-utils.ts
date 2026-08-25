import type { Beat, BeatType } from "@/types/lesson";
import { DEFAULT_EPISODE_ID } from "@/lib/episode-meta";
import { IDIOMS, VOCAB_DECKS, type VocabItem } from "@/data/curriculum";

export function ghibliBase(episodeId = DEFAULT_EPISODE_ID): string {
  return `/lessons/${episodeId}/ghibli-4x3`;
}

export function framesBase(episodeId = DEFAULT_EPISODE_ID): string {
  return `/lessons/${episodeId}/frames`;
}

/** Ghibli stylized URLs to try in order (jpg from img2img, legacy png, raw frame) */
export function getSceneImageCandidates(
  source: string | null,
  episodeId = DEFAULT_EPISODE_ID,
): string[] {
  if (!source) return [];
  const stem = source.replace(/\.jpg$/i, "");
  const ghibli = ghibliBase(episodeId);
  const frames = framesBase(episodeId);
  return [
    `${ghibli}/${stem}.jpg`,
    `${ghibli}/${stem}.png`,
    `${frames}/${source}`,
  ];
}

export function getSceneImageUrl(source: string | null): string | null {
  const candidates = getSceneImageCandidates(source);
  return candidates[0] ?? null;
}

export function getSceneFrameFallbackUrl(
  source: string | null,
  episodeId = DEFAULT_EPISODE_ID,
): string | null {
  if (!source) return null;
  return `${framesBase(episodeId)}/${source}`;
}

export function beatTypeLabel(type: BeatType): string {
  const labels: Record<BeatType, string> = {
    title: "Intro",
    dialogue: "Dialogue",
    vocab: "Vocabulary",
    idiom: "Idiom",
    grammar: "Grammar",
    note: "Note",
    beijing: "Beijing speech",
    culture: "Culture",
    deck: "Review",
    outro: "Next lesson",
  };
  return labels[type];
}

export function beatTypeColor(type: BeatType): string {
  const colors: Record<BeatType, string> = {
    title: "bg-amber-500/15 text-amber-800 border-amber-300",
    dialogue: "bg-teal-500/15 text-teal-900 border-teal-300",
    vocab: "bg-violet-500/15 text-violet-900 border-violet-300",
    idiom: "bg-rose-500/15 text-rose-900 border-rose-300",
    grammar: "bg-sky-500/15 text-sky-900 border-sky-300",
    note: "bg-amber-500/15 text-amber-900 border-amber-300",
    beijing: "bg-orange-500/15 text-orange-900 border-orange-300",
    culture: "bg-emerald-500/15 text-emerald-900 border-emerald-300",
    deck: "bg-indigo-500/15 text-indigo-900 border-indigo-300",
    outro: "bg-orange-500/15 text-orange-900 border-orange-300",
  };
  return colors[type];
}

export function speakerColor(speaker: string | null): string {
  if (!speaker) return "bg-muted text-muted-foreground";
  const map: Record<string, string> = {
    夏雪: "bg-red-500/15 text-red-900 border-red-300",
    刘梅: "bg-pink-500/15 text-pink-900 border-pink-300",
    夏东海: "bg-blue-500/15 text-blue-900 border-blue-300",
    夏雨: "bg-green-500/15 text-green-900 border-green-300",
  };
  return map[speaker] ?? "bg-muted text-muted-foreground border-border";
}

/** Speaker badge styles for dark subtitle / scene overlays */
export function speakerColorOnDark(speaker: string | null): string {
  if (!speaker) return "bg-black/60 text-white border-white/30";
  const map: Record<string, string> = {
    夏雪: "bg-black/60 text-white border-red-400",
    刘梅: "bg-black/60 text-white border-pink-400",
    夏东海: "bg-black/60 text-white border-blue-400",
    夏雨: "bg-black/60 text-white border-green-400",
  };
  return map[speaker] ?? "bg-black/60 text-white border-white/30";
}

export function speakerDotOnDark(speaker: string | null): string {
  if (!speaker) return "bg-white/70";
  const map: Record<string, string> = {
    夏雪: "bg-red-400",
    刘梅: "bg-pink-400",
    夏东海: "bg-blue-400",
    夏雨: "bg-green-400",
  };
  return map[speaker] ?? "bg-white/70";
}

export function hasTeachingCard(beat: Beat): boolean {
  return Boolean(beat.grammar || beat.vocab || beat.idiom || beat.breakdown?.length);
}

/* ------------------------------------------------------------------ *
 * Word glosses — the lexicon behind tappable subtitle words
 * ------------------------------------------------------------------ */

/** One dictionary entry: what a tapped word means */
export interface GlossEntry {
  chinese: string;
  pinyin: string;
  english: string;
}

/** One run of a Chinese line — either a glossed word or plain text */
export interface GlossSegment {
  text: string;
  gloss: GlossEntry | null;
}

const HAN = /^[\u4e00-\u9fff]/;

function addGloss(
  map: Map<string, GlossEntry>,
  chinese: string,
  pinyin: string,
  english: string,
): void {
  const word = chinese.trim();
  // Whatever the curriculum teaches first wins — later, looser sources
  // (breakdown fragments) never overwrite a real dictionary entry
  if (!word || map.has(word) || !HAN.test(word)) return;
  map.set(word, { chinese: word, pinyin: pinyin.trim(), english: english.trim() });
}

/**
 * Breakdown lines read "乐 yuè = music" or "词 cí — meaning". Parsing is
 * deliberately lenient: word, optional pinyin, then any of = — – - and the
 * gloss. Anything that does not split cleanly is skipped.
 */
export function parseBreakdownLine(line: string): GlossEntry | null {
  const match = line.match(/^\s*([\u4e00-\u9fff]+)\s*([^=—–-]*?)\s*[=—–-]+\s*(\S.*?)\s*$/);
  if (!match) return null;
  return { chinese: match[1], pinyin: match[2], english: match[3] };
}

/** A vocab entry may list alternatives, e.g. "公 / 母" with "gōng / mǔ" */
function addVocabItem(map: Map<string, GlossEntry>, item: VocabItem): void {
  const words = item.chinese.split("/");
  const pinyins = item.pinyin.split("/");
  words.forEach((word, i) => {
    addGloss(map, word, words.length === pinyins.length ? pinyins[i] : item.pinyin, item.english);
  });
}

/**
 * Built once, at module load, from everything the episode actually teaches.
 * Single characters pulled out of a breakdown are left out on purpose — 乐 is
 * "music" in 乐队 but "happy" in 快乐, and a wrong gloss is worse than none.
 * They still gloss on the beat that carries that breakdown (see below).
 */
const GLOSS_LEXICON: Map<string, GlossEntry> = (() => {
  const map = new Map<string, GlossEntry>();
  for (const idiom of IDIOMS) addGloss(map, idiom.chinese, idiom.pinyin, idiom.english);
  for (const deck of VOCAB_DECKS) {
    for (const item of deck.items) addVocabItem(map, item);
  }
  for (const deck of VOCAB_DECKS) {
    for (const item of deck.items) {
      for (const line of item.breakdown ?? []) {
        const entry = parseBreakdownLine(line);
        if (entry && entry.chinese.length > 1) {
          addGloss(map, entry.chinese, entry.pinyin, entry.english);
        }
      }
    }
  }
  return map;
})();

const GLOSS_MAX_LEN = [...GLOSS_LEXICON.keys()].reduce((n, k) => Math.max(n, k.length), 0);

/** The beat's own breakdown, which outranks the shared lexicon on that line */
function beatGlosses(beat: Beat): Map<string, GlossEntry> {
  const map = new Map<string, GlossEntry>();
  for (const line of beat.breakdown ?? []) {
    const entry = parseBreakdownLine(line);
    if (entry) map.set(entry.chinese, entry);
  }
  return map;
}

/** Longest match first, so 乐队 wins over 乐 */
function segmentLine(line: string, local: Map<string, GlossEntry>): GlossSegment[] {
  const segments: GlossSegment[] = [];
  const maxLen = [...local.keys()].reduce((n, k) => Math.max(n, k.length), GLOSS_MAX_LEN);
  let plain = "";
  let i = 0;

  while (i < line.length) {
    let hit: GlossEntry | null = null;
    let hitLen = 0;
    for (let n = Math.min(maxLen, line.length - i); n >= 1; n--) {
      const candidate = line.slice(i, i + n);
      const entry = local.get(candidate) ?? GLOSS_LEXICON.get(candidate);
      if (entry) {
        hit = entry;
        hitLen = n;
        break;
      }
    }
    if (!hit) {
      plain += line[i];
      i += 1;
      continue;
    }
    if (plain) {
      segments.push({ text: plain, gloss: null });
      plain = "";
    }
    segments.push({ text: line.slice(i, i + hitLen), gloss: hit });
    i += hitLen;
  }

  if (plain) segments.push({ text: plain, gloss: null });
  return segments;
}

/** Beats are immutable, so one pass per line is all anyone ever pays for */
const segmentCache = new Map<string, GlossSegment[]>();

export function glossSegments(beat: Beat): GlossSegment[] {
  const cached = segmentCache.get(beat.id);
  if (cached) return cached;
  const segments = segmentLine(beat.chinese, beatGlosses(beat));
  segmentCache.set(beat.id, segments);
  return segments;
}
