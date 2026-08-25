"use client";

import Image from "next/image";
import { useState } from "react";
import type { Beat, DisplaySettings } from "@/types/lesson";
import { EP05_META } from "@/lib/episode-meta";
import { getSceneImageCandidates } from "@/lib/lesson-utils";
import { cn } from "@/lib/utils";

interface EpisodeCoverSheetProps {
  beat: Beat;
  settings: DisplaySettings;
  active: boolean;
  playing?: boolean;
}

export function EpisodeCoverSheet({
  beat,
  settings,
  active,
  playing = false,
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
            "object-cover transition-transform duration-[4000ms] ease-out",
            playing ? "scale-110" : "scale-105",
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

        <p className="mb-1 font-serif text-sm tracking-wide text-white/50 md:text-base">
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
          {settings.chinese && meta.taglineZh}
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
              {settings.chinese ? c.name : c.nameEn}
            </span>
          ))}
        </div>

        {!playing && (
          <p className="mt-6 animate-pulse text-xs text-white/40 md:mt-10">
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
      </div>

      {/* Decorative corners */}
      <div className="pointer-events-none absolute left-4 top-4 size-8 border-l-2 border-t-2 border-amber-500/25 md:left-6 md:top-6 md:size-10" />
      <div className="pointer-events-none absolute right-4 top-4 size-8 border-r-2 border-t-2 border-amber-500/25 md:right-6 md:top-6 md:size-10" />
      <div className="pointer-events-none absolute bottom-4 left-4 size-8 border-b-2 border-l-2 border-amber-500/25 md:bottom-6 md:left-6 md:size-10" />
      <div className="pointer-events-none absolute bottom-4 right-4 size-8 border-b-2 border-r-2 border-amber-500/25 md:bottom-6 md:right-6 md:size-10" />
    </div>
  );
}
