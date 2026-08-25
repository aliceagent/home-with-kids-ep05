"use client";

import type { Beat, DisplaySettings } from "@/types/lesson";
import { BookOpen, MapPin } from "lucide-react";
import { beatTypeLabel, speakerColorOnDark, speakerDotOnDark } from "@/lib/lesson-utils";
import { textbookRewrite } from "@/lib/register";
import { voiceForBeat } from "@/lib/voices";
import { cn } from "@/lib/utils";

interface SubtitleOverlayProps {
  beat: Beat;
  settings: DisplaySettings;
  visible: boolean;
}

const SPEAKER_ACCENT: Record<string, string> = {
  夏雪: "border-l-red-400",
  刘梅: "border-l-pink-400",
  夏东海: "border-l-blue-400",
  夏雨: "border-l-green-400",
};

export function SubtitleOverlay({ beat, settings, visible }: SubtitleOverlayProps) {
  const voice = voiceForBeat(beat);
  const accent = beat.speaker ? SPEAKER_ACCENT[beat.speaker] : "border-l-amber-400";
  const rewrite = settings.registerRewrite ? textbookRewrite(beat.chinese) : null;
  const hasText =
    (settings.chinese && beat.chinese) ||
    (settings.pinyin && beat.pinyin) ||
    (settings.english && beat.english);

  if (!visible || !hasText) return null;

  return (
    <div
      className={cn(
        // Sit on the bottom edge. Credit lives in the top-left, so this bar
        // can use the full width.
        "pointer-events-none absolute inset-x-0 bottom-0 z-20 px-2.5 pb-1.5 pt-2",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "rounded-md border-l-[3px] bg-black/72 px-2.5 py-1 shadow-md backdrop-blur-sm",
          accent,
        )}
      >
        <div className="mb-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {settings.speaker && beat.speaker && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border px-1.5 py-px text-[10px] font-semibold tracking-wide",
                speakerColorOnDark(beat.speaker),
              )}
            >
              <span
                className={cn("size-1.5 shrink-0 rounded-full", speakerDotOnDark(beat.speaker))}
              />
              <span lang="zh-CN">{beat.speaker}</span>
              <span className="font-normal text-white/75">{voice.nameEn}</span>
            </span>
          )}
          {!beat.speaker && beat.type !== "dialogue" && (
            <span className="rounded border border-white/20 bg-white/10 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-white/90">
              {beatTypeLabel(beat.type)}
            </span>
          )}
          {settings.timestamp && (
            <span className="font-mono text-[9px] text-white/50">{beat.timestamp}</span>
          )}
        </div>

        {settings.chinese && beat.chinese && (
          <p lang="zh-CN" className="font-serif text-base leading-tight text-white md:text-lg">
            {beat.chinese}
          </p>
        )}
        {settings.pinyin && beat.pinyin && (
          <p className="text-[13px] leading-tight text-teal-100 md:text-sm">{beat.pinyin}</p>
        )}
        {settings.english && beat.english && (
          <p className="text-xs leading-tight text-white/85 md:text-[13px]">{beat.english}</p>
        )}

        {rewrite && (
          <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-[11px] leading-tight">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-widest text-sky-300/80">
              <BookOpen className="size-2.5" />
              Textbook
            </span>
            <span lang="zh-CN" className="font-serif text-sky-50">{rewrite}</span>
          </p>
        )}

        {settings.beijing && beat.beijingTags?.length ? (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {beat.beijingTags.map((tag) => (
              <span
                key={tag.badge}
                className="inline-flex items-center gap-1 rounded border border-orange-400/45 bg-orange-500/15 px-1.5 py-px text-[10px] font-medium text-orange-100"
              >
                <MapPin className="size-2.5 shrink-0" />
                {tag.badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
