"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Beat, DisplaySettings } from "@/types/lesson";
import type { PresetMode } from "@/components/lesson/lesson-viewer";
import { EP05_META } from "@/lib/episode-meta";
import { getSceneImageCandidates } from "@/lib/lesson-utils";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface EpisodeCoverSheetProps {
  beat: Beat;
  settings: DisplaySettings;
  active: boolean;
  playing?: boolean;
  /** Starts playback from the top — omitted keeps the old passive hint */
  onStart?: () => void;
  onPreset?: (preset: PresetMode) => void;
  activeMode?: PresetMode | "custom";
}

const MODE_CHIPS: { id: PresetMode; label: string }[] = [
  { id: "immersion", label: "Story only" },
  { id: "full", label: "Full teaching" },
  { id: "reading", label: "Reading" },
  { id: "minimal", label: "Chinese only" },
];

const NAV_CARDS = [
  { href: "/quiz", label: "Exit quiz", description: "Five questions on what you just watched" },
  { href: "/study", label: "Study guide", description: "Vocab, idioms, grammar & culture notes" },
  { href: "/audition", label: "Voice audition", description: "Hear each character's voice" },
];

export function EpisodeCoverSheet({
  beat,
  settings,
  active,
  playing = false,
  onStart,
  onPreset,
  activeMode,
}: EpisodeCoverSheetProps) {
  const [urlIndex, setUrlIndex] = useState(0);

  const meta = EP05_META;
  const bgCandidates = getSceneImageCandidates(meta.coverSource);
  const bgUrl = bgCandidates[urlIndex] ?? null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-40 overflow-hidden",
        "transition-opacity duration-700 ease-in-out",
        active ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      {/* Ghibli-stylized show frame */}
      {bgUrl && (
        <Image
          src={bgUrl}
          alt=""
          fill
          className={cn(
            "object-cover motion-safe:transition-transform motion-safe:duration-[4000ms] motion-safe:ease-out",
            playing ? "motion-safe:scale-110" : "motion-safe:scale-105",
          )}
          priority
          sizes="(max-width: 896px) 100vw, 896px"
          onError={() => {
            setUrlIndex((i) => (i + 1 < bgCandidates.length ? i + 1 : i));
          }}
        />
      )}

      {/* Readability overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/70 to-stone-950/45" />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-transparent to-stone-950/30" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 50% at 50% 30%, rgba(251, 191, 36, 0.25), transparent),
            radial-gradient(circle at 85% 75%, rgba(244, 114, 182, 0.1), transparent)
          `,
        }}
      />

      {/* Content must fit the 4:3 frame — no scrolling (video capture) */}
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-5 py-6 text-center md:px-10 md:py-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-400/90 md:mb-3 md:text-xs">
          Learn Chinese with {meta.seriesEn}
        </p>

        <p lang="zh-CN" className="mb-1 font-serif text-sm tracking-wide text-white/50 md:text-base">
          {meta.series}
        </p>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/30 px-3 py-1 backdrop-blur-sm md:mb-5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
            Episode {meta.episode}
          </span>
          <span className="h-1 w-1 rounded-full bg-amber-500/60" />
          <span className="text-[10px] text-amber-200/70">{meta.year}</span>
        </div>

        <h1
          lang="zh-CN"
          className={cn(
            "font-serif text-4xl font-bold leading-none tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl",
            playing && "animate-in fade-in zoom-in-95 duration-700",
          )}
        >
          {settings.chinese ? meta.title : beat.chinese}
        </h1>

        {settings.pinyin && (
          <p className="mt-2 text-base text-teal-300/90 drop-shadow md:mt-3 md:text-xl">{meta.titlePinyin}</p>
        )}

        {settings.english && (
          <p className="mt-1.5 text-sm font-medium text-amber-100/80 drop-shadow md:mt-2 md:text-lg">
            {meta.titleEn}
          </p>
        )}

        <div className="my-4 h-px w-16 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent md:my-6 md:w-24" />

        <p className="max-w-sm px-2 text-xs leading-snug text-white/55 drop-shadow md:text-sm md:leading-relaxed">
          {settings.chinese && <span lang="zh-CN">{meta.taglineZh}</span>}
          {settings.chinese && settings.english && " · "}
          {settings.english && meta.taglineEn}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 md:mt-8 md:gap-3">
          {meta.characters.map((c) => (
            <span
              key={c.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] text-white/75 backdrop-blur-sm"
            >
              <span className={cn("size-1.5 rounded-full", c.color)} />
              {settings.chinese ? <span lang="zh-CN">{c.name}</span> : c.nameEn}
            </span>
          ))}
        </div>

        {!playing && onStart && (
          <button
            type="button"
            onClick={onStart}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-950/40 transition hover:bg-amber-500 md:mt-7 md:px-6 md:py-2.5 md:text-base"
          >
            <Play className="size-4 fill-current md:size-5" />
            Start episode
          </button>
        )}

        {!playing && !onStart && (
          <p className="mt-6 text-xs text-white/40 motion-safe:animate-pulse md:mt-10">
            Press Play scene to begin
          </p>
        )}

        {playing && (
          <div className="mt-6 flex items-center gap-2 md:mt-8">
            <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
            <span className="text-[10px] uppercase tracking-widest text-amber-400/80">
              Starting episode
            </span>
          </div>
        )}

        {!playing && onPreset && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 md:mt-6">
            {MODE_CHIPS.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onPreset(mode.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-medium transition md:text-xs",
                  mode.id === activeMode
                    ? "border-amber-400/70 bg-amber-500/25 text-amber-50"
                    : "border-white/15 bg-black/25 text-white/60 hover:bg-white/10 hover:text-white",
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        )}

        {!playing && (
          <div className="mt-5 grid w-full max-w-md grid-cols-1 gap-1.5 sm:grid-cols-3 md:mt-7 md:gap-2">
            {NAV_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-lg border border-white/15 bg-black/25 px-2.5 py-2 text-left backdrop-blur-sm transition hover:border-amber-400/40 hover:bg-black/40"
              >
                <p className="text-[11px] font-semibold text-amber-200/90 group-hover:text-amber-100">
                  {card.label}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-white/45">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Decorative corners */}
      <div className="pointer-events-none absolute left-4 top-4 size-8 border-l-2 border-t-2 border-amber-500/25 md:left-6 md:top-6 md:size-10" />
      <div className="pointer-events-none absolute right-4 top-4 size-8 border-r-2 border-t-2 border-amber-500/25 md:right-6 md:top-6 md:size-10" />
      <div className="pointer-events-none absolute bottom-4 left-4 size-8 border-b-2 border-l-2 border-amber-500/25 md:bottom-6 md:left-6 md:size-10" />
      <div className="pointer-events-none absolute bottom-4 right-4 size-8 border-b-2 border-r-2 border-amber-500/25 md:bottom-6 md:right-6 md:size-10" />
    </div>
  );
}
