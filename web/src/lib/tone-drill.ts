import { VOCAB_DECKS, type VocabItem } from "@/data/curriculum";

const TONE_SETS = [
  "āáǎà",
  "ēéěè",
  "īíǐì",
  "ōóǒò",
  "ūúǔù",
  "ǖǘǚǜ",
  "ĀÁǍÀ",
  "ĒÉĚÈ",
  "ĪÍǏÌ",
  "ŌÓǑÒ",
  "ŪÚǓÙ",
  "ǕǗǙǛ",
];

function toneHit(ch: string): { set: string; index: number } | null {
  for (const set of TONE_SETS) {
    const index = set.indexOf(ch);
    if (index >= 0) return { set, index };
  }
  return null;
}

export function hasToneMark(pinyin: string): boolean {
  return [...pinyin].some((ch) => toneHit(ch));
}

/** Four readings: the original plus the other three marks on the first toned vowel. */
export function permuteFirstTone(pinyin: string): string[] {
  const chars = [...pinyin];
  for (let i = 0; i < chars.length; i++) {
    const hit = toneHit(chars[i]);
    if (!hit) continue;
    return [0, 1, 2, 3].map((tone) => {
      const next = [...chars];
      next[i] = hit.set[tone];
      return next.join("");
    });
  }
  return [pinyin];
}

function hashSalt(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(n) || 1;
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  let s = seed >>> 0 || 1;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type ToneItem = VocabItem & { deckId: string };

export function tonedVocab(): ToneItem[] {
  return VOCAB_DECKS.flatMap((deck) =>
    deck.items
      .filter((item) => hasToneMark(item.pinyin) && item.heardAt[0])
      .map((item) => ({ ...item, deckId: deck.id })),
  );
}

/** Deterministic A–D order for a word so the correct reading is not always first. */
export function fourToneChoices(pinyin: string): {
  id: string;
  label: string;
  correct: boolean;
}[] {
  const variants = permuteFirstTone(pinyin);
  const ids = ["a", "b", "c", "d"] as const;
  return seededShuffle(variants, hashSalt(pinyin)).map((label, i) => ({
    id: ids[i],
    label,
    correct: label === pinyin,
  }));
}
