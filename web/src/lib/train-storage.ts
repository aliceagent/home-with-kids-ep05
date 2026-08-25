/**
 * Training-mode storage: pinyin preference and (later) SRS.
 * localStorage is only touched after mount — see usePinyinPref.
 */
import { readStored, storageKey, writeStored } from "@/lib/player-storage";

export const PINYIN_PREF_KEY = storageKey("quiz-pinyin");
export const SRS_KEY = storageKey("srs");

export function readPinyinPref(): boolean {
  const stored = readStored<boolean>(PINYIN_PREF_KEY);
  return typeof stored === "boolean" ? stored : true;
}

export function writePinyinPref(on: boolean): void {
  writeStored(PINYIN_PREF_KEY, on);
}

export type SrsCard = { due: number; interval: number };
export type SrsMap = Record<string, SrsCard>;

export function readSrsMap(): SrsMap {
  const stored = readStored<SrsMap>(SRS_KEY);
  if (!stored || typeof stored !== "object") return {};
  return stored;
}

export function writeSrsMap(map: SrsMap): void {
  writeStored(SRS_KEY, map);
}
