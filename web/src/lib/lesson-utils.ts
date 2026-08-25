import type { Beat, BeatType } from "@/types/lesson";

const GHIBLI_BASE = "/lessons/ep05/ghibli-4x3";
const FRAMES_BASE = "/lessons/ep05/frames";

/** Ghibli stylized URLs to try in order (jpg from img2img, legacy png, raw frame) */
export function getSceneImageCandidates(source: string | null): string[] {
  if (!source) return [];
  const stem = source.replace(/\.jpg$/i, "");
  return [
    `${GHIBLI_BASE}/${stem}.jpg`,
    `${GHIBLI_BASE}/${stem}.png`,
    `${FRAMES_BASE}/${source}`,
  ];
}

export function getSceneImageUrl(source: string | null): string | null {
  const candidates = getSceneImageCandidates(source);
  return candidates[0] ?? null;
}

export function getSceneFrameFallbackUrl(source: string | null): string | null {
  if (!source) return null;
  return `${FRAMES_BASE}/${source}`;
}

export function beatTypeLabel(type: BeatType): string {
  const labels: Record<BeatType, string> = {
    title: "Intro",
    dialogue: "Dialogue",
    vocab: "Vocabulary",
    idiom: "Idiom",
    grammar: "Grammar",
    note: "Note",
    beijing: "Beijing speech",
    culture: "Culture",
    deck: "Review",
    outro: "Next lesson",
  };
  return labels[type];
}

export function beatTypeColor(type: BeatType): string {
  const colors: Record<BeatType, string> = {
    title: "bg-amber-500/15 text-amber-800 border-amber-300",
    dialogue: "bg-teal-500/15 text-teal-900 border-teal-300",
    vocab: "bg-violet-500/15 text-violet-900 border-violet-300",
    idiom: "bg-rose-500/15 text-rose-900 border-rose-300",
    grammar: "bg-sky-500/15 text-sky-900 border-sky-300",
    note: "bg-amber-500/15 text-amber-900 border-amber-300",
    beijing: "bg-orange-500/15 text-orange-900 border-orange-300",
    culture: "bg-emerald-500/15 text-emerald-900 border-emerald-300",
    deck: "bg-indigo-500/15 text-indigo-900 border-indigo-300",
    outro: "bg-orange-500/15 text-orange-900 border-orange-300",
  };
  return colors[type];
}

export function speakerColor(speaker: string | null): string {
  if (!speaker) return "bg-muted text-muted-foreground";
  const map: Record<string, string> = {
    夏雪: "bg-red-500/15 text-red-900 border-red-300",
    刘梅: "bg-pink-500/15 text-pink-900 border-pink-300",
    夏东海: "bg-blue-500/15 text-blue-900 border-blue-300",
    夏雨: "bg-green-500/15 text-green-900 border-green-300",
  };
  return map[speaker] ?? "bg-muted text-muted-foreground border-border";
}

/** Speaker badge styles for dark subtitle / scene overlays */
export function speakerColorOnDark(speaker: string | null): string {
  if (!speaker) return "bg-black/60 text-white border-white/30";
  const map: Record<string, string> = {
    夏雪: "bg-black/60 text-white border-red-400",
    刘梅: "bg-black/60 text-white border-pink-400",
    夏东海: "bg-black/60 text-white border-blue-400",
    夏雨: "bg-black/60 text-white border-green-400",
  };
  return map[speaker] ?? "bg-black/60 text-white border-white/30";
}

export function speakerDotOnDark(speaker: string | null): string {
  if (!speaker) return "bg-white/70";
  const map: Record<string, string> = {
    夏雪: "bg-red-400",
    刘梅: "bg-pink-400",
    夏东海: "bg-blue-400",
    夏雨: "bg-green-400",
  };
  return map[speaker] ?? "bg-white/70";
}

export function hasTeachingCard(beat: Beat): boolean {
  return Boolean(beat.grammar || beat.vocab || beat.idiom || beat.breakdown?.length);
}
