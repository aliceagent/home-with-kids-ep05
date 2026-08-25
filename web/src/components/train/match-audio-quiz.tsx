"use client";

/* AGENT-DONE(Q2): 8-question match-audio; written English/Chinese (pinyin if on); three tap-to-play clips A/B/C with one match; reveal prints all three Chinese lines; history mode "match-audio". */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Beat } from "@/types/lesson";
import {
  chineseClip,
  quizableDialogue,
  sampleBeats,
  shuffle,
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
import { cn } from "@/lib/utils";

const CLIP_IDS = ["a", "b", "c"] as const;

type MatchQ = {
  beat: Beat;
  clips: { id: (typeof CLIP_IDS)[number]; beat: Beat }[];
  correctId: string;
};

function buildRound(): MatchQ[] {
  const pool = quizableDialogue();
  return sampleBeats(pool, 8).map((beat) => {
    const decoys = similarBeats(pool, beat, 2);
    while (decoys.length < 2) {
      const extra = pool.find(
        (b) => b.id !== beat.id && !decoys.some((d) => d.id === b.id),
      );
      if (!extra) break;
      decoys.push(extra);
    }
    const clips = shuffle([beat, ...decoys.slice(0, 2)]).map((b, i) => ({
      id: CLIP_IDS[i],
      beat: b,
    }));
    return {
      beat,
      clips,
      correctId: clips.find((c) => c.beat.id === beat.id)?.id ?? "a",
    };
  });
}

export function MatchAudioQuiz() {
  const [round, setRound] = useState<MatchQ[] | null>(null);
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
    setHistory(readQuizHistory("match-audio"));
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
        mode: "match-audio",
      });
      setHistory(readQuizHistory("match-audio"));
    }
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const attempts = history && history.length > 0 ? history.length : finished ? 1 : 0;
  const best =
    history && history.length > 0 ? Math.max(...history.map((e) => e.score)) : score;

  return (
    <TrainModeShell
      title="Match the audio"
      description="Read the line, then pick which of the three clips is the one from the episode."
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
              ? "All eight — you can hear the household from the page."
              : score >= 5
                ? "Good ear. The reveal prints every clip so the misses still teach."
                : "Replay A, B, and C before you lock in — they are meant to be close."
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
          <div className="mb-4 text-xs text-white/40">
            Question {index + 1} of {total}
          </div>
          <p className="text-lg text-white md:text-xl">{question.beat.english}</p>
          <p lang="zh-CN" className="mt-2 font-serif text-xl text-amber-100">
            {question.beat.chinese}
          </p>
          {pinyinOn && (
            <p className="mt-1 text-sm text-teal-200/90">{question.beat.pinyin}</p>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {question.clips.map((clip) => (
              <div key={clip.id} className="flex flex-col items-center gap-2">
                <PlayClipButton
                  url={chineseClip(clip.beat.id)}
                  play={play}
                  label={`Play clip ${clip.id.toUpperCase()}`}
                  caption={clip.id.toUpperCase()}
                />
                <span className="font-mono text-[10px] text-white/40">
                  Clip {clip.id.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-white/55">Which clip matches this line?</p>
          <div className="mt-3 space-y-2.5">
            {question.clips.map((clip) => (
              <QuizChoiceButton
                key={clip.id}
                id={clip.id}
                label={`Clip ${clip.id.toUpperCase()}`}
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
              <ul className="space-y-2">
                {question.clips.map((clip) => (
                  <li
                    key={clip.id}
                    className={cn(
                      "rounded-lg border px-3 py-2",
                      clip.id === question.correctId
                        ? "border-emerald-400/40 bg-emerald-500/10"
                        : "border-white/10",
                    )}
                  >
                    <span className="mr-2 font-mono text-[10px] text-white/40">
                      {clip.id.toUpperCase()}
                      {clip.id === question.correctId ? " · match" : ""}
                    </span>
                    <span lang="zh-CN" className="font-serif text-white">
                      {clip.beat.chinese}
                    </span>
                  </li>
                ))}
              </ul>
            </QuizReveal>
          )}
        </article>
      ) : null}
    </TrainModeShell>
  );
}
