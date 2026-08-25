"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EP05_QUIZ, type QuizQuestion } from "@/data/quiz";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from "lucide-react";

function ChoiceButton({
  question,
  choiceId,
  picked,
  revealed,
  onPick,
}: {
  question: QuizQuestion;
  choiceId: string;
  picked: string | null;
  revealed: boolean;
  onPick: (id: string) => void;
}) {
  const choice = question.choices.find((c) => c.id === choiceId);
  if (!choice) return null;

  const isCorrect = choiceId === question.correctId;
  const isPicked = picked === choiceId;

  return (
    <button
      type="button"
      disabled={revealed}
      onClick={() => onPick(choiceId)}
      className={cn(
        "w-full rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition",
        !revealed && "border-white/15 bg-white/5 hover:bg-white/10",
        revealed && isCorrect && "border-emerald-400/60 bg-emerald-500/15 text-emerald-50",
        revealed && isPicked && !isCorrect && "border-rose-400/60 bg-rose-500/15 text-rose-50",
        revealed && !isPicked && !isCorrect && "border-white/10 bg-white/[0.03] text-white/50",
      )}
    >
      <span className="mr-2 font-mono text-xs text-white/40">{choiceId.toUpperCase()}.</span>
      {choice.label}
    </button>
  );
}

export function ExitQuiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = EP05_QUIZ[index];
  const revealed = picked !== null;
  const finished = index >= EP05_QUIZ.length;

  const score = useMemo(
    () => EP05_QUIZ.filter((q) => answers[q.id] === q.correctId).length,
    [answers],
  );

  const handlePick = (id: string) => {
    if (picked) return;
    setPicked(id);
    setAnswers((prev) => ({ ...prev, [question.id]: id }));
  };

  const handleNext = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const handleRestart = () => {
    setIndex(0);
    setPicked(null);
    setAnswers({});
  };

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
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-400/90">
            Home With Kids · EP5
          </p>
          <h1 className="mt-2 font-serif text-4xl text-white md:text-5xl">
            Exit quiz
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
            Five questions drawn from lines you just watched — Beijing speech,
            a false-friend idiom, the 比 ladder, and why she says 阿姨.
          </p>
        </header>

        {finished ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 md:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300/80">
              Score
            </p>
            <p className="mt-2 font-serif text-5xl text-white">
              {score}
              <span className="text-2xl text-white/50"> / {EP05_QUIZ.length}</span>
            </p>
            <p className="mt-3 text-sm text-white/70">
              {score === EP05_QUIZ.length
                ? "All five — you caught the register switches and the false friend."
                : score >= 3
                  ? "Solid. Revisit the missed cards on the study guide, then try again."
                  : "Worth another pass through the teaching cards — especially 耗子, 咱, and 好不容易."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={handleRestart}
                className="gap-2 bg-amber-600 text-white hover:bg-amber-500"
              >
                <RotateCcw className="size-4" />
                Try again
              </Button>
              <Link
                href="/study"
                className="inline-flex h-8 items-center rounded-lg bg-white/10 px-3 text-sm text-white transition hover:bg-white/20"
              >
                Open study guide
              </Link>
            </div>
          </div>
        ) : (
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-7">
            <div className="mb-4 flex items-center justify-between text-xs text-white/40">
              <span>
                Question {index + 1} of {EP05_QUIZ.length}
              </span>
              {question.promptZh && (
                <span lang="zh-CN" className="font-serif text-base text-amber-200/90">
                  {question.promptZh}
                </span>
              )}
            </div>

            <p className="text-lg leading-relaxed text-white md:text-xl">
              {question.prompt}
            </p>

            <div className="mt-5 space-y-2.5">
              {question.choices.map((c) => (
                <ChoiceButton
                  key={c.id}
                  question={question}
                  choiceId={c.id}
                  picked={picked}
                  revealed={revealed}
                  onPick={handlePick}
                />
              ))}
            </div>

            {revealed && (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
                  {picked === question.correctId ? (
                    <>
                      <Check className="size-4 text-emerald-300" />
                      <span className="text-emerald-200">Correct</span>
                    </>
                  ) : (
                    <>
                      <X className="size-4 text-rose-300" />
                      <span className="text-rose-200">Not quite</span>
                    </>
                  )}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {question.why}
                </p>
                {question.beatId && (
                  <Link
                    href={`/?beat=${question.beatId}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-400/80 transition hover:text-amber-300"
                  >
                    Jump to this line
                    <ArrowRight className="size-3" />
                  </Link>
                )}
                <div>
                  <Button
                    onClick={handleNext}
                    className="mt-4 bg-amber-600 text-white hover:bg-amber-500"
                  >
                    {index === EP05_QUIZ.length - 1 ? "See score" : "Next question"}
                  </Button>
                </div>
              </div>
            )}
          </article>
        )}
      </div>
    </div>
  );
}
