"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import beatsData from "@/data/ep05-beats.json";
import { pickQuiz, type QuizQuestion } from "@/data/quiz";
import { pushQuizResult, readQuizHistory, type QuizHistoryEntry } from "@/lib/player-storage";
import type { Beat } from "@/types/lesson";
import {
  PinyinToggle,
  QuizChoiceButton,
  QuizReveal,
  QuizScoreCard,
  usePinyinPref,
} from "@/components/train/quiz-kit";
import { ArrowLeft } from "lucide-react";

const BEATS = beatsData as Beat[];

function beatPinyin(beatId?: string): string | null {
  if (!beatId) return null;
  const pinyin = BEATS.find((b) => b.id === beatId)?.pinyin;
  return pinyin && pinyin.trim().length > 0 ? pinyin : null;
}

/* AGENT-DONE(T2): PinyinToggle in header; pinyin beside promptZh and in the reveal is hidden when off; history recorded with mode "quiz". */
/* AGENT-DONE(3b): pickQuiz(5) after mount (empty shell first); Try again resamples; finish pushes quiz history and shows best/attempt count, including first run. */
export function ExitQuiz() {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<QuizHistoryEntry[] | null>(null);
  const recordedRef = useRef(false);
  const { pinyinOn, setPinyinOn } = usePinyinPref();

  const startAttempt = () => {
    recordedRef.current = false;
    setQuestions(pickQuiz(5));
    setIndex(0);
    setPicked(null);
    setAnswers({});
  };

  /* eslint-disable react-hooks/set-state-in-effect -- sample and history are client-only */
  useEffect(() => {
    startAttempt();
    setHistory(readQuizHistory("quiz"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const question = questions?.[index];
  const revealed = picked !== null;
  const finished = questions !== null && index >= questions.length;
  const promptPinyin = beatPinyin(question?.beatId);

  const score = useMemo(
    () =>
      questions
        ? questions.filter((q) => answers[q.id] === q.correctId).length
        : 0,
    [answers, questions],
  );

  const handlePick = (id: string) => {
    if (picked || !question) return;
    setPicked(id);
    setAnswers((prev) => ({ ...prev, [question.id]: id }));
  };

  const handleNext = () => {
    if (questions && index === questions.length - 1 && !recordedRef.current) {
      recordedRef.current = true;
      const finalScore = questions.filter((q) => {
        const chosen = q.id === question?.id ? picked : answers[q.id];
        return chosen === q.correctId;
      }).length;
      pushQuizResult({
        ts: Date.now(),
        score: finalScore,
        total: questions.length,
        mode: "quiz",
      });
      setHistory(readQuizHistory("quiz"));
    }
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const attempts = history && history.length > 0 ? history.length : finished ? 1 : 0;
  const best =
    history && history.length > 0
      ? Math.max(...history.map((e) => e.score))
      : score;
  const total = questions?.length ?? 5;

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to episode
        </Link>

        <header className="mb-8">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-400/90">
              Home With Kids · EP5
            </p>
            <PinyinToggle pinyinOn={pinyinOn} onChange={setPinyinOn} />
          </div>
          <h1 className="mt-2 font-serif text-4xl text-white md:text-5xl">
            Exit quiz
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
            Five questions sampled from a larger bank — Beijing speech, idioms,
            vocabulary, and grammar from lines you just watched. Each attempt
            draws a new set.
          </p>
        </header>

        {!questions ? (
          <p className="text-sm text-white/50">Drawing five questions…</p>
        ) : finished ? (
          <QuizScoreCard
            score={score}
            total={total}
            best={best}
            attempts={attempts}
            message={
              score === total
                ? "All five — you caught the register switches and the false friend."
                : score >= 3
                  ? "Solid. Revisit the missed cards on the study guide, then try again."
                  : "Worth another pass through the teaching cards — especially 耗子, 咱, and 好不容易."
            }
            onRetry={startAttempt}
            extra={
              <Link
                href="/study"
                className="inline-flex min-h-11 items-center rounded-lg bg-white/10 px-3 text-sm text-white transition hover:bg-white/20"
              >
                Open study guide
              </Link>
            }
          />
        ) : question ? (
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white/40">
              <span>
                Question {index + 1} of {total}
              </span>
              {question.promptZh && (
                <span className="text-right">
                  <span lang="zh-CN" className="font-serif text-base text-amber-200/90">
                    {question.promptZh}
                  </span>
                  {pinyinOn && promptPinyin && (
                    <span className="mt-0.5 block text-xs text-teal-300/80">
                      {promptPinyin}
                    </span>
                  )}
                </span>
              )}
            </div>

            <p className="text-lg leading-relaxed text-white md:text-xl">
              {question.prompt}
            </p>

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
                beatId={question.beatId}
                onNext={handleNext}
                nextLabel={index === total - 1 ? "See score" : "Next question"}
              >
                <p>{question.why}</p>
                {pinyinOn && promptPinyin && (
                  <p className="mt-1 text-teal-200/80">{promptPinyin}</p>
                )}
              </QuizReveal>
            )}
          </article>
        ) : null}
      </div>
    </div>
  );
}
