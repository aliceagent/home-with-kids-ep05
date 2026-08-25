"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import beatsData from "@/data/ep05-beats.json";
import type { Beat } from "@/types/lesson";
import { resolveChapters, type ResolvedChapter } from "@/lib/episode-chapters";
import { beatTypeLabel, speakerColorOnDark, speakerDotOnDark } from "@/lib/lesson-utils";
import { isTeachingBeat, teachingKindLabel } from "@/lib/teaching";
import { audioPath, voiceForBeat } from "@/lib/voices";
import { cn } from "@/lib/utils";
import { useClipPlayer } from "@/components/train/quiz-kit";
import { PageCrossLinks } from "@/components/lesson/page-nav-links";
import { ArrowLeft, ArrowUpRight, Search, Volume2 } from "lucide-react";

const BEATS = beatsData as Beat[];
const PREFS_KEY = "hwk-ep05:transcript-prefs:v1";

type TranscriptPrefs = { pinyin: boolean; english: boolean };

function readPrefs(): TranscriptPrefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return { pinyin: true, english: true };
    const parsed = JSON.parse(raw) as Partial<TranscriptPrefs>;
    return {
      pinyin: typeof parsed.pinyin === "boolean" ? parsed.pinyin : true,
      english: typeof parsed.english === "boolean" ? parsed.english : true,
    };
  } catch {
    return { pinyin: true, english: true };
  }
}

function writePrefs(prefs: TranscriptPrefs): void {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* private mode or quota — a nice-to-have */
  }
}

function matchBeat(beat: Beat, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    beat.chinese.includes(query) ||
    (beat.pinyin ?? "").toLowerCase().includes(q) ||
    (beat.english ?? "").toLowerCase().includes(q)
  );
}

type Group = {
  id: string;
  titleEn: string;
  titleZh?: string;
  timeLabel?: string;
  beats: Beat[];
};

function buildGroups(beats: Beat[], chapters: ResolvedChapter[]): Group[] {
  const groups: Group[] = [];
  const firstStart = chapters[0]?.startIndex ?? 0;
  if (firstStart > 0) {
    groups.push({ id: "__intro", titleEn: "Intro", beats: beats.slice(0, firstStart) });
  }
  for (const ch of chapters) {
    groups.push({
      id: ch.id,
      titleEn: ch.titleEn,
      titleZh: ch.titleZh,
      timeLabel: ch.timeLabel,
      beats: beats.slice(ch.startIndex, ch.endIndex + 1),
    });
  }
  return groups;
}

function ToggleChip({
  on,
  label,
  onClick,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "min-h-11 rounded-full border px-3.5 py-2.5 text-xs font-medium transition",
        on
          ? "border-amber-400/60 bg-amber-500/20 text-amber-100"
          : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
      )}
    >
      {label} {on ? "on" : "off"}
    </button>
  );
}

function InsetCard({ beat }: { beat: Beat }) {
  const label = isTeachingBeat(beat) ? teachingKindLabel(beat.type) : beatTypeLabel(beat.type);
  return (
    <div className="my-2 ml-3 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 md:ml-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</p>
      {beat.chinese && (
        <p lang="zh-CN" className="mt-1 font-serif text-sm text-white/70">
          {beat.chinese}
        </p>
      )}
      {beat.english && <p className="mt-0.5 text-xs leading-relaxed text-white/45">{beat.english}</p>}
    </div>
  );
}

function DialogueLine({
  beat,
  pinyinOn,
  englishOn,
  onPlay,
}: {
  beat: Beat;
  pinyinOn: boolean;
  englishOn: boolean;
  onPlay: (beat: Beat) => void;
}) {
  const voice = voiceForBeat(beat);
  return (
    <div className="border-b border-white/[0.06] px-3 py-3 last:border-0 md:px-4">
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        {beat.speaker && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide",
              speakerColorOnDark(beat.speaker),
            )}
          >
            <span className={cn("size-1.5 shrink-0 rounded-full", speakerDotOnDark(beat.speaker))} />
            <span lang="zh-CN">{beat.speaker}</span>
            <span className="font-normal text-white/60">{voice.nameEn}</span>
          </span>
        )}
        <span className="font-mono text-[10px] text-white/35">{beat.timestamp}</span>
        <button
          type="button"
          onClick={() => onPlay(beat)}
          aria-label={`Play line ${beat.id}`}
          className="ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-500/20 hover:text-amber-100"
        >
          <Volume2 className="size-4" />
        </button>
      </div>

      <p lang="zh-CN" className="font-serif text-lg leading-relaxed text-white md:text-xl">
        {beat.chinese}
      </p>
      {pinyinOn && beat.pinyin && <p className="mt-0.5 text-sm text-teal-200/90">{beat.pinyin}</p>}
      {englishOn && beat.english && <p className="mt-0.5 text-sm text-white/65">{beat.english}</p>}

      <Link
        href={`/?beat=${beat.id}`}
        className="mt-1.5 inline-flex min-h-[28px] items-center gap-1 text-[11px] text-white/30 transition hover:text-amber-300"
      >
        Open in player
        <ArrowUpRight className="size-3" />
      </Link>
    </div>
  );
}

function ChapterSection({
  group,
  toolbarH,
  pinyinOn,
  englishOn,
  onPlay,
}: {
  group: Group;
  toolbarH: number;
  pinyinOn: boolean;
  englishOn: boolean;
  onPlay: (beat: Beat) => void;
}) {
  return (
    <section>
      <div
        className="sticky z-10 -mx-4 border-b border-white/10 bg-stone-950/95 px-4 py-2 backdrop-blur md:-mx-6 md:px-6"
        style={{ top: toolbarH }}
      >
        {group.timeLabel && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/80">
            {group.timeLabel}
          </p>
        )}
        <h2 className="font-serif text-lg text-white md:text-xl">
          {group.titleZh && <span lang="zh-CN">{group.titleZh}</span>}
          {group.titleZh && " · "}
          {group.titleEn}
        </h2>
      </div>
      {group.beats.map((beat) =>
        beat.type === "dialogue" ? (
          <DialogueLine key={beat.id} beat={beat} pinyinOn={pinyinOn} englishOn={englishOn} onPlay={onPlay} />
        ) : (
          <InsetCard key={beat.id} beat={beat} />
        ),
      )}
    </section>
  );
}

export function TranscriptReader() {
  const [pinyinOn, setPinyinOnState] = useState(true);
  const [englishOn, setEnglishOnState] = useState(true);
  const [query, setQuery] = useState("");
  const [toolbarH, setToolbarH] = useState(0);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const { play } = useClipPlayer();

  /* eslint-disable react-hooks/set-state-in-effect -- prefs are client-only, prerender defaults to both-on */
  useEffect(() => {
    const prefs = readPrefs();
    setPinyinOnState(prefs.pinyin);
    setEnglishOnState(prefs.english);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const update = () => setToolbarH(el.offsetHeight);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const togglePinyin = () => {
    const next = !pinyinOn;
    setPinyinOnState(next);
    writePrefs({ pinyin: next, english: englishOn });
  };
  const toggleEnglish = () => {
    const next = !englishOn;
    setEnglishOnState(next);
    writePrefs({ pinyin: pinyinOn, english: next });
  };

  const chapters = useMemo(() => resolveChapters(BEATS), []);
  const groups = useMemo(() => buildGroups(BEATS, chapters), [chapters]);

  const trimmedQuery = query.trim();
  const filteredGroups = useMemo(() => {
    if (!trimmedQuery) return groups;
    return groups
      .map((g) => ({ ...g, beats: g.beats.filter((b) => matchBeat(b, trimmedQuery)) }))
      .filter((g) => g.beats.length > 0);
  }, [groups, trimmedQuery]);

  const matchCount = useMemo(
    () => filteredGroups.reduce((n, g) => n + g.beats.length, 0),
    [filteredGroups],
  );

  const handlePlay = (beat: Beat) => play(audioPath(beat.id, "chinese"));

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

        <header className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-400/90">
              Home With Kids · EP5 <span lang="zh-CN">猫鼠之争</span>
            </p>
            <PageCrossLinks current="transcript" />
          </div>
          <h1 className="mt-2 font-serif text-4xl text-white md:text-5xl">Transcript</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
            Every line of the episode, grouped by chapter. Read along, replay a
            line&apos;s audio, or jump straight into the player.
          </p>
        </header>

        <div
          ref={toolbarRef}
          className="sticky top-0 z-20 -mx-4 mb-2 bg-stone-950/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6"
        >
          <div className="flex flex-wrap gap-2">
            <ToggleChip on={pinyinOn} label="Pinyin" onClick={togglePinyin} />
            <ToggleChip on={englishOn} label="English" onClick={toggleEnglish} />
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 中文, pinyin, or English…"
                className="w-full min-h-11 rounded-lg border border-white/15 bg-white/5 py-2 pl-8 pr-3 text-sm text-white placeholder:text-white/35 focus:border-amber-400/50 focus:outline-none"
              />
            </div>
            <span className="shrink-0 text-xs text-white/40">
              {trimmedQuery ? `${matchCount} match${matchCount === 1 ? "" : "es"}` : `${BEATS.length} lines`}
            </span>
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <p className="px-1 py-10 text-center text-sm text-white/40">
            No lines match &ldquo;{trimmedQuery}&rdquo;.
          </p>
        ) : (
          filteredGroups.map((group) => (
            <ChapterSection
              key={group.id}
              group={group}
              toolbarH={toolbarH}
              pinyinOn={pinyinOn}
              englishOn={englishOn}
              onPlay={handlePlay}
            />
          ))
        )}
      </div>
    </div>
  );
}
