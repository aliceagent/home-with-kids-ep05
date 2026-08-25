/**
 * Tiny localStorage wrapper for player preferences.
 *
 * Every call is guarded — Safari private mode throws on access and a
 * half-written value should never take the player down. Reads may only happen
 * after mount: the lesson page is statically prerendered, so touching storage
 * during render would desync hydration.
 */

import { DEFAULT_EPISODE_ID } from "@/lib/episode-meta";

/** Bump the `:vN` suffix whenever a stored shape stops being readable */
export function storageKey(kind: string, episodeId = DEFAULT_EPISODE_ID): string {
  return `hwk-${episodeId}:${kind}:v1`;
}

export const SETTINGS_KEY = storageKey("settings");
export const POSITION_KEY = storageKey("position");
export const SPEED_KEY = storageKey("speed");
export const TEXT_SIZE_KEY = storageKey("text-size");

/** Subtitle/teaching-card text scale. "small" is the original sizing. */
export type TextSize = "small" | "medium" | "large";
export const TEXT_SIZES: TextSize[] = ["small", "medium", "large"];
export const SEEN_KEY = storageKey("seen");
export const QUIZ_HISTORY_KEY = storageKey("quiz");

export type QuizHistoryEntry = { ts: number; score: number; total: number };

export function readStored<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or quota — preferences are a nice-to-have */
  }
}

/** AGENT-DONE(1a): SEEN_KEY/QUIZ_HISTORY_KEY plus readSeen, markSeen (no-op rewrite), readQuizHistory, pushQuizResult (capped at 50). */

export function readSeen(): Set<string> {
  try {
    const ids = readStored<string[]>(SEEN_KEY);
    return Array.isArray(ids) ? new Set(ids.filter((id) => typeof id === "string")) : new Set();
  } catch {
    return new Set();
  }
}

export function markSeen(id: string): void {
  try {
    const seen = readSeen();
    if (seen.has(id)) return;
    seen.add(id);
    writeStored(SEEN_KEY, [...seen]);
  } catch {
    /* private mode or quota */
  }
}

export function readQuizHistory(): QuizHistoryEntry[] {
  try {
    const entries = readStored<QuizHistoryEntry[]>(QUIZ_HISTORY_KEY);
    if (!Array.isArray(entries)) return [];
    return entries.filter(
      (e) =>
        e &&
        typeof e.ts === "number" &&
        typeof e.score === "number" &&
        typeof e.total === "number",
    );
  } catch {
    return [];
  }
}

export function pushQuizResult(entry: QuizHistoryEntry): void {
  try {
    const history = readQuizHistory();
    history.push(entry);
    writeStored(QUIZ_HISTORY_KEY, history.slice(-50));
  } catch {
    /* private mode or quota */
  }
}
