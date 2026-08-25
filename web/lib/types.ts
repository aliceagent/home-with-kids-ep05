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

export type AudioLayer = "chinese" | "pinyin" | "english" | "narrator";

export type BeijingTag = {
  badge: string;
  standard: string;
};

export type DeckItem = {
  chinese: string;
  pinyin: string;
  english: string;
  breakdown?: string[];
  note?: string;
};

export type Beat = {
  id: string;
  type: BeatType;
  timestamp: string;
  durationSec?: number;
  chinese?: string;
  pinyin?: string;
  english?: string;
  speaker?: string | null;
  source?: string | null;
  narratorScript?: string;
  notes?: string;
  grammar?: string;
  vocab?: string;
  idiom?: string;
  ladder?: { family: string; step: number; of: number };
  example?: string;
  examplePinyin?: string;
  exampleEnglish?: string;
  drill?: string;
  drillAnswer?: string;
  cultureBody?: string;
  standard?: string;
  literal?: string;
  trap?: string;
  breakdown?: string[];
  beijingTags?: BeijingTag[];
  deckTitle?: string;
  deckTitleEn?: string;
  deckTheme?: string;
  deckItems?: DeckItem[];
};

export type PlayerSettings = {
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
};

export type SettingsKey = keyof PlayerSettings;
export type PresetId = "full" | "immersion" | "reading" | "minimal";

export type Voice = {
  id: string;
  name: string;
  nameEn: string;
  age: string;
  gender: string;
  voiceId: string;
  role: string;
  description: string;
  audition: string;
  accentColor: string;
};
