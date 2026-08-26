"use client";

/* AGENT-DONE(Q4): 8-round who-said-it from cast dialogue; tap plays chinese clip; four character chips with EP05_META colors; reveal scene still + Chinese + English + speaker; history mode "who-said-it". */

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSceneImageCandidates } from "@/lib/lesson-utils";
import { chineseClip } from "@/lib/train-pool";
import { buildWhoSaidItQuestions, type WhoQ } from "@/lib/train-questions";
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

function buildRound(): WhoQ[] {
  return buildWhoSaidItQuestions(8);
}

function SceneStill({ source, alt }: { source: string | null; alt: string }) {
  const [i, setI] = useState(0);
  const urls = getSceneImageCandidates(source);
  const url = urls[i];
  if (!url) return null;
  return (
    <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10">
      <Image
        src={url}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 672px) 100vw, 672px"
        onError={() => setI((n) => (n + 1 < urls.length ? n + 1 : n))}
      />
    </div>
  );
}

export function WhoSaidItQuiz() {
  const [round, setRound] = useState<WhoQ[] | null>(null);
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
    setHistory(readQuizHistory("who-said-it"));
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
        mode: "who-said-it",
      });
      setHistory(readQuizHistory("who-said-it"));
    }
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const attempts = history && history.length > 0 ? history.length : finished ? 1 : 0;
  const best =
    history && history.length > 0 ? Math.max(...history.map((e) => e.score)) : score;
  const speaker = question?.choices.find((c) => c.id === question.correctId);

  return (
    <TrainModeShell
      title="Who said it?"
      description="Hear a line from the episode and name the speaker. Eight questions a round."
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
              ? "Every voice — you can tell them apart with your eyes closed."
              : score >= 5
                ? "Good ear. Replay the misses and listen for who is talking."
                : "The four voices sit in different corners of the room. Try again."
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
          <p className="text-lg text-white md:text-xl">Who said this?</p>
          <div className="mt-5 space-y-2.5">
            {question.choices.map((c) => (
              <QuizChoiceButton
                key={c.id}
                id={c.id}
                picked={picked}
                revealed={revealed}
                correctId={question.correctId}
                onPick={handlePick}
                label={
                  <span className="inline-flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${c.color}`} />
                    <span lang="zh-CN">{c.name}</span>
                    <span className="text-white/40">{c.nameEn}</span>
                  </span>
                }
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
              <SceneStill
                key={question.beat.id}
                source={question.beat.source}
                alt={speaker ? `${speaker.name} in this scene` : "Scene from the line"}
              />
              <p lang="zh-CN" className="font-serif text-lg text-white">
                {question.beat.chinese}
              </p>
              {pinyinOn && (
                <p className="mt-1 text-teal-200/90">{question.beat.pinyin}</p>
              )}
              <p className="mt-1 text-white/70">{question.beat.english}</p>
              {speaker && (
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/80">
                  <span className={`size-2.5 rounded-full ${speaker.color}`} />
                  <span lang="zh-CN">{speaker.name}</span>
                  <span className="text-white/40">{speaker.nameEn}</span>
                </p>
              )}
            </QuizReveal>
          )}
        </article>
      ) : null}
    </TrainModeShell>
  );
}
