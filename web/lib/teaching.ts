import type { Beat, BeatType, PlayerSettings } from "./types";

const TEACHING_TYPES: BeatType[] = [
  "idiom",
  "grammar",
  "vocab",
  "note",
  "beijing",
  "culture",
  "deck",
];

export function isTeachingBeat(beat: Beat): boolean {
  return TEACHING_TYPES.includes(beat.type);
}

export function shouldPlayTeachingBeat(
  beat: Beat,
  settings: PlayerSettings,
): boolean {
  const key = (() => {
    switch (beat.type) {
      case "idiom":
        return "idiom" as const;
      case "grammar":
        return "grammar" as const;
      case "vocab":
        return "vocab" as const;
      case "note":
        return "notes" as const;
      case "beijing":
        return "beijing" as const;
      case "culture":
        return "culture" as const;
      case "deck":
        return "decks" as const;
      default:
        return null;
    }
  })();
  return !!key && settings[key];
}

export function teachingKindLabel(type: BeatType): string {
  switch (type) {
    case "idiom":
      return "成语 Idiom";
    case "grammar":
      return "Grammar";
    case "vocab":
      return "Vocabulary";
    case "note":
      return "Note";
    case "beijing":
      return "北京话 Beijing speech";
    case "culture":
      return "Culture note";
    case "deck":
      return "Vocabulary review";
    default:
      return "Teaching";
  }
}

export function textbookRewrite(chinese?: string | null): string | null {
  if (!chinese?.trim()) return null;
  let next = chinese
    .replaceAll("咱俩", "我们俩")
    .replaceAll("咱", "我们")
    .replaceAll("耗子", "老鼠")
    .replaceAll("一家伙", "一下子");
  next = next
    .replace(/([呀呢啊])([。？！]?)$/u, "$2")
    .replace(/\s{2,}/g, " ")
    .trim();
  return next && next !== chinese ? next : null;
}
