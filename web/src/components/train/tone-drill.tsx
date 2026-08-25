"use client";

/* AGENT-DONE(Q5): tone drill from vocab with tone marks; Chinese + first heardAt clip; four deterministic pinyin variants of the first toned vowel; no pinyin toggle; reveal English + jump; history mode "tones". */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { chineseClip, shuffle } from "@/lib/train-pool";
import { fourToneChoices, tonedVocab, type ToneItem } from "@/lib/tone-drill";
import { pushQuizResult, readQuizHistory, type QuizHistoryEntry } from "@/lib/player-storage";
import {
  PlayClipButton,
  QuizChoiceButton,
  QuizReveal,
  QuizScoreCard,
  useClipPlayer,
} from "@/components/train/quiz-kit";
import { TrainModeShell } from "@/components/train/train-shell";

type ToneQ = {
  item: ToneItem;
  choices: { id: string; label: string; correct: boolean }[];
  correctId: string;
};

function buildRound(): ToneQ[] {
  const pool = tonedVocab();
  return shuffle(pool)
    .slice(0, 8)
    .map((item) => {
      const choices = fourToneChoices(item.pinyin);
      return {
        item,
        choices,
        correctId: choices.find((c) => c.correct)?.id ?? "a",
      };
    });
}

export function ToneDrill() {
  const [round, setRound] = useState<ToneQ[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [history, setHistory] = useState<QuizHistoryEntry[] | null>(null);
  const recordedRef = useRef(false);
  const { play, stop } = useClipPlayer();

  const start = () => {
    recordedRef.current = false;
    setRound(buildRound());
    setIndex(0);
    setPicked(null);
    setAnswers({});
    stop();
  };

  /* eslint-disable react-hooks/set-state-in-effect -- sample after mount */
  useEffect(() => {
    recordedRef.current = false;
    setRound(buildRound());
    setIndex(0);
    setPicked(null);
    setAnswers({});
    setHistory(readQuizHistory("tones"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    stop();
  }, [index, stop]);

  const question = round?.[index];
  const revealed = picked !== null;
  const finished = round !== null && index >= round.length;
  const total = round?.length ?? 8;
  const beatId = question?.item.heardAt[0];

  const score = useMemo(() => {
    if (!round) return 0;
    return round.filter((q, i) => answers[i] === q.correctId).length;
  }, [answers, round]);

  const handlePick = (id: string) => {
    if (picked || !question) return;
    setPicked(id);
    setAnswers((prev) => ({ ...prev, [index]: id }));
    stop();
  };

  const handleNext = () => {
    if (round && index === round.length - 1 && !recordedRef.current) {
      recordedRef.current = true;
      const finalScore = round.filter((q, i) => {
        const chosen = i === index ? picked : answers[i];
        return chosen === q.correctId;
      }).length;
      pushQuizResult({
        ts: Date.now(),
        score: finalScore,
        total: round.length,
        mode: "tones",
      });
      setHistory(readQuizHistory("tones"));
    }
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const attempts = history && history.length > 0 ? history.length : finished ? 1 : 0;
  const best =
    history && history.length > 0 ? Math.max(...history.map((e) => e.score)) : score;

  return (
    <TrainModeShell
      title="Tone drill"
      description="See the characters, hear the line, and pick the pinyin tones. Eight words a round."
      showPinyinToggle={false}
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
              ? "Every tone — your ear is matching the marks."
              : score >= 5
                ? "Close. Replay the clip and listen for the first syllable."
                : "The first marked vowel is the one that moved. Try again."
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
          <div className="mb-5 flex items-center justify-between text-xs text-white/40">
            <span>
              Question {index + 1} of {total}
            </span>
          </div>
          <p
            lang="zh-CN"
            className="mb-5 text-center font-serif text-5xl text-white md:text-6xl"
          >
            {question.item.chinese}
          </p>
          {beatId && (
            <div className="mb-6 flex flex-col items-center gap-3">
              <PlayClipButton
                url={chineseClip(beatId)}
                play={play}
                large
                label="Play Chinese line"
              />
              <p className="text-sm text-white/50">Tap to hear it in the show</p>
            </div>
          )}
          <p className="text-lg text-white md:text-xl">Which tones?</p>
          <div className="mt-5 space-y-2.5">
            {question.choices.map((c) => (
              <QuizChoiceButton
                key={c.id}
                id={c.id}
                label={c.label}
                picked={picked}
                revealed={revealed}
                correctId={question.correctId}
                onPick={handlePick}
              />
            ))}
          </div>
          {revealed && (
            <QuizReveal
              correct={picked === question.correctId}
              beatId={beatId}
              onNext={handleNext}
              nextLabel={index === total - 1 ? "See score" : "Next question"}
            >
              <p className="text-teal-200/90">{question.item.pinyin}</p>
              <p className="mt-1 text-white/75">{question.item.english}</p>
            </QuizReveal>
          )}
        </article>
      ) : null}
    </TrainModeShell>
  );
}
