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
export const LOOP_KEY = storageKey("loop");

/**
 * Line-loop study mode — how many times in a row the player says one line
 * before moving on. "x2" means the line is heard twice, "inf" repeats until
 * the learner navigates away.
 */
export type LoopMode = "off" | "x2" | "x3" | "inf";
export const LOOP_MODES: LoopMode[] = ["off", "x2", "x3", "inf"];

/** Caption shown next to the loop button — empty when looping is off */
export const LOOP_CAPTIONS: Record<LoopMode, string> = {
  off: "",
  x2: "×2",
  x3: "×3",
  inf: "∞",
};

/** Total plays of a line under each mode, so `inf` never terminates */
export function loopPlayCount(mode: LoopMode): number {
  if (mode === "x2") return 2;
  if (mode === "x3") return 3;
  if (mode === "inf") return Number.POSITIVE_INFINITY;
  return 1;
}

/** Subtitle/teaching-card text scale. "small" is the original sizing. */
export type TextSize = "small" | "medium" | "large";
export const TEXT_SIZES: TextSize[] = ["small", "medium", "large"];
export const SEEN_KEY = storageKey("seen");
export const QUIZ_HISTORY_KEY = storageKey("quiz");

export type QuizHistoryEntry = {
  ts: number;
  score: number;
  total: number;
  mode: string;
};

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

/* ------------------------------------------------------------------ *
 * Study activity — how much work actually happened, day by day
 * ------------------------------------------------------------------ */

/**
 * One day's study effort.
 *
 * `lines` counts every line the player finished playing, repeats and
 * already-seen lines included — this measures effort, not coverage, so it is
 * always >= the number of distinct lines in SEEN_KEY. `ms` is listened
 * wall-clock time for those lines, pauses included.
 */
export type DayActivity = { lines: number; ms: number };

/**
 * Stored under ACTIVITY_KEY as `Record<string, DayActivity>`, keyed by LOCAL
 * calendar date in "YYYY-MM-DD" form (so a late-night session lands on the
 * day the learner thinks it did). Days are pruned once they fall outside the
 * trailing 90-day window, so the blob stays small:
 *
 *   { "2026-08-24": { lines: 42, ms: 613000 }, "2026-08-25": { … } }
 *
 * Reads never throw: a missing, corrupt, or partially written blob comes back
 * as `{}` and malformed day entries are dropped.
 */
export const ACTIVITY_KEY = storageKey("activity");

/** How much history is worth keeping for a progress dashboard */
const ACTIVITY_RETENTION_DAYS = 90;

/** Local (not UTC) calendar date — "2026-08-25" */
export function activityDayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function readActivity(): Record<string, DayActivity> {
  try {
    const raw = readStored<Record<string, Partial<DayActivity>>>(ACTIVITY_KEY);
    if (!raw || typeof raw !== "object") return {};
    const out: Record<string, DayActivity> = {};
    for (const [day, entry] of Object.entries(raw)) {
      if (!entry || typeof entry !== "object") continue;
      const lines = typeof entry.lines === "number" ? entry.lines : 0;
      const ms = typeof entry.ms === "number" ? entry.ms : 0;
      if (lines <= 0 && ms <= 0) continue;
      out[day] = { lines, ms };
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Add a batch of finished lines and listened milliseconds to today's entry.
 * Callers should buffer and flush occasionally rather than call per line.
 */
export function recordActivity(lines: number, ms: number): void {
  if (!(lines > 0) && !(ms > 0)) return;
  try {
    const all = readActivity();
    const today = activityDayKey();
    const cutoff = activityDayKey(
      new Date(Date.now() - ACTIVITY_RETENTION_DAYS * 24 * 60 * 60 * 1000),
    );

    const next: Record<string, DayActivity> = {};
    for (const [day, entry] of Object.entries(all)) {
      // String compare is safe on zero-padded ISO dates
      if (day >= cutoff) next[day] = entry;
    }

    const current = next[today] ?? { lines: 0, ms: 0 };
    next[today] = {
      lines: current.lines + Math.max(0, Math.round(lines)),
      ms: current.ms + Math.max(0, Math.round(ms)),
    };
    writeStored(ACTIVITY_KEY, next);
  } catch {
    /* private mode or quota — activity is a nice-to-have */
  }
}

export function readQuizHistory(mode?: string): QuizHistoryEntry[] {
  try {
    const entries = readStored<Array<Partial<QuizHistoryEntry>>>(QUIZ_HISTORY_KEY);
    if (!Array.isArray(entries)) return [];
    const normalized = entries
      .filter(
        (e) =>
          e &&
          typeof e.ts === "number" &&
          typeof e.score === "number" &&
          typeof e.total === "number",
      )
      .map((e) => ({
        ts: e.ts as number,
        score: e.score as number,
        total: e.total as number,
        mode: typeof e.mode === "string" && e.mode.length > 0 ? e.mode : "quiz",
      }));
    return mode ? normalized.filter((e) => e.mode === mode) : normalized;
  } catch {
    return [];
  }
}

export function pushQuizResult(entry: {
  ts: number;
  score: number;
  total: number;
  mode?: string;
}): void {
  try {
    const history = readQuizHistory();
    history.push({
      ts: entry.ts,
      score: entry.score,
      total: entry.total,
      mode: entry.mode ?? "quiz",
    });
    writeStored(QUIZ_HISTORY_KEY, history.slice(-50));
  } catch {
    /* private mode or quota */
  }
}
