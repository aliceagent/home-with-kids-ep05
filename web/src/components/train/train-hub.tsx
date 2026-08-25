"use client";

/* AGENT-DONE(T3): /train hub lists all modes with icons, one-line blurbs, and per-mode best/attempts (flashcards shows SRS due count). Cover cards are Training / Exit quiz / Study guide. */
/* AGENT-DONE(R5): grouped hub — core modes plus listen/read quizzes (translate, pinyin, listen-pinyin, english-audio, slow). */

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { readQuizHistory } from "@/lib/player-storage";
import { countFlashcardsDue } from "@/lib/flashcards";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  AudioLines,
  Ear,
  Gauge,
  Headphones,
  Languages,
  Layers,
  Music2,
  PenLine,
  Speech,
  Type,
  Users,
} from "lucide-react";

type Mode = {
  href: string;
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

type Section = {
  title: string;
  modes: readonly Mode[];
};

const CORE: Mode[] = [
  {
    href: "/quiz",
    id: "quiz",
    label: "Written quiz",
    description: "Five questions from the episode bank",
    icon: PenLine,
  },
  {
    href: "/train/listening",
    id: "listening",
    label: "Listening",
    description: "Hear a line in Chinese, pick the meaning",
    icon: Ear,
  },
  {
    href: "/train/match-audio",
    id: "match-audio",
    label: "Match the audio",
    description: "Read the line, pick the matching clip",
    icon: AudioLines,
  },
  {
    href: "/train/flashcards",
    id: "flashcards",
    label: "Flashcards",
    description: "Vocab and idioms with light spaced repetition",
    icon: Layers,
  },
  {
    href: "/train/who-said-it",
    id: "who-said-it",
    label: "Who said it?",
    description: "Hear a line and name the speaker",
    icon: Users,
  },
  {
    href: "/train/tones",
    id: "tones",
    label: "Tone drill",
    description: "Pick the pinyin tones you heard",
    icon: Music2,
  },
];

const LISTEN_READ: Mode[] = [
  {
    href: "/train/translate",
    id: "translate",
    label: "English → Chinese",
    description: "Read the English, pick the matching line",
    icon: Languages,
  },
  {
    href: "/train/pinyin",
    id: "pinyin",
    label: "Pinyin → Chinese",
    description: "Read the pinyin, pick the characters",
    icon: Type,
  },
  {
    href: "/train/listen-pinyin",
    id: "listen-pinyin",
    label: "Listen for pinyin",
    description: "Hear Chinese, pick the pinyin",
    icon: Headphones,
  },
  {
    href: "/train/english-audio",
    id: "english-audio",
    label: "English audio",
    description: "Hear the English clip, pick the Chinese",
    icon: Speech,
  },
  {
    href: "/train/slow",
    id: "slow",
    label: "Slow Chinese",
    description: "Hear the pinyin-pace clip, pick the meaning",
    icon: Gauge,
  },
];

const SECTIONS: Section[] = [
  { title: "Core", modes: CORE },
  { title: "Listen & read", modes: LISTEN_READ },
];

const ALL_MODES = SECTIONS.flatMap((s) => s.modes);

type ModeStats = {
  best: number;
  attempts: number;
  due: number | null;
};

export function TrainHub() {
  const [stats, setStats] = useState<Record<string, ModeStats> | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- history is client-only */
  useEffect(() => {
    const next: Record<string, ModeStats> = {};
    for (const mode of ALL_MODES) {
      if (mode.id === "flashcards") {
        next[mode.id] = {
          best: 0,
          attempts: 0,
          due: countFlashcardsDue(),
        };
        continue;
      }
      const history = readQuizHistory(mode.id);
      next[mode.id] = {
        best: history.length > 0 ? Math.max(...history.map((e) => e.score)) : 0,
        attempts: history.length,
        due: null,
      };
    }
    setStats(next);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to episode
        </Link>

        <header className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-400/90">
            Home With Kids · EP5 <span lang="zh-CN">猫鼠之争</span>
          </p>
          <h1 className="mt-2 font-serif text-4xl text-white md:text-5xl">
            Training
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
            Listen, match, drill tones, and review vocab — all from lines that
            actually occur in this episode.
          </p>
        </header>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                {section.title}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {section.modes.map((mode) => {
                  const Icon = mode.icon;
                  const s = stats?.[mode.id];
                  return (
                    <Link
                      key={mode.href}
                      href={mode.href}
                      className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-amber-400/40 hover:bg-white/[0.07]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 rounded-lg border border-amber-400/30 bg-amber-500/10 p-2 text-amber-200">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-amber-100 group-hover:text-amber-50">
                            {mode.label}
                          </p>
                          <p className="mt-0.5 text-xs leading-snug text-white/45">
                            {mode.description}
                          </p>
                          <p className={cn("mt-2 text-[11px] text-white/35", !s && "opacity-0")}>
                            {s?.due != null
                              ? `${s.due} due`
                              : s && s.attempts > 0
                                ? `Best ${s.best} · ${s.attempts} ${s.attempts === 1 ? "attempt" : "attempts"}`
                                : "No attempts yet"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
