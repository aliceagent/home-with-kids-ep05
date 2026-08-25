"use client";

import type { Beat, DisplaySettings } from "@/types/lesson";
import { teachingKindLabel } from "@/lib/teaching";
import { cn } from "@/lib/utils";
import { FitScale } from "@/components/lesson/fit-scale";
import {
  BookOpen,
  Landmark,
  Languages,
  Layers,
  Lightbulb,
  MapPin,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

interface TeachingPauseOverlayProps {
  beat: Beat;
  settings: DisplaySettings;
  active: boolean;
}

const TONE: Record<string, string> = {
  idiom: "border-rose-400/60 bg-rose-950/95",
  grammar: "border-sky-400/60 bg-sky-950/95",
  vocab: "border-violet-400/60 bg-violet-950/95",
  note: "border-amber-400/60 bg-amber-950/95",
  beijing: "border-orange-400/60 bg-orange-950/95",
  culture: "border-emerald-400/60 bg-emerald-950/95",
  deck: "border-indigo-400/60 bg-indigo-950/95",
};

const ICON: Record<string, React.ReactNode> = {
  idiom: <Sparkles className="size-3.5" />,
  grammar: <BookOpen className="size-3.5" />,
  vocab: <Languages className="size-3.5" />,
  note: <Lightbulb className="size-3.5" />,
  beijing: <MapPin className="size-3.5" />,
  culture: <Landmark className="size-3.5" />,
  deck: <Layers className="size-3.5" />,
};

function LadderPips({
  step,
  of,
  family,
}: {
  step: number;
  of: number;
  family: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white/85">
      <span className="font-serif text-[13px] leading-none">{family}</span>
      <span className="flex gap-0.5">
        {Array.from({ length: of }, (_, i) => (
          <span
            key={i}
            className={cn(
              "size-1.5 rounded-full",
              i < step ? "bg-sky-300" : "bg-white/25",
            )}
          />
        ))}
      </span>
      <span className="text-white/55">
        {step}/{of}
      </span>
    </span>
  );
}

function DeckCard({ beat }: { beat: Beat }) {
  const items = beat.deckItems ?? [];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <p className="font-serif text-lg leading-tight text-white">{beat.deckTitle}</p>
        <p className="text-xs text-indigo-200">{beat.deckTitleEn}</p>
      </div>
      {beat.deckTheme && (
        <p className="text-[11px] leading-snug text-white/45">{beat.deckTheme}</p>
      )}

      <ul className="divide-y divide-white/10 border-t border-white/15">
        {items.map((item) => (
          <li key={item.chinese} className="flex flex-wrap items-baseline gap-x-2 py-1">
            <span className="font-serif text-[15px] leading-tight text-white">
              {item.chinese}
            </span>
            <span className="text-[11px] text-teal-200">{item.pinyin}</span>
            <span className="text-[11px] text-white/70">{item.english}</span>
            {item.note && (
              <span className="basis-full text-[10px] leading-snug text-white/40">
                {item.note}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TeachingPauseOverlay({
  beat,
  settings,
  active,
}: TeachingPauseOverlayProps) {
  if (!active) return null;

  const tone = TONE[beat.type] ?? TONE.note;
  const icon = ICON[beat.type] ?? ICON.note;
  const isDeck = beat.type === "deck";
  const contentKey = [
    beat.id,
    settings.chinese,
    settings.pinyin,
    settings.english,
    settings.drills,
    settings.notes,
    settings.breakdown,
  ].join(":");

  return (
    <div
      className={cn(
        // Column flex + min-h-0 so padding is respected.
        // Never scroll — FitScale shrinks the card to the remaining box.
        "absolute inset-0 z-30 flex flex-col overflow-hidden bg-black/70 p-2.5 pt-7 backdrop-blur-sm md:p-4 md:pt-8",
        "transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <FitScale
        contentKey={contentKey}
        className="min-h-0 flex-1"
        contentClassName={cn("w-full", isDeck ? "max-w-xl" : "max-w-md")}
      >
        <div
          className={cn(
            "w-full overflow-hidden rounded-xl border-2 px-3.5 py-3 shadow-2xl md:px-4 md:py-3.5",
            tone,
          )}
        >
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/55">
              {icon}
              {teachingKindLabel(beat.type)}
            </p>
            {beat.ladder && (
              <LadderPips
                step={beat.ladder.step}
                of={beat.ladder.of}
                family={beat.ladder.family}
              />
            )}
          </div>

          {isDeck ? (
            <DeckCard beat={beat} />
          ) : (
            <div className="flex flex-col gap-0.5">
              {settings.chinese && beat.chinese && (
                <p className="font-serif text-xl leading-snug text-white md:text-[1.35rem]">
                  {beat.chinese}
                </p>
              )}
              {settings.pinyin && beat.pinyin && (
                <p className="text-sm leading-snug text-teal-200">{beat.pinyin}</p>
              )}
              {settings.english && beat.english && (
                <p className="text-[13px] leading-snug text-white/80">{beat.english}</p>
              )}
            </div>
          )}

          {beat.type === "beijing" && beat.standard && (
            <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5 border-t border-white/15 pt-2 text-[13px]">
              <span className="font-semibold text-orange-100">Standard:</span>
              <span className="font-serif text-base text-white/90">{beat.standard}</span>
            </p>
          )}

          {beat.literal && (
            <p className="mt-2 border-t border-white/15 pt-2 text-[12px] leading-snug text-white/70">
              <span className="font-semibold text-white/90">Literal: </span>
              {beat.literal}
            </p>
          )}

          {beat.trap && (
            <p className="mt-2 flex gap-1.5 rounded-md border border-amber-400/40 bg-amber-500/10 px-2 py-1.5 text-[12px] leading-snug text-amber-100">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
              <span>
                <span className="font-semibold">Watch out: </span>
                {beat.trap}
              </span>
            </p>
          )}

          {beat.example && (
            <div className="mt-2 border-t border-white/15 pt-2">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-white/40">
                From the episode
              </p>
              <p className="mt-0.5 font-serif text-base leading-snug text-white">
                {beat.example}
              </p>
              {settings.pinyin && beat.examplePinyin && (
                <p className="text-[12px] leading-snug text-teal-200">
                  {beat.examplePinyin}
                </p>
              )}
              {settings.english && beat.exampleEnglish && (
                <p className="text-[12px] leading-snug text-white/65">
                  {beat.exampleEnglish}
                </p>
              )}
            </div>
          )}

          {beat.drill && settings.drills && (
            <div className="mt-2 rounded-md border border-white/15 bg-black/30 px-2.5 py-1.5">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-sky-300/80">
                Your turn
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-white/85">{beat.drill}</p>
              {beat.drillAnswer && (
                <p className="mt-0.5 font-serif text-[15px] leading-snug text-sky-200">
                  {beat.drillAnswer}
                </p>
              )}
            </div>
          )}

          {beat.breakdown?.length && settings.breakdown ? (
            <ul className="mt-2 space-y-0.5 border-t border-white/15 pt-2 text-[12px] leading-snug text-violet-200">
              {beat.breakdown.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}

          {beat.cultureBody && (
            <p className="mt-2 border-t border-white/15 pt-2 text-[12px] leading-snug text-emerald-50/90">
              {beat.cultureBody}
            </p>
          )}

          {beat.notes && settings.notes && (
            <p className="mt-2 border-t border-white/15 pt-2 text-[12px] leading-snug text-amber-100/90">
              <span className="font-semibold text-amber-50">Note: </span>
              {beat.notes}
            </p>
          )}
        </div>
      </FitScale>
    </div>
  );
}
