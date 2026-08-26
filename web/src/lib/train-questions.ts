/** AGENT-DONE(C3): shared listening / who-said-it / tone builders so daily mix and the original modes cannot drift. */

import type { Beat } from "@/types/lesson";
import { EP05_META } from "@/lib/episode-meta";
import {
  fourEnglishChoices,
  quizableDialogue,
  sampleBeats,
  shuffle,
  similarBeats,
  spokenByCast,
} from "@/lib/train-pool";
import { fourToneChoices, tonedVocab, type ToneItem } from "@/lib/tone-drill";

export type ListeningQ = {
  beat: Beat;
  choices: { id: string; label: string; correct: boolean }[];
  correctId: string;
};

export function buildListeningQuestions(n = 8): ListeningQ[] {
  const pool = quizableDialogue();
  return sampleBeats(pool, n).map((beat) => {
    const choices = fourEnglishChoices(beat, similarBeats(pool, beat, 3));
    return {
      beat,
      choices: choices.map((c) => ({ id: c.id, label: c.label, correct: c.correct })),
      correctId: choices.find((c) => c.correct)?.id ?? "a",
    };
  });
}

const CHOICE_IDS = ["a", "b", "c", "d"] as const;

export type WhoQ = {
  beat: Beat;
  choices: {
    id: (typeof CHOICE_IDS)[number];
    name: string;
    nameEn: string;
    color: string;
  }[];
  correctId: string;
};

export function buildWhoSaidItQuestions(n = 8): WhoQ[] {
  const pool = spokenByCast();
  return sampleBeats(pool, n).map((beat) => {
    const choices = shuffle([...EP05_META.characters]).map((c, i) => ({
      id: CHOICE_IDS[i],
      name: c.name,
      nameEn: c.nameEn,
      color: c.color,
    }));
    return {
      beat,
      choices,
      correctId: choices.find((c) => c.name === beat.speaker)?.id ?? "a",
    };
  });
}

export type ToneQ = {
  item: ToneItem;
  choices: { id: string; label: string; correct: boolean }[];
  correctId: string;
};

export function buildToneQuestions(n = 8): ToneQ[] {
  const pool = tonedVocab();
  return shuffle(pool)
    .slice(0, n)
    .map((item) => {
      const choices = fourToneChoices(item.pinyin);
      return {
        item,
        choices,
        correctId: choices.find((c) => c.correct)?.id ?? "a",
      };
    });
}
