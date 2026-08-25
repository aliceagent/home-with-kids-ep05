/**
 * Tiny localStorage wrapper for player preferences.
 *
 * Every call is guarded — Safari private mode throws on access and a
 * half-written value should never take the player down. Reads may only happen
 * after mount: the lesson page is statically prerendered, so touching storage
 * during render would desync hydration.
 */

/** Bump the `:vN` suffix whenever a stored shape stops being readable */
export const SETTINGS_KEY = "hwk-ep05:settings:v1";
export const POSITION_KEY = "hwk-ep05:position:v1";
export const SPEED_KEY = "hwk-ep05:speed:v1";
export const SEEN_KEY = "hwk-ep05:seen:v1";
export const QUIZ_HISTORY_KEY = "hwk-ep05:quiz:v1";

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
