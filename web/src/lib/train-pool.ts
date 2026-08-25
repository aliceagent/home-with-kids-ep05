import beatsData from "@/data/ep05-beats.json";
import type { Beat } from "@/types/lesson";
import { audioPath } from "@/lib/voices";

export const CAST_SPEAKERS = ["夏雪", "刘梅", "夏东海", "夏雨"] as const;
export type CastSpeaker = (typeof CAST_SPEAKERS)[number];

const ALL = beatsData as Beat[];

export const DIALOGUE_BEATS = ALL.filter((b) => b.type === "dialogue");

function hanLength(text: string): number {
  return [...text].filter((ch) => /\p{Script=Han}/u.test(ch)).length;
}

const FILLERS = new Set(["哎", "嗯", "啊", "哦", "唉"]);

/** Dialogue lines long enough to quiz on (skip 哎/嗯 fillers). */
export function quizableDialogue(): Beat[] {
  return DIALOGUE_BEATS.filter((b) => {
    const compact = b.chinese.replace(/\s/g, "");
    if (FILLERS.has(compact.replace(/[。！？!?，,]/g, ""))) return false;
    return hanLength(b.chinese) >= 6 && Boolean(b.english?.trim());
  });
}

export function spokenByCast(): Beat[] {
  return quizableDialogue().filter(
    (b): b is Beat & { speaker: CastSpeaker } =>
      CAST_SPEAKERS.includes(b.speaker as CastSpeaker),
  );
}

export function chineseClip(id: string): string {
  return audioPath(id, "chinese");
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Closest `n` other dialogue beats by Chinese length (stable tie-break on id). */
export function nearestBeats(pool: Beat[], target: Beat, n: number): Beat[] {
  return pool
    .filter((b) => b.id !== target.id && b.english && b.english !== target.english)
    .map((b) => ({
      b,
      d: Math.abs(hanLength(b.chinese) - hanLength(target.chinese)),
    }))
    .sort((a, c) => a.d - c.d || a.b.id.localeCompare(c.b.id))
    .slice(0, n)
    .map((x) => x.b);
}

/** Pick `n` other dialogue beats close in Chinese length. */
export function similarBeats(pool: Beat[], target: Beat, n: number): Beat[] {
  const near = nearestBeats(pool, target, Math.max(n * 5, n));
  return shuffle(near).slice(0, n);
}

export function sampleBeats(pool: Beat[], n: number): Beat[] {
  return shuffle(pool).slice(0, Math.min(n, pool.length));
}

const CHOICE_IDS = ["a", "b", "c", "d"] as const;

export function fourEnglishChoices(correct: Beat, distractors: Beat[]) {
  const labels = shuffle([
    { id: "", beat: correct },
    ...distractors.slice(0, 3).map((beat) => ({ id: "", beat })),
  ]);
  return labels.map((row, i) => ({
    id: CHOICE_IDS[i],
    label: row.beat.english,
    beatId: row.beat.id,
    correct: row.beat.id === correct.id,
  }));
}
