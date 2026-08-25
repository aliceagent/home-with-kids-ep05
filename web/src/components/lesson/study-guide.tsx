"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BEIJING_NOTES,
  CULTURE_CARDS,
  GRAMMAR_STEPS,
  IDIOMS,
  VOCAB_DECKS,
} from "@/data/curriculum";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  Landmark,
  Layers,
  MapPin,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

type TabId = "decks" | "idioms" | "grammar" | "beijing" | "culture";

const TABS: { id: TabId; label: string; icon: React.ReactNode; count: number }[] = [
  {
    id: "decks",
    label: "Vocabulary",
    icon: <Layers className="size-4" />,
    count: VOCAB_DECKS.reduce((n, d) => n + d.items.length, 0),
  },
  {
    id: "idioms",
    label: "成语 Idioms",
    icon: <Sparkles className="size-4" />,
    count: IDIOMS.length,
  },
  {
    id: "grammar",
    label: "Grammar",
    icon: <BookOpen className="size-4" />,
    count: GRAMMAR_STEPS.length,
  },
  {
    id: "beijing",
    label: "北京话",
    icon: <MapPin className="size-4" />,
    count: BEIJING_NOTES.length,
  },
  {
    id: "culture",
    label: "Culture",
    icon: <Landmark className="size-4" />,
    count: CULTURE_CARDS.length,
  },
];

function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border p-5 md:p-6", className)}>{children}</div>
  );
}

function DecksTab({ query }: { query: string }) {
  return (
    <div className="space-y-5">
      {VOCAB_DECKS.map((deck) => {
        const items = deck.items.filter(
          (i) =>
            !query ||
            i.chinese.includes(query) ||
            i.pinyin.toLowerCase().includes(query.toLowerCase()) ||
            i.english.toLowerCase().includes(query.toLowerCase()),
        );
        if (!items.length) return null;

        return (
          <Section
            key={deck.id}
            className="border-indigo-400/30 bg-indigo-500/[0.07]"
          >
            <div className="mb-4">
              <h2 className="font-serif text-2xl text-white">{deck.title}</h2>
              <p className="text-sm text-indigo-200">{deck.titleEn}</p>
              <p className="mt-1 text-xs text-white/45">{deck.theme}</p>
            </div>

            <ul className="divide-y divide-white/10">
              {items.map((item) => (
                <li key={item.chinese} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-serif text-xl text-white">
                      {item.chinese}
                    </span>
                    <span className="text-sm text-teal-200">{item.pinyin}</span>
                    <span className="text-sm text-white/75">{item.english}</span>
                  </div>
                  {item.breakdown && (
                    <p className="mt-1 text-xs text-violet-200/80">
                      {item.breakdown.join(" · ")}
                    </p>
                  )}
                  {item.note && (
                    <p className="mt-1 text-xs leading-relaxed text-white/50">
                      {item.note}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[10px] text-white/30">
                    heard at line {item.heardAt.join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        );
      })}
    </div>
  );
}

function IdiomsTab({ query }: { query: string }) {
  const items = IDIOMS.filter(
    (i) =>
      !query ||
      i.chinese.includes(query) ||
      i.pinyin.toLowerCase().includes(query.toLowerCase()) ||
      i.english.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {items.map((idiom) => (
        <Section key={idiom.id} className="border-rose-400/30 bg-rose-500/[0.07]">
          <h2 className="font-serif text-2xl text-white md:text-3xl">
            {idiom.chinese}
          </h2>
          <p className="mt-1 text-base text-teal-200">{idiom.pinyin}</p>
          <p className="mt-1.5 text-base text-white/85">{idiom.english}</p>

          <p className="mt-3 border-t border-white/10 pt-3 text-sm text-white/65">
            <span className="font-semibold text-white/85">Literal: </span>
            {idiom.literal}
          </p>

          {idiom.trap && (
            <p className="mt-3 flex gap-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm leading-relaxed text-amber-100">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                <span className="font-semibold">Watch out: </span>
                {idiom.trap}
              </span>
            </p>
          )}

          <p className="mt-3 font-mono text-[10px] text-white/30">
            heard at line {idiom.anchors.join(", ")}
          </p>
        </Section>
      ))}
    </div>
  );
}

function GrammarTab({ query }: { query: string }) {
  const items = GRAMMAR_STEPS.filter(
    (g) =>
      !query ||
      g.pattern.includes(query) ||
      g.english.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {items.map((step) => (
        <Section key={step.id} className="border-sky-400/30 bg-sky-500/[0.07]">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-xl text-white md:text-2xl">
              {step.pattern}
            </h2>
            {step.ladder && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-sky-100">
                <span className="font-serif text-sm">{step.ladder.family}</span>
                step {step.ladder.step} of {step.ladder.of}
              </span>
            )}
          </div>
          <p className="text-sm text-teal-200">{step.patternPinyin}</p>
          <p className="mt-1.5 text-base text-white/85">{step.english}</p>

          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              From the episode
            </p>
            <p className="mt-1.5 font-serif text-lg text-white">{step.example}</p>
            <p className="mt-0.5 text-sm text-teal-200">{step.examplePinyin}</p>
            <p className="mt-0.5 text-sm text-white/70">{step.exampleEnglish}</p>
          </div>

          <div className="mt-3 rounded-lg border border-white/15 bg-black/25 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-300/80">
              Your turn
            </p>
            <p className="mt-1 text-sm text-white/85">{step.drill}</p>
            <p className="mt-1.5 font-serif text-base text-sky-200">
              {step.drillAnswer}
            </p>
          </div>
        </Section>
      ))}
    </div>
  );
}

function BeijingTab({ query }: { query: string }) {
  const items = BEIJING_NOTES.filter(
    (n) =>
      !query ||
      n.feature.includes(query) ||
      n.english.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {items.map((note) => (
        <Section
          key={note.id}
          className="border-orange-400/30 bg-orange-500/[0.07]"
        >
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h2 className="font-serif text-2xl text-white md:text-3xl">
              {note.feature}
            </h2>
            <span className="text-base text-teal-200">{note.featurePinyin}</span>
          </div>
          <p className="mt-1.5 text-base text-white/85">{note.english}</p>

          <p className="mt-3 flex flex-wrap items-baseline gap-2 border-t border-white/10 pt-3 text-sm">
            <span className="font-semibold text-orange-100">Standard Mandarin:</span>
            <span className="font-serif text-lg text-white/90">{note.standard}</span>
          </p>

          <p className="mt-3 text-sm leading-relaxed text-white/75">
            {note.explanation}
          </p>

          <p className="mt-3 font-mono text-[10px] text-white/30">
            {note.anchors.length} lines in this episode
          </p>
        </Section>
      ))}
    </div>
  );
}

function CultureTab({ query }: { query: string }) {
  const items = CULTURE_CARDS.filter(
    (c) =>
      !query ||
      c.title.includes(query) ||
      c.english.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {items.map((card) => (
        <Section
          key={card.id}
          className="border-emerald-400/30 bg-emerald-500/[0.07]"
        >
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h2 className="font-serif text-2xl text-white md:text-3xl">
              {card.title}
            </h2>
            <span className="text-base text-teal-200">{card.titlePinyin}</span>
          </div>
          <p className="mt-1.5 text-base text-white/85">{card.english}</p>
          <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-emerald-50/85">
            {card.body}
          </p>
        </Section>
      ))}
    </div>
  );
}

export function StudyGuide() {
  const [tab, setTab] = useState<TabId>("decks");
  const [query, setQuery] = useState("");

  const totalItems = useMemo(
    () => TABS.reduce((n, t) => n + t.count, 0),
    [],
  );

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
            Home With Kids · EP5 猫鼠之争
          </p>
          <h1 className="mt-2 font-serif text-4xl text-white md:text-5xl">
            Study guide
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
            {totalItems} items drawn from lines that actually occur in this
            episode — vocabulary, four-character idioms, grammar patterns,
            Beijing colloquial speech, and 2004 cultural context.
          </p>
        </header>

        <div className="sticky top-0 z-10 -mx-4 mb-6 bg-stone-950/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  tab === t.id
                    ? "border-amber-400/60 bg-amber-500/20 text-amber-100"
                    : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
                )}
              >
                {t.icon}
                {t.label}
                <span className="text-white/40">{t.count}</span>
              </button>
            ))}
          </div>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 中文, pinyin, or English…"
            className="mt-3 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-amber-400/50 focus:outline-none"
          />
        </div>

        {tab === "decks" && <DecksTab query={query} />}
        {tab === "idioms" && <IdiomsTab query={query} />}
        {tab === "grammar" && <GrammarTab query={query} />}
        {tab === "beijing" && <BeijingTab query={query} />}
        {tab === "culture" && <CultureTab query={query} />}
      </div>
    </div>
  );
}
