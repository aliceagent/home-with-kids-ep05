/**
 * Read-only local reader for progress-dashboard/transcript stats.
 *
 * Deliberately does NOT import from lib/player-storage.ts — that file (and
 * the shape of the shared keys it may grow, like activity) is being edited
 * by another agent in parallel. This reads the same well-known keys
 * directly off window.localStorage with its own tiny try/catch guards, so
 * it never desyncs from — or conflicts with — that file. All calls must
 * happen after mount (see each page's useEffect).
 */

function safeRead<T>(key: string): T | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

const EP = "ep05";

/** hwk-ep05:seen:v1 — dialogue beat ids the learner has watched */
export function readSeenIds(): Set<string> {
  const raw = safeRead<string[]>(`hwk-${EP}:seen:v1`);
  return new Set(Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : []);
}

export type QuizHistoryRow = { ts: number; score: number; total: number; mode: string };

/** hwk-ep05:quiz:v1 — every recorded quiz/drill attempt across all modes */
export function readQuizHistoryAll(): QuizHistoryRow[] {
  const raw = safeRead<Array<Partial<QuizHistoryRow>>>(`hwk-${EP}:quiz:v1`);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (e): e is Partial<QuizHistoryRow> & { ts: number; score: number; total: number } =>
        Boolean(e) &&
        typeof e.ts === "number" &&
        typeof e.score === "number" &&
        typeof e.total === "number",
    )
    .map((e) => ({
      ts: e.ts,
      score: e.score,
      total: e.total,
      mode: typeof e.mode === "string" && e.mode.length > 0 ? e.mode : "quiz",
    }));
}

export type SrsRow = { due: number; interval: number };
export type SrsMap = Record<string, SrsRow>;

/** hwk-ep05:srs:v1 — flashcard spaced-repetition state */
export function readSrsMapAll(): SrsMap {
  const raw = safeRead<SrsMap>(`hwk-${EP}:srs:v1`);
  return raw && typeof raw === "object" ? raw : {};
}

export type ActivityMap = Record<string, { lines: number; ms: number }>;

/** hwk-ep05:activity:v1 — per-day lines-read / listening-ms, added by another agent */
export function readActivityMap(): ActivityMap {
  const raw = safeRead<ActivityMap>(`hwk-${EP}:activity:v1`);
  if (!raw || typeof raw !== "object") return {};
  const out: ActivityMap = {};
  for (const [day, v] of Object.entries(raw)) {
    if (!v || typeof v !== "object") continue;
    const lines = typeof v.lines === "number" && Number.isFinite(v.lines) ? v.lines : 0;
    const ms = typeof v.ms === "number" && Number.isFinite(v.ms) ? v.ms : 0;
    out[day] = { lines, ms };
  }
  return out;
}
