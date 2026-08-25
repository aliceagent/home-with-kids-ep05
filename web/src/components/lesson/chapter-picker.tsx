"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSceneImageCandidates } from "@/lib/lesson-utils";
import type { ResolvedChapter } from "@/lib/episode-chapters";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterPickerProps {
  open: boolean;
  chapters: ResolvedChapter[];
  currentIndex: number;
  onSelect: (startIndex: number) => void;
  onClose: () => void;
}

function ChapterThumb({
  source,
  alt,
}: {
  source: string | null;
  alt: string;
}) {
  const [candidate, setCandidate] = useState(0);
  const urls = getSceneImageCandidates(source);
  const url = urls[candidate];

  if (!url) {
    return <div className="aspect-[4/3] w-full bg-stone-800" />;
  }

  return (
    // Native img: local lesson stills, with candidate fallback on error.
    <img
      src={url}
      alt={alt}
      className="aspect-[4/3] w-full object-cover"
      onError={() => {
        setCandidate((i) => (i + 1 < urls.length ? i + 1 : i));
      }}
    />
  );
}

export function ChapterPicker({
  open,
  chapters,
  currentIndex,
  onSelect,
  onClose,
}: ChapterPickerProps) {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-[60] flex items-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chapter-picker-title"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close chapters"
        onClick={onClose}
      />

      <Card
        id="chapter-picker-panel"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 max-h-[82%] w-full gap-0 overflow-hidden rounded-t-2xl rounded-b-none bg-stone-900 py-0 text-white ring-white/15",
          "animate-in slide-in-from-bottom-6 fade-in duration-300",
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-5">
          <div>
            <CardTitle id="chapter-picker-title" className="text-white">
              Jump to a scene
            </CardTitle>
            <p className="mt-1 text-xs text-white/55">
              Nine beats from this cut of 猫鼠之争. Tap a still to play from there.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close chapters"
          >
            <X className="size-4" />
          </button>
        </CardHeader>

        <CardContent className="max-h-[min(34rem,78%)] overflow-y-auto px-4 py-3 md:px-5 md:py-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {chapters.map((chapter) => {
              const active =
                currentIndex >= chapter.startIndex &&
                currentIndex <= chapter.endIndex;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => onSelect(chapter.startIndex)}
                  className={cn(
                    "overflow-hidden rounded-xl text-left ring-1 transition",
                    active
                      ? "ring-amber-400 ring-offset-2 ring-offset-stone-900"
                      : "ring-white/10 hover:ring-white/30",
                  )}
                >
                  <div className="relative">
                    <ChapterThumb
                      source={chapter.thumbBeat.source}
                      alt={chapter.titleEn}
                    />
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white/90">
                      {chapter.timeLabel}
                    </span>
                    {active ? (
                      <span className="absolute right-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-stone-950">
                        Now
                      </span>
                    ) : null}
                  </div>
                  <div className="bg-black/40 px-2 py-1.5">
                    <p className="text-xs font-medium text-white">{chapter.titleZh}</p>
                    <p className="text-[11px] text-white/70">{chapter.titleEn}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-white/45">
                      {chapter.blurb}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
