"use client";

/* AGENT-DONE(C3): daily mix — 10 questions (4 written, 2 listening, 2 who-said-it, 2 tones) via shared builders; backfill from pickQuiz; history mode "daily". Hub Games cards: Daily mix, Dictation, Scene order. */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import beatsData from "@/data/ep05-beats.json";
import { pickQuiz, type QuizQuestion } from "@/data/quiz";
import type { Beat } from "@/types/lesson";
import { chineseClip, shuffle } from "@/lib/train-pool";
import {
  buildListeningQuestions,
  buildToneQuestions,
  buildWhoSaidItQuestions,
  type ListeningQ,
  type ToneQ,
  type WhoQ,
} from "@/lib/train-questions";
import { pushQuizResult, readQuizHistory, type QuizHistoryEntry } from "@/lib/player-storage";
import {
  PlayClipButton,
  QuizChoiceButton,
  QuizReveal,
  QuizScoreCard,
  useClipPlayer,
  usePinyinPref,
} from "@/components/train/quiz-kit";
import { AudioPrompt } from "@/components/train/mcq-session";
import { TrainModeShell } from "@/components/train/train-shell";

const BEATS = beatsData as Beat[];

function beatPinyin(beatId?: string): string | null {
  if (!beatId) return null;
  const pinyin = BEATS.find((b) => b.id === beatId)?.pinyin;
  return pinyin && pinyin.trim().length > 0 ? pinyin : null;
}

type DailyQ =
  | { kind: "written"; id: string; correctId: string; beatId?: string; question: QuizQuestion }
  | { kind: "listening"; id: string; correctId: string; beatId: string; item: ListeningQ }
  | { kind: "who"; id: string; correctId: string; beatId: string; item: WhoQ }
  | { kind: "tones"; id: string; correctId: string; beatId?: string; item: ToneQ };

function wrapWritten(q: QuizQuestion): DailyQ {
  return {
    kind: "written",
    id: `written-${q.id}`,
    correctId: q.correctId,
    beatId: q.beatId,
    question: q,
  };
}

function buildDaily(): DailyQ[] {
  const written = pickQuiz(4).map(wrapWritten);
  const listening = buildListeningQuestions(2).map((item) => ({
    kind: "listening" as const,
    id: `listening-${item.beat.id}`,
    correctId: item.correctId,
    beatId: item.beat.id,
    item,
  }));
  const who = buildWhoSaidItQuestions(2).map((item) => ({
    kind: "who" as const,
    id: `who-${item.beat.id}`,
    correctId: item.correctId,
    beatId: item.beat.id,
    item,
  }));
  const tones = buildToneQuestions(2).map((item) => ({
    kind: "tones" as const,
    id: `tones-${item.item.chinese}`,
    correctId: item.correctId,
    beatId: item.item.heardAt[0],
    item,
  }));

  const items: DailyQ[] = [...written, ...listening, ...who, ...tones];
  const used = new Set(items.map((q) => q.id));
  if (items.length < 10) {
    for (const extra of pickQuiz(10)) {
      const wrapped = wrapWritten(extra);
      if (used.has(wrapped.id)) continue;
      items.push(wrapped);
      used.add(wrapped.id);
      if (items.length >= 10) break;
    }
  }
  return shuffle(items).slice(0, 10);
}

export function DailyMixQuiz() {
  const [round, setRound] = useState<DailyQ[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [history, setHistory] = useState<QuizHistoryEntry[] | null>(null);
  const recordedRef = useRef(false);
  const { pinyinOn, setPinyinOn } = usePinyinPref();
  const { play, stop } = useClipPlayer();

  const start = () => {
    recordedRef.current = false;
    setRound(buildDaily());
    setIndex(0);
    setPicked(null);
    setAnswers({});
    stop();
  };

  /* eslint-disable react-hooks/set-state-in-effect -- sample after mount */
  useEffect(() => {
    recordedRef.current = false;
    setRound(buildDaily());
    setIndex(0);
    setPicked(null);
    setAnswers({});
    setHistory(readQuizHistory("daily"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    stop();
  }, [index, stop]);

  const question = round?.[index];
  const revealed = picked !== null;
  const finished = round !== null && index >= round.length;
  const total = round?.length ?? 10;

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
        mode: "daily",
      });
      setHistory(readQuizHistory("daily"));
    }
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const attempts = history && history.length > 0 ? history.length : finished ? 1 : 0;
  const best =
    history && history.length > 0 ? Math.max(...history.map((e) => e.score)) : score;

  const promptPinyin =
    question?.kind === "written" ? beatPinyin(question.beatId) : null;

  return (
    <TrainModeShell
      title="Daily mix"
      description="Ten questions mixed from the written bank, listening, who-said-it, and tones."
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
              ? "A clean mix — every skill in one sitting."
              : score >= 6
                ? "Good session. Jump the misses, then run another mix."
                : "One skill at a time if this felt crowded — then come back to the mix."
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
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-white/40">
            <span>
              Question {index + 1} of {total}
            </span>
            <span className="uppercase tracking-widest">
              {question.kind === "written"
                ? "Written"
                : question.kind === "listening"
                  ? "Listening"
                  : question.kind === "who"
                    ? "Who said it"
                    : "Tones"}
            </span>
          </div>

          {question.kind === "written" && (
            <>
              {question.question.promptZh && (
                <p lang="zh-CN" className="mb-2 font-serif text-xl text-amber-100">
                  {question.question.promptZh}
                </p>
              )}
              {pinyinOn && promptPinyin && (
                <p className="mb-3 text-sm text-teal-200/80">{promptPinyin}</p>
              )}
              <p className="text-lg text-white md:text-xl">{question.question.prompt}</p>
              <div className="mt-5 space-y-2.5">
                {question.question.choices.map((c) => (
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
            </>
          )}

          {question.kind === "listening" && (
            <>
              <AudioPrompt
                url={chineseClip(question.item.beat.id)}
                play={play}
                label="Play Chinese line"
              />
              <p className="text-lg text-white md:text-xl">What does this line mean?</p>
              <div className="mt-5 space-y-2.5">
                {question.item.choices.map((c) => (
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
            </>
          )}

          {question.kind === "who" && (
            <>
              <AudioPrompt
                url={chineseClip(question.item.beat.id)}
                play={play}
                label="Play Chinese line"
              />
              <p className="text-lg text-white md:text-xl">Who said this?</p>
              <div className="mt-5 space-y-2.5">
                {question.item.choices.map((c) => (
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
            </>
          )}

          {question.kind === "tones" && (
            <>
              <p
                lang="zh-CN"
                className="mb-5 text-center font-serif text-5xl text-white"
              >
                {question.item.item.chinese}
              </p>
              {question.beatId && (
                <div className="mb-6 flex justify-center">
                  <PlayClipButton
                    url={chineseClip(question.beatId)}
                    play={play}
                    large
                    label="Play Chinese line"
                  />
                </div>
              )}
              <p className="text-lg text-white md:text-xl">Which tones?</p>
              <div className="mt-5 space-y-2.5">
                {question.item.choices.map((c) => (
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
            </>
          )}

          {revealed && (
            <QuizReveal
              correct={picked === question.correctId}
              beatId={question.beatId}
              onNext={handleNext}
              nextLabel={index === total - 1 ? "See score" : "Next question"}
            >
              {question.kind === "written" && (
                <>
                  <p>{question.question.why}</p>
                  {pinyinOn && promptPinyin && (
                    <p className="mt-1 text-teal-200/80">{promptPinyin}</p>
                  )}
                </>
              )}
              {question.kind === "listening" && (
                <>
                  <p lang="zh-CN" className="font-serif text-lg text-white">
                    {question.item.beat.chinese}
                  </p>
                  {pinyinOn && (
                    <p className="mt-1 text-teal-200/90">{question.item.beat.pinyin}</p>
                  )}
                </>
              )}
              {question.kind === "who" && (
                <>
                  <p lang="zh-CN" className="font-serif text-lg text-white">
                    {question.item.beat.chinese}
                  </p>
                  {pinyinOn && (
                    <p className="mt-1 text-teal-200/90">{question.item.beat.pinyin}</p>
                  )}
                  <p className="mt-1 text-white/70">{question.item.beat.english}</p>
                  <p className="mt-2 text-sm text-white/80">
                    {question.item.beat.speaker}
                  </p>
                </>
              )}
              {question.kind === "tones" && (
                <>
                  <p className="text-teal-200/90">{question.item.item.pinyin}</p>
                  <p className="mt-1 text-white/75">{question.item.item.english}</p>
                </>
              )}
            </QuizReveal>
          )}
        </article>
      ) : null}
    </TrainModeShell>
  );
}
