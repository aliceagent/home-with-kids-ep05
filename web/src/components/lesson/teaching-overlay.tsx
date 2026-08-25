"use client";

import type { Beat, DisplaySettings } from "@/types/lesson";
import { hasTeachingCard } from "@/lib/lesson-utils";
import { BookOpen, Languages, Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeachingOverlayProps {
  beat: Beat;
  settings: DisplaySettings;
  visible: boolean;
}

export function TeachingOverlay({ beat, settings, visible }: TeachingOverlayProps) {
  if (!visible || !hasTeachingCard(beat)) return null;

  const items: { icon: React.ReactNode; label: string; text: string; tone: string }[] = [];

  if (settings.grammar && beat.grammar) {
    items.push({
      icon: <BookOpen className="size-3.5" />,
      label: "Grammar",
      text: beat.grammar,
      tone: "border-sky-400/40 bg-sky-950/80 text-sky-100",
    });
  }
  if (settings.vocab && beat.vocab) {
    items.push({
      icon: <Languages className="size-3.5" />,
      label: "Vocab",
      text: beat.vocab,
      tone: "border-violet-400/40 bg-violet-950/80 text-violet-100",
    });
  }
  if (settings.idiom && beat.idiom) {
    items.push({
      icon: <Sparkles className="size-3.5" />,
      label: "Idiom",
      text: beat.idiom,
      tone: "border-rose-400/40 bg-rose-950/80 text-rose-100",
    });
  }
  if (settings.idiom && beat.literal) {
    items.push({
      icon: <Sparkles className="size-3.5" />,
      label: "Literal",
      text: beat.literal,
      tone: "border-rose-400/40 bg-rose-950/80 text-rose-100",
    });
  }
  if (settings.breakdown && beat.breakdown?.length) {
    items.push({
      icon: <Languages className="size-3.5" />,
      label: "Breakdown",
      text: beat.breakdown.join(" · "),
      tone: "border-violet-400/40 bg-violet-950/80 text-violet-100",
    });
  }
  if (settings.notes && beat.notes) {
    items.push({
      icon: <Lightbulb className="size-3.5" />,
      label: "Note",
      text: beat.notes,
      tone: "border-amber-400/40 bg-amber-950/80 text-amber-100",
    });
  }

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute right-3 top-3 z-20 flex max-w-[220px] flex-col gap-2 md:right-4 md:max-w-[260px]",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn("rounded-lg border px-3 py-2 text-xs backdrop-blur-sm", item.tone)}
        >
          <p className="mb-1 flex items-center gap-1.5 font-semibold">
            {item.icon}
            {item.label}
          </p>
          <p className="leading-relaxed opacity-90">{item.text}</p>
        </div>
      ))}
    </div>
  );
}
