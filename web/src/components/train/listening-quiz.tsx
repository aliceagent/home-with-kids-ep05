"use client";

/* AGENT-DONE(Q1): 8-question listening round from long dialogue beats; tap plays chinese mp3; English choices; reveal Chinese/pinyin + jump link; history mode "listening". */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Beat } from "@/types/lesson";
import {
  chineseClip,
  fourEnglishChoices,
  quizableDialogue,
  sampleBeats,
  similarBeats,
} from "@/lib/train-pool";
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

type ListeningQ = {
  beat: Beat;
  choices: { id: string; label: string; correct: boolean }[];
  correctId: string;
};

function buildRound(): ListeningQ[] {
  const pool = quizableDialogue();
  return sampleBeats(pool, 8).map((beat) => {
    const choices = fourEnglishChoices(beat, similarBeats(pool, beat, 3));
    return {
      beat,
      choices: choices.map((c) => ({ id: c.id, label: c.label, correct: c.correct })),
      correctId: choices.find((c) => c.correct)?.id ?? "a",
    };
  });
}

export function ListeningQuiz() {
  const [round, setRound] = useState<ListeningQ[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [history, setHistory] = useState<QuizHistoryEntry[] | null>(null);
  const recordedRef = useRef(false);
  const { pinyinOn, setPinyinOn } = usePinyinPref();
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
    setHistory(readQuizHistory("listening"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

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
        mode: "listening",
      });
      setHistory(readQuizHistory("listening"));
    }
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const attempts = history && history.length > 0 ? history.length : finished ? 1 : 0;
  const best =
    history && history.length > 0 ? Math.max(...history.map((e) => e.score)) : score;

  return (
    <TrainModeShell
      title="Listening"
      description="Hear a line from the episode in Chinese, then pick what it means. Eight questions a round."
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
              ? "Every line — your ear is keeping up with the household."
              : score >= 5
                ? "Solid listen. Replay the misses from the jump links, then try again."
                : "Play the clip a couple of times before you pick — the tones carry the meaning."
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
          <div className="mb-6 flex flex-col items-center gap-3">
            <PlayClipButton
              url={chineseClip(question.beat.id)}
              play={play}
              large
              label="Play Chinese line"
            />
            <p className="text-sm text-white/50">Tap to play — you can replay</p>
          </div>
          <p className="text-lg text-white md:text-xl">What does this line mean?</p>
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
            </QuizReveal>
          )}
        </article>
      ) : null}
    </TrainModeShell>
  );
}
