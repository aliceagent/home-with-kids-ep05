import type { AudioLayer, Beat, PlayerSettings, Voice } from "./types";
import { isTeachingBeat } from "./teaching";

export const VOICES: Record<string, Voice> = {
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
    audition: "/lessons/ep05/auditions/xia-xue.mp3",
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
    audition: "/lessons/ep05/auditions/liu-mei.mp3",
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
    audition: "/lessons/ep05/auditions/xia-donghai.mp3",
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
    audition: "/lessons/ep05/auditions/xia-yu.mp3",
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
    audition: "/lessons/ep05/auditions/narrator.mp3",
    accentColor: "border-amber-400/50 bg-amber-500/10",
  },
};

export const AUDITION_CAST: Voice[] = [
  VOICES["夏雪"],
  VOICES["刘梅"],
  VOICES["夏东海"],
  VOICES["夏雨"],
  VOICES.narrator,
];

export function voiceForBeat(beat: Beat): Voice {
  return beat.speaker && beat.speaker in VOICES
    ? VOICES[beat.speaker]
    : VOICES.narrator;
}

export function audioPath(id: string, layer: AudioLayer): string {
  return `/lessons/ep05/audio/${id}-${layer}.mp3`;
}

export function activeLayers(
  settings: PlayerSettings,
  beat: Beat,
): AudioLayer[] {
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

export function sceneImageCandidates(source?: string | null): string[] {
  if (!source) return [];
  const stem = source.replace(/\.jpg$/i, "");
  return [
    `/lessons/ep05/ghibli-4x3/${stem}.jpg`,
    `/lessons/ep05/ghibli-4x3/${stem}.png`,
    `/lessons/ep05/frames/${source}`,
  ];
}
