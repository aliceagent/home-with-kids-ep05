/* AGENT-DONE(Q3): deck = all VOCAB_DECKS items + IDIOMS; SRS map at hwk-ep05:srs:v1; hub due = unseen + due. */

import { IDIOMS, VOCAB_DECKS } from "@/data/curriculum";
import { readSrsMap, type SrsMap } from "@/lib/train-storage";

export type Flashcard = {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  note?: string;
  beatId?: string;
  kind: "vocab" | "idiom";
};

export function flashcardDeck(): Flashcard[] {
  const vocab: Flashcard[] = VOCAB_DECKS.flatMap((deck) =>
    deck.items.map((item) => ({
      id: `vocab:${deck.id}:${item.chinese}`,
      chinese: item.chinese,
      pinyin: item.pinyin,
      english: item.english,
      note: item.note,
      beatId: item.heardAt[0],
      kind: "vocab" as const,
    })),
  );
  const idioms: Flashcard[] = IDIOMS.map((idiom) => ({
    id: `idiom:${idiom.id}`,
    chinese: idiom.chinese,
    pinyin: idiom.pinyin,
    english: idiom.english,
    note: idiom.trap,
    beatId: idiom.anchors[0],
    kind: "idiom" as const,
  }));
  return [...vocab, ...idioms];
}

export function isCardDue(id: string, map: SrsMap, now: number): boolean {
  const row = map[id];
  if (!row) return false;
  return row.due <= now;
}

export function isNewCard(id: string, map: SrsMap): boolean {
  return !map[id];
}

/** Due SRS cards plus unseen cards — what the hub should advertise. */
export function countFlashcardsDue(now = Date.now()): number {
  const map = readSrsMap();
  return flashcardDeck().filter(
    (c) => isNewCard(c.id, map) || isCardDue(c.id, map, now),
  ).length;
}

export const DAY_MS = 86_400_000;
