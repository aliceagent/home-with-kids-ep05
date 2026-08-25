"use client";

/* AGENT-DONE(Q3): vocab+idiom deck; front Chinese + show-clip; back English/note with pinyin gated by toggle or a second tap; Again/Good/Easy SRS in hwk-ep05:srs:v1; session due-then-new, 15 max. */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  countFlashcardsDue,
  DAY_MS,
  flashcardDeck,
  isCardDue,
  isNewCard,
  type Flashcard,
} from "@/lib/flashcards";
import { chineseClip, shuffle } from "@/lib/train-pool";
import { readSrsMap, writeSrsMap, type SrsMap } from "@/lib/train-storage";
import { PlayClipButton, useClipPlayer, usePinyinPref } from "@/components/train/quiz-kit";
import { TrainModeShell } from "@/components/train/train-shell";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type Grade = "again" | "good" | "easy";

type Session = {
  cards: Flashcard[];
  dueCount: number;
  newCount: number;
};

function buildSession(map: SrsMap, now: number): Session {
  const deck = flashcardDeck();
  const due = shuffle(deck.filter((c) => isCardDue(c.id, map, now)));
  const neu = shuffle(deck.filter((c) => isNewCard(c.id, map)));
  const cards = [...due, ...neu].slice(0, 15);
  return {
    cards,
    dueCount: cards.filter((c) => isCardDue(c.id, map, now)).length,
    newCount: cards.filter((c) => isNewCard(c.id, map)).length,
  };
}

function applyGrade(map: SrsMap, id: string, grade: Grade, now: number): SrsMap {
  const prev = map[id] ?? { due: now, interval: 0 };
  let interval = prev.interval;
  if (grade === "again") {
    return { ...map, [id]: { due: now, interval: 0 } };
  }
  const seed = grade === "good" ? 1 : 3;
  interval = interval <= 0 ? seed : Math.min(interval * 2, 30);
  return { ...map, [id]: { due: now + interval * DAY_MS, interval } };
}

export function FlashcardsSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const [grades, setGrades] = useState<Record<Grade, number>>({
    again: 0,
    good: 0,
    easy: 0,
  });
  const [remainingDue, setRemainingDue] = useState(0);
  const { pinyinOn, setPinyinOn } = usePinyinPref();
  const { play, stop } = useClipPlayer();

  const start = () => {
    const map = readSrsMap();
    const next = buildSession(map, Date.now());
    setSession(next);
    setIndex(0);
    setFlipped(false);
    setShowPinyin(false);
    setGrades({ again: 0, good: 0, easy: 0 });
    stop();
  };

  /* eslint-disable react-hooks/set-state-in-effect -- SRS is client-only */
  useEffect(() => {
    const map = readSrsMap();
    const next = buildSession(map, Date.now());
    setSession(next);
    setRemainingDue(countFlashcardsDue());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    stop();
  }, [index, stop]);

  const card = session?.cards[index];
  const finished =
    session !== null && session.cards.length > 0 && index >= session.cards.length;
  const pinyinVisible = pinyinOn || showPinyin;

  const handleGrade = (grade: Grade) => {
    if (!card) return;
    const now = Date.now();
    writeSrsMap(applyGrade(readSrsMap(), card.id, grade, now));
    setGrades((g) => ({ ...g, [grade]: g[grade] + 1 }));
    setFlipped(false);
    setShowPinyin(false);
    setIndex((i) => i + 1);
  };

  return (
    <TrainModeShell
      title="Flashcards"
      description="Vocab and idioms from the episode. Grade each card so it comes back when you need it."
      pinyinOn={pinyinOn}
      onPinyinChange={setPinyinOn}
    >
      {!session ? (
        <p className="text-sm text-white/50">Shuffling the deck…</p>
      ) : finished ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300/80">
            Session complete
          </p>
          <p className="mt-2 font-serif text-4xl text-white">
            {session.cards.length} cards
          </p>
          <p className="mt-3 text-sm text-white/70">
            Again {grades.again} · Good {grades.good} · Easy {grades.easy}
          </p>
          <p className="mt-1 text-sm text-white/45">
            Started with {session.dueCount} due and {session.newCount} new.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={start}
              className="bg-amber-600 text-white hover:bg-amber-500"
            >
              Study more
            </Button>
            <Link
              href="/train"
              className="inline-flex h-8 items-center rounded-lg bg-white/10 px-3 text-sm text-white transition hover:bg-white/20"
            >
              All modes
            </Link>
          </div>
        </div>
      ) : card ? (
        <div>
          <p className="mb-3 text-xs text-white/40">
            Card {index + 1} of {session.cards.length}
          </p>
          <div className="relative w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-10 text-center">
            <button
              type="button"
              onClick={() => !flipped && setFlipped(true)}
              className="w-full"
            >
              <p
                lang="zh-CN"
                className="font-serif text-5xl text-white md:text-6xl"
              >
                {card.chinese}
              </p>
              {!flipped && (
                <p className="mt-6 text-[11px] uppercase tracking-widest text-white/30">
                  Tap to flip
                </p>
              )}
            </button>
            {flipped && (
              <div className="mt-6 space-y-2 motion-safe:animate-in motion-safe:fade-in">
                {pinyinVisible ? (
                  <p className="text-lg text-teal-200">{card.pinyin}</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPinyin(true)}
                    className="text-xs text-amber-300/80 underline-offset-2 hover:underline"
                  >
                    show pinyin
                  </button>
                )}
                <p className="text-lg text-white/85">{card.english}</p>
                {card.note && (
                  <p className="text-sm text-white/50">{card.note}</p>
                )}
                {card.beatId && (
                  <Link
                    href={`/?beat=${card.beatId}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-400/80 hover:text-amber-300"
                  >
                    Jump to line
                    <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {card.beatId && (
            <div className="mt-4 flex justify-center">
              <PlayClipButton
                url={chineseClip(card.beatId)}
                play={play}
                label="Hear it in the show"
                caption="Hear it in the show"
              />
            </div>
          )}

          {flipped && (
            <div className="mt-6 grid grid-cols-3 gap-2">
              <Button
                onClick={() => handleGrade("again")}
                className="bg-rose-600 text-white hover:bg-rose-500"
              >
                Again
              </Button>
              <Button
                onClick={() => handleGrade("good")}
                className="bg-amber-600 text-white hover:bg-amber-500"
              >
                Good
              </Button>
              <Button
                onClick={() => handleGrade("easy")}
                className="bg-emerald-700 text-white hover:bg-emerald-600"
              >
                Easy
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 p-6 text-sm text-white/60">
          Nothing due. {remainingDue === 0 ? "Come back tomorrow, or " : ""}
          <button type="button" onClick={start} className="text-amber-300 underline">
            reshuffle
          </button>
          .
        </div>
      )}
    </TrainModeShell>
  );
}
