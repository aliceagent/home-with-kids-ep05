"use client";

import questions from "@/data/quiz.json";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Question = (typeof questions)[number];

export default function QuizPage() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const question = questions[index] as Question | undefined;
  const done = index >= questions.length;
  const score = useMemo(
    () => questions.filter((q) => picked[q.id] === q.correctId).length,
    [picked],
  );

  return (
    <main className="min-h-dvh bg-stone-950 text-white">
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-6 md:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to the episode
          </Link>
          <p className="text-xs text-white/40">家有儿女 · EP5 exit quiz</p>
        </div>

        {done ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
              Quiz complete
            </p>
            <h1 className="mt-2 font-serif text-3xl text-white">
              {score}/{questions.length} correct
            </h1>
            <p className="mt-2 text-sm text-white/70">
              耗子 vs 老鼠, 咱 vs 我们, 好不容易, 比 vs 比较, and why she is 阿姨 —
              the five things this cut of 猫鼠之争 actually teaches.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setIndex(0);
                  setPicked({});
                }}
                className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
              >
                <RotateCcw className="size-4" />
                Try again
              </button>
              <Link
                href="/"
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Watch again
              </Link>
            </div>
          </div>
        ) : question ? (
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-white/60">
                {index + 1} / {questions.length}
              </span>
              <span className="font-serif text-xl text-amber-200">
                {question.promptZh}
              </span>
            </div>
            <p className="text-lg leading-relaxed text-white">{question.prompt}</p>
            <div className="mt-5 space-y-2">
              {question.choices.map((choice) => {
                const selected = picked[question.id];
                const revealed = !!selected;
                const isCorrect = choice.id === question.correctId;
                const isPicked = selected === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={revealed}
                    onClick={() => {
                      if (picked[question.id]) return;
                      setPicked((prev) => ({ ...prev, [question.id]: choice.id }));
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left text-sm transition",
                      revealed
                        ? isCorrect
                          ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-50"
                          : isPicked
                            ? "border-rose-400/50 bg-rose-500/15 text-rose-50"
                            : "border-white/10 text-white/45"
                        : "border-white/15 bg-black/20 text-white/90 hover:border-amber-400/40 hover:bg-white/5",
                    )}
                  >
                    <span className="mt-0.5 font-mono text-xs text-white/40">
                      {choice.id.toUpperCase()}
                    </span>
                    <span className="flex-1">{choice.label}</span>
                    {revealed && isCorrect && <Check className="size-4 text-emerald-300" />}
                    {revealed && isPicked && !isCorrect && (
                      <X className="size-4 text-rose-300" />
                    )}
                  </button>
                );
              })}
            </div>
            {picked[question.id] && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-sm leading-relaxed text-white/75">{question.why}</p>
                <button
                  type="button"
                  onClick={() => setIndex((n) => n + 1)}
                  className="mt-4 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
                >
                  {index + 1 === questions.length ? "See score" : "Next question"}
                </button>
              </div>
            )}
          </article>
        ) : null}
      </div>
    </main>
  );
}
