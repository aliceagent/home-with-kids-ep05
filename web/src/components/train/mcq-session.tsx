"use client";

/* AGENT-DONE(R5): shared after-mount MCQ session — history, clip player, score card, empty shell first. */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { pushQuizResult, readQuizHistory, type QuizHistoryEntry } from "@/lib/player-storage";
import {
  PlayClipButton,
  QuizChoiceButton,
  QuizReveal,
  QuizScoreCard,
  useClipPlayer,
  usePinyinPref,
} from "@/components/train/quiz-kit";
import { TrainModeShell } from "@/components/train/train-shell";

export type McqChoice = {
  id: string;
  label: ReactNode;
  lang?: string;
};

export type McqItem = {
  correctId: string;
  beatId?: string;
  choices: McqChoice[];
};

export function AudioPrompt({
  url,
  play,
  label = "Play line",
  caption = "Tap to play — you can replay",
}: {
  url: string;
  play: (url: string) => void;
  label?: string;
  caption?: string;
}) {
  return (
    <div className="mb-6 flex flex-col items-center gap-3">
      <PlayClipButton url={url} play={play} large label={label} />
      <p className="text-sm text-white/50">{caption}</p>
    </div>
  );
}

export function McqSession<T extends McqItem>({
  mode,
  title,
  description,
  showPinyinToggle = true,
  build,
  renderStem,
  renderReveal,
  messages,
}: {
  mode: string;
  title: string;
  description: string;
  showPinyinToggle?: boolean;
  build: () => T[];
  renderStem: (
    question: T,
    ctx: { play: (url: string) => void; pinyinOn: boolean },
  ) => ReactNode;
  renderReveal: (question: T, ctx: { pinyinOn: boolean }) => ReactNode;
  messages: { perfect: string; good: string; retry: string };
}) {
  const [round, setRound] = useState<T[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [history, setHistory] = useState<QuizHistoryEntry[] | null>(null);
  const recordedRef = useRef(false);
  const { pinyinOn, setPinyinOn } = usePinyinPref();
  const { play, stop } = useClipPlayer();

  const start = () => {
    recordedRef.current = false;
    setRound(build());
    setIndex(0);
    setPicked(null);
    setAnswers({});
    stop();
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- sample after mount; build/mode are fixed per page */
  useEffect(() => {
    recordedRef.current = false;
    setRound(build());
    setIndex(0);
    setPicked(null);
    setAnswers({});
    setHistory(readQuizHistory(mode));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  useEffect(() => {
    stop();
  }, [index, stop]);

  const question = round?.[index];
  const revealed = picked !== null;
  const finished = round !== null && index >= round.length;
  const total = round?.length ?? 8;

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
        mode,
      });
      setHistory(readQuizHistory(mode));
    }
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const attempts = history && history.length > 0 ? history.length : finished ? 1 : 0;
  const best =
    history && history.length > 0 ? Math.max(...history.map((e) => e.score)) : score;
  const goodBar = Math.max(1, Math.ceil(total * 0.6));

  return (
    <TrainModeShell
      title={title}
      description={description}
      pinyinOn={pinyinOn}
      onPinyinChange={setPinyinOn}
      showPinyinToggle={showPinyinToggle}
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
              ? messages.perfect
              : score >= goodBar
                ? messages.good
                : messages.retry
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
          {renderStem(question, { play, pinyinOn })}
          <div className="mt-5 space-y-2.5">
            {question.choices.map((c) => (
              <QuizChoiceButton
                key={c.id}
                id={c.id}
                label={c.label}
                lang={c.lang}
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
              beatId={question.beatId}
              onNext={handleNext}
              nextLabel={index === total - 1 ? "See score" : "Next question"}
            >
              {renderReveal(question, { pinyinOn })}
            </QuizReveal>
          )}
        </article>
      ) : null}
    </TrainModeShell>
  );
}
