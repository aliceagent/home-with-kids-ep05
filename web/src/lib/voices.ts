import type { Beat, DisplaySettings } from "@/types/lesson";
import { isTeachingBeat } from "@/lib/teaching";
import { DEFAULT_EPISODE_ID } from "@/lib/episode-meta";

export type CharacterId = "夏雪" | "刘梅" | "夏东海" | "夏雨" | "narrator";

export interface CharacterVoice {
  id: CharacterId;
  name: string;
  nameEn: string;
  age: "young" | "adult";
  gender: "female" | "male";
  voiceId: string;
  role: string;
  description: string;
  /* AGENT-DONE(R1): dropped audition field, AUDITION_CAST, /audition route, cover/header links, and public audition clips. */
  accentColor: string;
}

/** xAI built-in voices mapped to Home With Kids cast */
export const CHARACTER_VOICES: Record<CharacterId, CharacterVoice> = {
  夏雪: {
    id: "夏雪",
    name: "夏雪",
    nameEn: "Xia Xue",
    age: "young",
    gender: "female",
    voiceId: "eve",
    role: "Teenage daughter",
    description:
      "Bright, quick teenage girl — curious about music and boys, a little sarcastic with her stepmom. xAI voice: eve.",
    accentColor: "border-red-400/50 bg-red-500/10",
  },
  刘梅: {
    id: "刘梅",
    name: "刘梅",
    nameEn: "Liu Mei",
    age: "adult",
    gender: "female",
    voiceId: "ara",
    role: "Stepmother",
    description:
      "Warm adult woman — tries hard to connect with the kids, jokes about being an old fangirl. xAI voice: ara.",
    accentColor: "border-pink-400/50 bg-pink-500/10",
  },
  夏东海: {
    id: "夏东海",
    name: "夏东海",
    nameEn: "Xia Donghai",
    age: "adult",
    gender: "male",
    voiceId: "rex",
    role: "Father",
    description:
      "Steady adult man — dry humor, teases Liu Mei, tries to keep the household calm. xAI voice: rex.",
    accentColor: "border-blue-400/50 bg-blue-500/10",
  },
  夏雨: {
    id: "夏雨",
    name: "夏雨",
    nameEn: "Xia Yu",
    age: "young",
    gender: "male",
    voiceId: "leo",
    role: "Younger brother",
    description:
      "Boyish younger son — playful, soft-hearted about pets, often the comic relief. xAI voice: leo.",
    accentColor: "border-green-400/50 bg-green-500/10",
  },
  narrator: {
    id: "narrator",
    name: "旁白",
    nameEn: "Narrator",
    age: "adult",
    gender: "female",
    voiceId: "aurora",
    role: "Lesson guide",
    description:
      "Clear teaching voice — explains idioms, grammar, and episode notes in English. xAI voice: aurora.",
    accentColor: "border-amber-400/50 bg-amber-500/10",
  },
};

export type AudioLayer = "chinese" | "english" | "pinyin" | "narrator";

export function voiceForBeat(beat: Beat): CharacterVoice {
  if (beat.speaker && beat.speaker in CHARACTER_VOICES) {
    return CHARACTER_VOICES[beat.speaker as CharacterId];
  }
  return CHARACTER_VOICES.narrator;
}

export function audioPath(
  beatId: string,
  layer: AudioLayer,
  episodeId = DEFAULT_EPISODE_ID,
): string {
  return `/lessons/${episodeId}/audio/${beatId}-${layer}.mp3`;
}

/** Which clips the player will actually request for this beat. */
export function activeLayers(settings: DisplaySettings, beat: Beat): AudioLayer[] {
  if (isTeachingBeat(beat)) {
    const layers: AudioLayer[] = [];
    if (settings.audioNarrator) layers.push("narrator");
    return layers;
  }
  if (beat.type === "title") {
    const layers: AudioLayer[] = [];
    if (settings.audioNarrator && beat.narratorScript) layers.push("narrator");
    if (settings.audioEnglish) layers.push("english");
    if (settings.audioChinese) layers.push("chinese");
    return layers;
  }
  const layers: AudioLayer[] = [];
  if (settings.audioChinese) layers.push("chinese");
  if (settings.audioPinyin) layers.push("pinyin");
  if (settings.audioEnglish) layers.push("english");
  return layers;
}

export function isSpeakableBeat(beat: Beat): boolean {
  return (
    beat.type === "dialogue" ||
    beat.type === "vocab" ||
    beat.type === "idiom" ||
    beat.type === "grammar" ||
    beat.type === "note" ||
    beat.type === "title" ||
    beat.type === "outro"
  );
}
