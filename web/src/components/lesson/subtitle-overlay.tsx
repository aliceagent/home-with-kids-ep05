"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { Beat, DisplaySettings } from "@/types/lesson";
import { BookOpen, MapPin } from "lucide-react";
import {
  beatTypeLabel,
  glossSegments,
  speakerColorOnDark,
  speakerDotOnDark,
  type GlossEntry,
} from "@/lib/lesson-utils";
import type { TextSize } from "@/lib/player-storage";
import { textbookRewrite } from "@/lib/register";
import { voiceForBeat } from "@/lib/voices";
import { cn } from "@/lib/utils";

interface SubtitleOverlayProps {
  beat: Beat;
  settings: DisplaySettings;
  visible: boolean;
  textSize?: TextSize;
}

/** "small" is the original sizing; medium/large scale the three text lines */
const SIZE = {
  small: {
    chinese: "text-base md:text-lg",
    pinyin: "text-[13px] md:text-sm",
    english: "text-xs md:text-[13px]",
    rewrite: "text-[11px]",
  },
  medium: {
    chinese: "text-xl md:text-2xl",
    pinyin: "text-sm md:text-base",
    english: "text-[13px] md:text-[15px]",
    rewrite: "text-xs",
  },
  large: {
    chinese: "text-2xl md:text-3xl",
    pinyin: "text-base md:text-lg",
    english: "text-[15px] md:text-lg",
    rewrite: "text-sm",
  },
} satisfies Record<TextSize, Record<string, string>>;

/** Widest the hint card gets — it shrinks to fit a narrow stage */
const HINT_WIDTH = 224;
/** Breathing room kept between the hint card and the edge of the stage */
const HINT_MARGIN = 6;

/** The open hint card: which word, what it says, and where it points */
interface ActiveHint {
  beatId: string;
  key: number;
  gloss: GlossEntry;
  left: number;
  width: number;
}

const SPEAKER_ACCENT: Record<string, string> = {
  夏雪: "border-l-red-400",
  刘梅: "border-l-pink-400",
  夏东海: "border-l-blue-400",
  夏雨: "border-l-green-400",
};

export function SubtitleOverlay({
  beat,
  settings,
  visible,
  textSize = "small",
}: SubtitleOverlayProps) {
  const size = SIZE[textSize];
  const voice = voiceForBeat(beat);
  const accent = beat.speaker ? SPEAKER_ACCENT[beat.speaker] : "border-l-amber-400";
  const rewrite = settings.registerRewrite ? textbookRewrite(beat.chinese) : null;
  const hasText =
    (settings.chinese && beat.chinese) ||
    (settings.pinyin && beat.pinyin) ||
    (settings.english && beat.english);

  const wordHints = settings.wordHints && settings.chinese && Boolean(beat.chinese);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [hint, setHint] = useState<ActiveHint | null>(null);
  /** Segmentation is cached per beat, so this is a map lookup after the first line */
  const segments = useMemo(
    () => (wordHints ? glossSegments(beat) : []),
    [wordHints, beat],
  );

  // A hint belongs to the line it was opened on — never carry it to the next
  const activeHint = hint && hint.beatId === beat.id && visible ? hint : null;

  // Anything tapped outside the subtitle bar puts the card away
  useEffect(() => {
    if (!activeHint) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (target && barRef.current?.contains(target)) return;
      setHint(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [activeHint]);

  /**
   * Open (or close) the card for one word. The card is centred on the word but
   * clamped to the bar, so it can never hang off the 4:3 stage.
   */
  const handleWordTap = (
    e: ReactMouseEvent<HTMLButtonElement>,
    key: number,
    gloss: GlossEntry,
  ) => {
    if (activeHint?.key === key) {
      setHint(null);
      return;
    }
    const bar = barRef.current;
    if (!bar) return;
    const barBox = bar.getBoundingClientRect();
    const wordBox = e.currentTarget.getBoundingClientRect();
    const width = Math.max(Math.min(HINT_WIDTH, barBox.width - HINT_MARGIN * 2), 0);
    const centre = wordBox.left + wordBox.width / 2 - barBox.left;
    const half = width / 2;
    const left = Math.min(
      Math.max(centre, half + HINT_MARGIN),
      Math.max(barBox.width - half - HINT_MARGIN, half + HINT_MARGIN),
    );
    setHint({ beatId: beat.id, key, gloss, left, width });
  };

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
        ref={barRef}
        className={cn(
          "relative rounded-md border-l-[3px] bg-black/72 px-2.5 py-1 shadow-md backdrop-blur-sm",
          accent,
          // The wrapper is click-through; only the bar takes taps, and only
          // when there is something on it worth tapping
          wordHints && "pointer-events-auto",
        )}
      >
        {activeHint && (
          <div
            role="dialog"
            aria-label={`Meaning of ${activeHint.gloss.chinese}`}
            style={{ left: activeHint.left, width: activeHint.width }}
            className={cn(
              "absolute bottom-full z-30 mb-1.5 -translate-x-1/2 rounded-lg border border-amber-400/40",
              "bg-stone-900/95 px-3 py-2 text-left shadow-xl backdrop-blur-sm",
              "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-150",
            )}
          >
            <p lang="zh-CN" className="font-serif text-base leading-tight text-white">
              {activeHint.gloss.chinese}
            </p>
            {activeHint.gloss.pinyin && (
              <p className="text-xs leading-tight text-teal-200">{activeHint.gloss.pinyin}</p>
            )}
            <p className="mt-0.5 text-xs leading-snug text-white/85">
              {activeHint.gloss.english}
            </p>
            <a
              href="/study"
              className="mt-1 inline-block text-[11px] font-medium text-amber-300 underline-offset-2 hover:underline"
            >
              Study guide →
            </a>
          </div>
        )}

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
          <p lang="zh-CN" className={cn("font-serif leading-tight text-white", size.chinese)}>
            {wordHints
              ? segments.map(({ text, gloss }, i) =>
                  gloss ? (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => handleWordTap(e, i, gloss)}
                      aria-expanded={activeHint?.key === i}
                      aria-label={`${text} — show meaning`}
                      className={cn(
                        "inline cursor-pointer underline decoration-dotted underline-offset-4 transition-colors",
                        activeHint?.key === i
                          ? "text-amber-200 decoration-amber-300"
                          : "decoration-white/40 hover:text-amber-100 hover:decoration-amber-300/70",
                      )}
                    >
                      {text}
                    </button>
                  ) : (
                    <span key={i}>{text}</span>
                  ),
                )
              : beat.chinese}
          </p>
        )}
        {settings.pinyin && beat.pinyin && (
          <p className={cn("leading-tight text-teal-100", size.pinyin)}>{beat.pinyin}</p>
        )}
        {settings.english && beat.english && (
          <p className={cn("leading-tight text-white/85", size.english)}>{beat.english}</p>
        )}

        {rewrite && (
          <p className={cn("mt-0.5 flex flex-wrap items-baseline gap-x-1.5 leading-tight", size.rewrite)}>
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
