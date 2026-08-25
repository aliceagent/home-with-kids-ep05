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

/*
 * AGENT-TASK(1a) [progress tracking — storage helpers]
 * Full brief + workflow rules: /CURSOR-TASKS.md (read it first).
 *
 * Add below, following the readStored/writeStored try/catch pattern above:
 *   export const SEEN_KEY = "hwk-ep05:seen:v1";
 *     Stored value: string[] of beat ids the learner has actually watched.
 *   export const QUIZ_HISTORY_KEY = "hwk-ep05:quiz:v1";
 *     Stored value: { ts: number; score: number; total: number }[] —
 *     append-only, cap at the 50 most recent entries.
 *   export function readSeen(): Set<string>
 *   export function markSeen(id: string): void
 *     No-op (no write) when the id is already present, so callers can invoke
 *     it freely from the playback loop without hammering localStorage.
 *   export function readQuizHistory(): { ts; score; total }[]
 *   export function pushQuizResult(entry): void
 * Keep everything SSR-safe (these run only in the browser, but guard anyway
 * like the helpers above do via try/catch).
 * When done, replace this block with: AGENT-DONE(1a): <summary>.
 */
