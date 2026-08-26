"use client";

/* AGENT-DONE(C1): dictation builder — 8 lines of 6–14 Han chars; tap plays chinese clip; seeded character chips; Check grades order; wrong slots highlighted; history mode "dictation". */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Beat } from "@/types/lesson";
import {
  chineseClip,
  dictationBeats,
  dictationChars,
  hashSalt,
  sampleBeats,
  seededShuffle,
} from "@/lib/train-pool";
import { pushQuizResult, readQuizHistory, type QuizHistoryEntry } from "@/lib/player-storage";
import {
  QuizReveal,
  QuizScoreCard,
  useClipPlayer,
  usePinyinPref,
} from "@/components/train/quiz-kit";
import { AudioPrompt } from "@/components/train/mcq-session";
import { TrainModeShell } from "@/components/train/train-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tile = { id: string; char: string };

type DictationQ = {
  beat: Beat;
  target: string[];
  bank: Tile[];
};

function buildRound(): DictationQ[] {
  return sampleBeats(dictationBeats(), 8).map((beat, index) => {
    const target = dictationChars(beat.chinese);
    const tiles: Tile[] = target.map((char, i) => ({ id: `${index}-${i}-${char}`, char }));
    return {
      beat,
      target,
      bank: seededShuffle(tiles, hashSalt(`${beat.id}:${index}`)),
    };
  });
}

export function DictationQuiz() {
  const [round, setRound] = useState<DictationQ[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Tile[]>([]);
  const [bank, setBank] = useState<Tile[]>([]);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [history, setHistory] = useState<QuizHistoryEntry[] | null>(null);
  const recordedRef = useRef(false);
  const { pinyinOn, setPinyinOn } = usePinyinPref();
  const { play, stop } = useClipPlayer();

  const load = (next: DictationQ[]) => {
    recordedRef.current = false;
    setRound(next);
    setIndex(0);
    setAnswer([]);
    setBank(next[0]?.bank ?? []);
    setChecked(false);
    setAnswers({});
    stop();
  };

  const start = () => load(buildRound());

  /* eslint-disable react-hooks/set-state-in-effect -- sample after mount */
  useEffect(() => {
    const next = buildRound();
    recordedRef.current = false;
    setRound(next);
    setIndex(0);
    setAnswer([]);
    setBank(next[0]?.bank ?? []);
    setChecked(false);
    setAnswers({});
    setHistory(readQuizHistory("dictation"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    stop();
  }, [index, stop]);

  const question = round?.[index];
  const finished = round !== null && index >= round.length;
  const total = round?.length ?? 8;
  const complete = Boolean(question && answer.length === question.target.length);
  const correct =
    checked &&
    question !== undefined &&
    answer.length === question.target.length &&
    answer.every((t, i) => t.char === question.target[i]);

  const score = Object.values(answers).filter(Boolean).length;
  const attempts = history && history.length > 0 ? history.length : finished ? 1 : 0;
  const best =
    history && history.length > 0 ? Math.max(...history.map((e) => e.score)) : score;

  const takeFromBank = (tile: Tile) => {
    if (checked) return;
    setBank((b) => b.filter((t) => t.id !== tile.id));
    setAnswer((a) => [...a, tile]);
  };

  const returnToBank = (tile: Tile) => {
    if (checked) return;
    setAnswer((a) => a.filter((t) => t.id !== tile.id));
    setBank((b) => [...b, tile]);
  };

  const handleCheck = () => {
    if (!question || !complete || checked) return;
    const ok = answer.every((t, i) => t.char === question.target[i]);
    setChecked(true);
    setAnswers((prev) => ({ ...prev, [index]: ok }));
    stop();
  };

  const handleNext = () => {
    if (!round) return;
    if (index === round.length - 1 && !recordedRef.current) {
      recordedRef.current = true;
      const finalScore =
        Object.values({ ...answers, [index]: correct }).filter(Boolean).length;
      pushQuizResult({
        ts: Date.now(),
        score: finalScore,
        total: round.length,
        mode: "dictation",
      });
      setHistory(readQuizHistory("dictation"));
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setChecked(false);
    setAnswer([]);
    setBank(round[nextIndex]?.bank ?? []);
  };

  return (
    <TrainModeShell
      title="Dictation"
      description="Hear a line, then tap the characters in order. Eight short lines a round."
      pinyinOn={pinyinOn}
      onPinyinChange={setPinyinOn}
    >
      {!round ? (
        <p className="text-sm text-white/50">Drawing questions…</p>
      ) : finished ? (
        <QuizScoreCard
          score={score}
          total={total}
          best={best}
          attempts={attempts}
          message={
            score === total
              ? "Every character in order — your ear is lining up with the script."
              : score >= 5
                ? "Solid. Replay the misses and watch the slots you marked wrong."
                : "Play the clip twice before you tap. Short lines first."
          }
          onRetry={start}
          extra={
            <Link
              href="/train"
              className="inline-flex h-8 items-center rounded-lg bg-white/10 px-3 text-sm text-white transition hover:bg-white/20"
            >
              All modes
            </Link>
          }
        />
      ) : question ? (
        <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-7">
          <div className="mb-5 text-xs text-white/40">
            Question {index + 1} of {total}
          </div>
          <AudioPrompt
            url={chineseClip(question.beat.id)}
            play={play}
            label="Play Chinese line"
          />

          <p className="mb-2 text-xs uppercase tracking-widest text-white/40">
            Your line
          </p>
          <div className="mb-5 flex min-h-14 flex-wrap gap-1.5 rounded-xl border border-white/10 bg-black/30 p-2">
            {question.target.map((_, i) => {
              const tile = answer[i];
              const wrong = checked && tile && tile.char !== question.target[i];
              const right = checked && tile && tile.char === question.target[i];
              return (
                <button
                  key={tile?.id ?? `slot-${i}`}
                  type="button"
                  disabled={!tile || checked}
                  onClick={() => tile && returnToBank(tile)}
                  aria-label={tile ? `Remove ${tile.char}` : `Empty slot ${i + 1}`}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg border font-serif text-lg",
                    !tile && "border-dashed border-white/20 text-white/20",
                    tile && !checked && "border-amber-400/40 bg-amber-500/15 text-white",
                    right && "border-emerald-400/60 bg-emerald-500/15 text-emerald-50",
                    wrong && "border-rose-400/60 bg-rose-500/15 text-rose-50",
                  )}
                >
                  {tile ? <span lang="zh-CN">{tile.char}</span> : i + 1}
                </button>
              );
            })}
          </div>

          <p className="mb-2 text-xs uppercase tracking-widest text-white/40">
            Character bank
          </p>
          <div className="flex min-h-14 flex-wrap gap-1.5">
            {bank.map((tile) => (
              <button
                key={tile.id}
                type="button"
                disabled={checked}
                onClick={() => takeFromBank(tile)}
                lang="zh-CN"
                className="flex size-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 font-serif text-lg text-white transition hover:bg-white/10 disabled:opacity-40"
              >
                {tile.char}
              </button>
            ))}
          </div>

          {!checked && (
            <Button
              onClick={handleCheck}
              disabled={!complete}
              className="mt-6 bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-40"
            >
              Check
            </Button>
          )}

          {checked && (
            <QuizReveal
              correct={correct}
              beatId={question.beat.id}
              onNext={handleNext}
              nextLabel={index === total - 1 ? "See score" : "Next question"}
            >
              <p lang="zh-CN" className="font-serif text-lg text-white">
                {question.beat.chinese}
              </p>
              {pinyinOn && (
                <p className="mt-1 text-teal-200/90">{question.beat.pinyin}</p>
              )}
              <p className="mt-1 text-white/70">{question.beat.english}</p>
            </QuizReveal>
          )}
        </article>
      ) : null}
    </TrainModeShell>
  );
}
