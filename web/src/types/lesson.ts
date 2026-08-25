export type BeatType =
  | "title"
  | "dialogue"
  | "vocab"
  | "idiom"
  | "grammar"
  | "note"
  | "beijing"
  | "culture"
  | "deck"
  | "outro";

export interface BeijingTag {
  /** Inline badge text shown under the subtitle */
  badge: string;
  /** Standard-Mandarin equivalent */
  standard: string;
}

export interface DeckEntry {
  chinese: string;
  pinyin: string;
  english: string;
  breakdown?: string[];
  note?: string;
}

export interface Beat {
  id: string;
  type: BeatType;
  timestamp: string;
  durationSec: number;
  chinese: string;
  pinyin: string;
  english: string;
  speaker: string | null;
  source: string | null;
  notes?: string;
  grammar?: string;
  vocab?: string;
  idiom?: string;
  literal?: string;
  breakdown?: string[];
  /** English narrator script for teaching pauses */
  narratorScript?: string;

  /* --- Beijing speech notes --- */
  /** Every colloquial feature present in this line — a line can carry several */
  beijingTags?: BeijingTag[];
  /** Standard-Mandarin equivalent, on the 北京话 teaching card */
  standard?: string;

  /* --- Grammar --- */
  /** Worked example for a grammar pause */
  example?: string;
  examplePinyin?: string;
  exampleEnglish?: string;
  /** Practice prompt and answer */
  drill?: string;
  drillAnswer?: string;
  /** Position within a multi-step pattern family, e.g. 比 step 2 of 3 */
  ladder?: { family: string; step: number; of: number };

  /* --- Idiom traps --- */
  /** Why the literal reading misleads */
  trap?: string;

  /* --- Vocabulary decks --- */
  deckTitle?: string;
  deckTitleEn?: string;
  deckTheme?: string;
  deckItems?: DeckEntry[];

  /* --- Culture cards --- */
  cultureBody?: string;
}

export interface DisplaySettings {
  chinese: boolean;
  pinyin: boolean;
  english: boolean;
  grammar: boolean;
  vocab: boolean;
  idiom: boolean;
  notes: boolean;
  beijing: boolean;
  culture: boolean;
  decks: boolean;
  drills: boolean;
  registerRewrite: boolean;
  speaker: boolean;
  timestamp: boolean;
  sceneImage: boolean;
  breakdown: boolean;
  audioChinese: boolean;
  audioEnglish: boolean;
  audioPinyin: boolean;
  audioNarrator: boolean;
  /** Pause after every spoken dialogue line so the learner can repeat it */
  shadowing: boolean;
}

export const DEFAULT_DISPLAY: DisplaySettings = {
  chinese: true,
  pinyin: true,
  english: true,
  grammar: true,
  vocab: true,
  idiom: true,
  notes: true,
  beijing: true,
  culture: true,
  decks: true,
  drills: true,
  registerRewrite: true,
  speaker: true,
  timestamp: true,
  sceneImage: true,
  breakdown: true,
  audioChinese: true,
  audioEnglish: false,
  audioPinyin: false,
  audioNarrator: true,
  shadowing: false,
};

export const DISPLAY_LABELS: Record<keyof DisplaySettings, string> = {
  chinese: "中文 Chinese text",
  pinyin: "拼音 Pinyin text",
  english: "English text",
  grammar: "Pause for grammar cards",
  vocab: "Pause for vocabulary cards",
  idiom: "Pause for idiom cards 成语",
  notes: "Pause for teaching notes",
  beijing: "Pause for 北京话 Beijing speech",
  culture: "Pause for culture notes",
  decks: "Pause for vocabulary review decks",
  drills: "Show practice drills on cards",
  registerRewrite: "Textbook rewrite of colloquial lines",
  speaker: "Speaker names",
  timestamp: "Timestamps",
  sceneImage: "Scene illustration",
  breakdown: "Character breakdown",
  audioChinese: "🔊 Chinese audio",
  audioEnglish: "🔊 English audio",
  audioPinyin: "🔊 Slow Chinese (pinyin pace)",
  audioNarrator: "🔊 Narrator explains cards",
  shadowing: "Shadowing — pause after each line",
};
