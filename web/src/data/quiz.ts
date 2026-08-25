import beatsData from "@/data/ep05-beats.json";
import {
  BEIJING_NOTES,
  GRAMMAR_STEPS,
  IDIOMS,
  VOCAB_DECKS,
} from "@/data/curriculum";
import { nearestBeats, quizableDialogue } from "@/lib/train-pool";

export interface QuizChoice {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  promptZh?: string;
  choices: QuizChoice[];
  correctId: string;
  why: string;
  /** Beat id this question is drawn from — powers the "Jump to this line" link */
  beatId?: string;
}

const CHOICE_IDS = ["a", "b", "c", "d"] as const;

const BEAT_IDS = new Set(
  (beatsData as { id: string }[]).map((b) => b.id),
);

function firstBeat(ids: string[]): string | undefined {
  return ids.find((id) => BEAT_IDS.has(id));
}

function packChoices(
  correct: string,
  distractors: string[],
  salt: number,
): { choices: QuizChoice[]; correctId: string } {
  const unique = distractors.filter(
    (d, i, arr) => d !== correct && d.length > 0 && arr.indexOf(d) === i,
  );
  const extras = [
    "None of these — the word is being used as a proper name",
    "The literal reading is the whole meaning",
    "A different line from later in the episode",
    "This is a particle with no standard equivalent",
  ];
  const pool = [...unique];
  for (const extra of extras) {
    if (pool.length >= 3) break;
    if (extra !== correct && !pool.includes(extra)) pool.push(extra);
  }
  const pos = Math.abs(salt) % 4;
  const labels: string[] = [];
  let di = 0;
  for (let i = 0; i < 4; i++) {
    labels[i] = i === pos ? correct : pool[di++] ?? extras[i] ?? "—";
  }
  return {
    choices: CHOICE_IDS.map((id, i) => ({ id, label: labels[i] })),
    correctId: CHOICE_IDS[pos],
  };
}

function hashSalt(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(n);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const HANDWRITTEN_QUIZ: QuizQuestion[] = [
  {
    id: "q-haozi",
    prompt: "When Liu Mei is frightened she says 耗子. What is the textbook word, and why does she switch later?",
    promptZh: "耗子",
    choices: [
      { id: "a", label: "老鼠 — same animal; 耗子 is casual Beijing speech, 老鼠 is the neutral / 'expert' word" },
      { id: "b", label: "仓鼠 — 耗子 means hamster, 老鼠 means mouse" },
      { id: "c", label: "猫咪 — she is talking about the family cat" },
      { id: "d", label: "虫子 — 耗子 is a general word for pests" },
    ],
    correctId: "a",
    why: "耗子 is what Beijing speakers say at home. When Liu Mei pretends to be a mouse specialist she switches to 老鼠 — same creature, different register.",
    beatId: "042",
  },
  {
    id: "q-zan",
    prompt: "夏东海 says 晚上咱吃什么呀. What does 咱 include that 我们 might not?",
    promptZh: "咱",
    choices: [
      { id: "a", label: "Nothing — 咱 and 我们 are always interchangeable" },
      { id: "b", label: "The listener — 咱 is inclusive we; 我们 can leave the other person out" },
      { id: "c", label: "Only children — 咱 is baby talk" },
      { id: "d", label: "Only men — 咱 is a masculine pronoun" },
    ],
    correctId: "b",
    why: "咱 always includes the person you are speaking to. 咱俩 is 'the two of us'. Northern speakers reach for it constantly; textbooks barely mention it.",
    beatId: "025",
  },
  {
    id: "q-haoburongyi",
    prompt: "刘梅 says 我好不容易快背下来了. What does 好不容易 mean here?",
    promptZh: "好不容易",
    choices: [
      { id: "a", label: "It was not easy, and she failed" },
      { id: "b", label: "It was easy after all" },
      { id: "c", label: "Finally / with great difficulty — she succeeded" },
      { id: "d", label: "She does not want to memorize it" },
    ],
    correctId: "c",
    why: "好不 here is an intensifier. 好不容易 marks success after effort — 'I've finally almost got it memorized.' Read it as 'not easy' and you get the meaning backwards.",
    beatId: "030",
  },
  {
    id: "q-bi",
    prompt: "Which sentence uses 比较, not 比…都 / 比…还 — and what does 比较 do?",
    promptZh: "比 / 比较",
    choices: [
      { id: "a", label: "他们比 F1、F2、F3 都帅 — 比较 compares two numbered series" },
      { id: "b", label: "对耗子的感情比对我还深呢 — 比较 means 'even more than'" },
      { id: "c", label: "公老鼠一般都块头比较大 — 比较 means 'relatively / fairly', with no second item" },
      { id: "d", label: "All three use the same 比 pattern" },
    ],
    correctId: "c",
    why: "比 compares two things. 比较 softens one adjective — 'on the large side.' That is step 3 of the 比 ladder in this episode.",
    beatId: "147",
  },
  {
    id: "q-ayi",
    prompt: "Why does 夏雪 call 刘梅 阿姨 instead of 妈?",
    promptZh: "阿姨",
    choices: [
      { id: "a", label: "阿姨 is the child's word for any adult woman who is not her mother — here it marks polite distance" },
      { id: "b", label: "阿姨 is Liu Mei's given name" },
      { id: "c", label: "Chinese children never call stepmothers 妈" },
      { id: "d", label: "She is talking to a different aunt who lives next door" },
    ],
    correctId: "a",
    why: "阿姨 literally means auntie, and kids use it for any adult woman who isn't mum. Xiaoxue calling her stepmother 阿姨 is the quiet engine of the series — polite, and distant. Donghai notices when it upgrades from 哎 to 阿姨.",
    beatId: "085",
  },
];

export const HANDWRITTEN_QUIZ_IDS = new Set(HANDWRITTEN_QUIZ.map((q) => q.id));

function generateIdiomQuestions(): QuizQuestion[] {
  return IDIOMS.map((idiom, index) => {
    const others = IDIOMS.filter((o) => o.id !== idiom.id);
    const distractors = [
      idiom.trap ?? `Literal reading: ${idiom.literal}`,
      idiom.literal,
      ...others.map((o) => o.english),
    ];
    const packed = packChoices(idiom.english, distractors, hashSalt(idiom.id) + index);
    return {
      id: `gen-idiom-${idiom.id}`,
      prompt: `What does ${idiom.chinese} mean as used in this episode?`,
      promptZh: idiom.chinese,
      ...packed,
      why: idiom.trap
        ? `${idiom.english}. Trap: ${idiom.trap}`
        : `${idiom.english}. Literally: ${idiom.literal}.`,
      beatId: firstBeat(idiom.anchors),
    };
  });
}

function generateBeijingQuestions(): QuizQuestion[] {
  return BEIJING_NOTES.map((note, index) => {
    const others = BEIJING_NOTES.filter((o) => o.id !== note.id).map((o) => o.standard);
    const packed = packChoices(note.standard, others, hashSalt(note.id) + index);
    return {
      id: `gen-bj-${note.id}`,
      prompt: `What is the standard Mandarin equivalent of ${note.feature}?`,
      promptZh: note.feature,
      ...packed,
      why: `${note.feature} (${note.featurePinyin}) is ${note.english}. Standard: ${note.standard}. ${note.explanation}`,
      beatId: firstBeat(note.anchors),
    };
  });
}

function generateVocabQuestions(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  for (const deck of VOCAB_DECKS) {
    for (const [index, item] of deck.items.slice(0, 2).entries()) {
      const distractors = deck.items
        .filter((o) => o.chinese !== item.chinese)
        .map((o) => o.english);
      const packed = packChoices(
        item.english,
        distractors,
        hashSalt(item.chinese) + index,
      );
      questions.push({
        id: `gen-vocab-${deck.id}-${item.chinese}`,
        prompt: `What does ${item.chinese} mean?`,
        promptZh: item.chinese,
        ...packed,
        why: item.note
          ? `${item.chinese} (${item.pinyin}) — ${item.english}. ${item.note}`
          : `${item.chinese} (${item.pinyin}) — ${item.english}.`,
        beatId: firstBeat(item.heardAt),
      });
    }
  }
  return questions;
}

function generateGrammarQuestions(): QuizQuestion[] {
  return GRAMMAR_STEPS.map((step, index) => {
    const blanked = step.example.replace(step.pattern.split(" ")[0] ?? "", "______");
    const distractors = GRAMMAR_STEPS.filter((o) => o.id !== step.id).map(
      (o) => `${o.pattern} — ${o.english}`,
    );
    const packed = packChoices(
      `${step.pattern} — ${step.english}`,
      distractors,
      hashSalt(step.id) + index,
    );
    return {
      id: `gen-gr-${step.id}`,
      prompt: `Cloze from the episode: which pattern fills 「${blanked}」?`,
      promptZh: step.example,
      ...packed,
      why: `${step.english} Worked example: ${step.example} (${step.exampleEnglish})`,
      beatId: firstBeat(step.anchors),
    };
  });
}

function generateSentenceQuestions(): QuizQuestion[] {
  const pool = quizableDialogue();
  return pool.map((beat, index) => {
    const distractors = nearestBeats(pool, beat, 3).map((b) => b.english);
    const packed = packChoices(beat.english, distractors, hashSalt(beat.id) + index);
    return {
      id: `gen-sent-${beat.id}`,
      prompt: "What does this line mean?",
      promptZh: beat.chinese,
      ...packed,
      why: beat.speaker
        ? `${beat.speaker}: ${beat.chinese} (${beat.pinyin}) — ${beat.english}`
        : `${beat.chinese} (${beat.pinyin}) — ${beat.english}`,
      beatId: beat.id,
    };
  });
}

const GENERATED_QUIZ: QuizQuestion[] = [
  ...generateIdiomQuestions(),
  ...generateBeijingQuestions(),
  ...generateVocabQuestions(),
  ...generateGrammarQuestions(),
  ...generateSentenceQuestions(),
];

/* AGENT-DONE(B1): sentence-comprehension generator from quizable dialogue (Chinese prompt, 4 English choices, similar-length distractors); bank is handwritten + curriculum + those lines (60+). pickQuiz still samples client-side with ≥2 handwritten. */
/** AGENT-DONE(3a): bank is the 5 handwritten questions plus generated items from curriculum/beats (idiom, Beijing, vocab, grammar cloze, sentence comprehension); pickQuiz(n) samples client-side and always includes ≥2 handwritten. */

export const EP05_QUIZ: QuizQuestion[] = [...HANDWRITTEN_QUIZ, ...GENERATED_QUIZ];

export function pickQuiz(n = 5): QuizQuestion[] {
  const handwritten = EP05_QUIZ.filter((q) => HANDWRITTEN_QUIZ_IDS.has(q.id));
  const generated = EP05_QUIZ.filter((q) => !HANDWRITTEN_QUIZ_IDS.has(q.id));
  const hwTake = Math.min(2, n, handwritten.length);
  const pickedHw = shuffle(handwritten).slice(0, hwTake);
  const pickedGen = shuffle(generated).slice(0, Math.max(0, n - pickedHw.length));
  const combined = [...pickedHw, ...pickedGen];
  if (combined.length < n) {
    const leftover = handwritten.filter((q) => !pickedHw.includes(q));
    combined.push(...leftover.slice(0, n - combined.length));
  }
  return shuffle(combined).slice(0, n);
}
