"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import beatsData from "@/data/ep05-beats.json";
import type { Beat } from "@/types/lesson";
import { cn } from "@/lib/utils";
import {
  readActivityMap,
  readQuizHistoryAll,
  readSeenIds,
  readSrsMapAll,
  type ActivityMap,
  type QuizHistoryRow,
  type SrsMap,
} from "@/lib/progress-read";
import { PageCrossLinks } from "@/components/lesson/page-nav-links";
import { ArrowLeft, Flame, Headphones, Layers, ListChecks } from "lucide-react";

const BEATS = beatsData as Beat[];
const DIALOGUE_TOTAL = BEATS.filter((b) => b.type === "dialogue").length;

const HISTORY_MODES: { id: string; label: string }[] = [
  { id: "quiz", label: "Written quiz" },
  { id: "listening", label: "Listening" },
  { id: "match-audio", label: "Match audio" },
  { id: "who-said-it", label: "Who said it?" },
  { id: "tones", label: "Tone drill" },
];

type Snapshot = {
  seenCount: number;
  history: QuizHistoryRow[];
  srs: SrsMap;
  activity: ActivityMap;
  now: number;
};

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayIndexFromKey(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return NaN;
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Last 35 local-calendar days, oldest first, ending today. */
function last35DayKeys(): string[] {
  const today = new Date();
  const keys: string[] = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    keys.push(localDateKey(d));
  }
  return keys;
}

function intensityLevel(lines: number): 0 | 1 | 2 | 3 {
  if (lines >= 30) return 3;
  if (lines >= 10) return 2;
  if (lines >= 1) return 1;
  return 0;
}

const INTENSITY_CLASS: Record<0 | 1 | 2 | 3, string> = {
  0: "bg-white/[0.06]",
  1: "bg-amber-900/50",
  2: "bg-amber-600/70",
  3: "bg-amber-400",
};

function computeStreaks(activity: ActivityMap): { current: number; best: number } {
  const activeIndices = Array.from(
    new Set(
      Object.entries(activity)
        .filter(([, v]) => v && v.lines > 0)
        .map(([k]) => dayIndexFromKey(k))
        .filter((n) => Number.isFinite(n)),
    ),
  ).sort((a, b) => a - b);

  if (activeIndices.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < activeIndices.length; i++) {
    run = activeIndices[i] === activeIndices[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const activeSet = new Set(activeIndices);
  const todayIdx = dayIndexFromKey(localDateKey(new Date()));
  let current = 0;
  let cursor = todayIdx;
  while (activeSet.has(cursor)) {
    current += 1;
    cursor -= 1;
  }

  return { current, best };
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60_000);
  if (totalMinutes <= 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function StatTile({
  icon,
  label,
  value,
  sub,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
      <div className="flex items-center gap-2 text-white/50">
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-widest">{label}</p>
      </div>
      <p className="mt-2 font-serif text-3xl text-white md:text-4xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/45">{sub}</p>}
      {children}
    </div>
  );
}

export function ProgressDashboard() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- every source is client-only local storage */
  useEffect(() => {
    setSnapshot({
      seenCount: readSeenIds().size,
      history: readQuizHistoryAll(),
      srs: readSrsMapAll(),
      activity: readActivityMap(),
      now: Date.now(),
    });
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const dayKeys = useMemo(() => last35DayKeys(), []);

  const seenCount = snapshot?.seenCount ?? 0;
  const seenPct = DIALOGUE_TOTAL > 0 ? Math.min(100, Math.round((seenCount / DIALOGUE_TOTAL) * 100)) : 0;

  const srsEntries = snapshot ? Object.values(snapshot.srs) : [];
  const dueCount = snapshot ? srsEntries.filter((c) => c.due <= snapshot.now).length : 0;
  const trackedCount = srsEntries.length;

  const totalListeningMs = snapshot
    ? Object.values(snapshot.activity).reduce((n, v) => n + (v?.ms ?? 0), 0)
    : 0;

  const { current: currentStreak, best: bestStreak } = useMemo(
    () => computeStreaks(snapshot?.activity ?? {}),
    [snapshot],
  );

  const hasAnyData =
    snapshot != null &&
    (snapshot.seenCount > 0 ||
      snapshot.history.length > 0 ||
      Object.keys(snapshot.srs).length > 0 ||
      Object.values(snapshot.activity).some((v) => v.lines > 0 || v.ms > 0));

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <div className="mx-auto max-w-3xl overflow-x-hidden px-4 py-8 md:px-6 md:py-12">
        <Link
          href="/"
          className="mb-8 inline-flex min-h-[28px] items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to episode
        </Link>

        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-400/90">
              Home With Kids · EP5 <span lang="zh-CN">猫鼠之争</span>
            </p>
            <PageCrossLinks current="progress" />
          </div>
          <h1 className="mt-2 font-serif text-4xl text-white md:text-5xl">Progress</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
            How you&apos;re doing with this episode — lines studied, quiz scores,
            flashcards due, and how consistently you&apos;ve been showing up.
          </p>
        </header>

        {snapshot && !hasAnyData && (
          <p className="mb-6 rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-100/80">
            Fresh start — this page fills in as you watch lines, take quizzes,
            and drill flashcards. Nothing tracked yet on this browser.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            icon={<ListChecks className="size-4" />}
            label="Lines studied"
            value={`${seenCount} / ${DIALOGUE_TOTAL}`}
            sub={seenCount === 0 ? "Press play on the episode to get started" : `${seenPct}% of the episode`}
          >
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-amber-400 transition-[width]"
                style={{ width: `${seenPct}%` }}
              />
            </div>
          </StatTile>

          <StatTile
            icon={<Layers className="size-4" />}
            label="Flashcards due"
            value={String(dueCount)}
            sub={trackedCount > 0 ? `${trackedCount} tracked total` : "No cards tracked yet"}
          />

          <StatTile
            icon={<Headphones className="size-4" />}
            label="Listening time"
            value={formatDuration(totalListeningMs)}
            sub={totalListeningMs === 0 ? "Time adds up as you listen" : "Total across all sessions"}
          />
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/50">
            Quiz &amp; drill attempts
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {HISTORY_MODES.map((mode) => {
              const rows = snapshot?.history.filter((h) => h.mode === mode.id) ?? [];
              const attempts = rows.length;
              const best = attempts > 0 ? Math.max(...rows.map((r) => r.score)) : 0;
              const total = attempts > 0 ? rows[rows.length - 1].total : 0;
              return (
                <div key={mode.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                  <p className="text-[11px] font-medium text-white/60">{mode.label}</p>
                  <p className="mt-1 font-serif text-lg text-white">
                    {attempts > 0 ? `${best}/${total}` : "—"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/35">
                    {attempts > 0 ? `${attempts} ${attempts === 1 ? "attempt" : "attempts"}` : "No attempts yet"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
          <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/50">
            <Flame className="size-3.5" />
            Activity — last 5 weeks
          </p>

          <div className="grid grid-cols-7 gap-1 overflow-x-auto sm:gap-1.5">
            {dayKeys.map((key) => {
              const lines = snapshot?.activity[key]?.lines ?? 0;
              const level = intensityLevel(lines);
              const isMonthStart = key.endsWith("-01");
              return (
                <div
                  key={key}
                  title={`${key} — ${lines} line${lines === 1 ? "" : "s"}`}
                  className={cn(
                    "aspect-square min-w-3 rounded-sm",
                    INTENSITY_CLASS[level],
                    isMonthStart && "border-l border-white/20",
                  )}
                />
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
            <p>
              Current streak <span className="font-semibold text-amber-300">{currentStreak}</span>{" "}
              {currentStreak === 1 ? "day" : "days"}
            </p>
            <p>
              Best streak <span className="font-semibold text-amber-300">{bestStreak}</span>{" "}
              {bestStreak === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
