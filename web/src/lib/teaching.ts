import type { Beat, BeatType, DisplaySettings } from "@/types/lesson";

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

export function teachingToggleForType(
  type: BeatType,
): keyof DisplaySettings | null {
  switch (type) {
    case "idiom":
      return "idiom";
    case "grammar":
      return "grammar";
    case "vocab":
      return "vocab";
    case "note":
      return "notes";
    case "beijing":
      return "beijing";
    case "culture":
      return "culture";
    case "deck":
      return "decks";
    default:
      return null;
  }
}

export function shouldPlayTeachingBeat(
  beat: Beat,
  settings: DisplaySettings,
): boolean {
  const key = teachingToggleForType(beat.type);
  if (!key) return false;
  return settings[key];
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

/** Dialogue beat has inline teaching we should pause for after playback */
export function dialogueHasTeaching(beat: Beat): boolean {
  return Boolean(beat.grammar || beat.vocab || beat.idiom || beat.notes);
}
