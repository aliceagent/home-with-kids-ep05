import {
  BEIJING_NOTES,
  CULTURE_CARDS,
  GRAMMAR_STEPS,
  IDIOMS,
  VOCAB_DECKS,
} from "@/data/curriculum";
import {
  beatById,
  fourStringChoices,
  sampleBeats,
  shuffle,
} from "@/lib/train-pool";
import type { Beat } from "@/types/lesson";

export type NoteMcq = {
  beatId?: string;
  correctId: string;
  choices: { id: string; label: string; lang?: string; correct: boolean }[];
  prompt: string;
  promptZh?: string;
  pinyin?: string;
  english?: string;
  note?: string;
};

function withChoices(
  correct: string,
  distractors: string[],
  extra: Omit<NoteMcq, "choices" | "correctId">,
  lang?: string,
): NoteMcq {
  const choices = fourStringChoices(correct, distractors).map((c) =>
    lang ? { ...c, lang } : c,
  );
  return {
    ...extra,
    choices,
    correctId: choices.find((c) => c.correct)?.id ?? "a",
  };
}

export function buildIdiomRound(): NoteMcq[] {
  return shuffle(IDIOMS).map((idiom) => {
    const others = IDIOMS.filter((o) => o.id !== idiom.id).map((o) => o.english);
    return withChoices(
      idiom.english,
      [idiom.trap ?? "", idiom.literal, ...others],
      {
        beatId: idiom.anchors[0],
        prompt: `What does this mean as used in the episode?`,
        promptZh: idiom.chinese,
        pinyin: idiom.pinyin,
        english: idiom.english,
        note: idiom.trap ?? `Literally: ${idiom.literal}.`,
      },
    );
  });
}

export function buildGrammarRound(): NoteMcq[] {
  return shuffle(GRAMMAR_STEPS).map((step) => {
    const others = GRAMMAR_STEPS.filter((o) => o.id !== step.id).map(
      (o) => `${o.pattern} — ${o.english}`,
    );
    return withChoices(`${step.pattern} — ${step.english}`, others, {
      beatId: step.anchors[0],
      prompt: "Which pattern is this line using?",
      promptZh: step.example,
      pinyin: step.examplePinyin,
      english: step.exampleEnglish,
      note: `${step.pattern}: ${step.english}`,
    });
  });
}

export function buildBeijingRound(): NoteMcq[] {
  const pool: { note: (typeof BEIJING_NOTES)[number]; beat: Beat }[] = [];
  for (const note of BEIJING_NOTES) {
    for (const id of note.anchors) {
      const beat = beatById(id);
      if (beat?.chinese) pool.push({ note, beat });
    }
  }
  return sampleBeats(pool, 8).map(({ note, beat }) => {
    const others = BEIJING_NOTES.filter((o) => o.id !== note.id).map((o) => o.standard);
    return withChoices(note.standard, [...others, note.english], {
      beatId: beat.id,
      prompt: `In this line, what is the standard Mandarin for ${note.feature}?`,
      promptZh: beat.chinese,
      pinyin: beat.pinyin,
      english: beat.english,
      note: `${note.feature} (${note.featurePinyin}) — ${note.english}. ${note.explanation}`,
    });
  });
}

export function buildClozeRound(): NoteMcq[] {
  const items = VOCAB_DECKS.flatMap((deck) =>
    deck.items.map((item) => ({
      ...item,
      deckId: deck.id,
      others: deck.items.filter((o) => o.chinese !== item.chinese).map((o) => o.chinese),
    })),
  );
  const pool = items.flatMap((item) => {
    const beat = item.heardAt.map(beatById).find((b) => b?.chinese.includes(item.chinese));
    if (!beat) return [];
    return [
      {
        item,
        beat,
        blanked: beat.chinese.replace(item.chinese, "______"),
      },
    ];
  });
  return sampleBeats(pool, 8).map(({ item, beat, blanked }) =>
    withChoices(
      item.chinese,
      item.others,
      {
        beatId: beat.id,
        prompt: "Which word fills the blank?",
        promptZh: blanked,
        pinyin: item.pinyin,
        english: `${item.chinese} — ${item.english}`,
        note: item.note,
      },
      "zh-CN",
    ),
  );
}

function firstSentence(body: string): string {
  const match = body.match(/^[^.!?]+[.!?]?/);
  return (match?.[0] ?? body).trim();
}

export function buildCultureRound(): NoteMcq[] {
  const meaning = CULTURE_CARDS.map((card) =>
    withChoices(
      card.english,
      CULTURE_CARDS.filter((o) => o.id !== card.id).map((o) => o.english),
      {
        beatId: card.anchors[0],
        prompt: "What is this episode note about?",
        promptZh: card.title,
        pinyin: card.titlePinyin,
        english: card.english,
        note: firstSentence(card.body),
      },
    ),
  );
  const facts = CULTURE_CARDS.map((card) =>
    withChoices(
      firstSentence(card.body),
      CULTURE_CARDS.filter((o) => o.id !== card.id).map((o) => firstSentence(o.body)),
      {
        beatId: card.anchors[0],
        prompt: `Which note is true of ${card.title}?`,
        promptZh: card.title,
        pinyin: card.titlePinyin,
        english: card.english,
        note: card.body,
      },
    ),
  );
  return shuffle([...meaning, ...facts]);
}
