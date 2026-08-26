"use client";

/* AGENT-DONE(C2): scene order — 5 rounds of 4 consecutive dialogue beats from one chapter; tap into numbered order; full credit for exact sequence; reveal timestamps; history mode "scenes". */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import beatsData from "@/data/ep05-beats.json";
import type { Beat } from "@/types/lesson";
import { EP05_META } from "@/lib/episode-meta";
import { resolveChapters } from "@/lib/episode-chapters";
import { chineseClip, sampleBeats, shuffle } from "@/lib/train-pool";
import { pushQuizResult, readQuizHistory, type QuizHistoryEntry } from "@/lib/player-storage";
import {
  PlayClipButton,
  QuizReveal,
  QuizScoreCard,
  useClipPlayer,
  usePinyinPref,
} from "@/components/train/quiz-kit";
import { TrainModeShell } from "@/components/train/train-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ALL = beatsData as Beat[];

type SceneQ = {
  ordered: Beat[];
  pool: Beat[];
};

function sceneWindows(): Beat[][] {
  const chapters = resolveChapters(ALL);
  const windows: Beat[][] = [];
  for (const ch of chapters) {
    const dialogue = ALL.slice(ch.startIndex, ch.endIndex + 1).filter(
      (b) => b.type === "dialogue" && b.chinese.trim() && b.english?.trim(),
    );
    for (let i = 0; i + 4 <= dialogue.length; i++) {
      windows.push(dialogue.slice(i, i + 4));
    }
  }
  return windows;
}

function buildRound(): SceneQ[] {
  return sampleBeats(sceneWindows(), 5).map((ordered) => ({
    ordered,
    pool: shuffle(ordered),
  }));
}

function speakerChip(speaker: string | null) {
  const meta = EP05_META.characters.find((c) => c.name === speaker);
  return {
    name: speaker ?? "旁白",
    nameEn: meta?.nameEn ?? "",
    color: meta?.color ?? "bg-white/50",
  };
}

export function ScenesQuiz() {
  const [round, setRound] = useState<SceneQ[] | null>(null);
  const [index, setIndex] = useState(0);
  const [pool, setPool] = useState<Beat[]>([]);
  const [picked, setPicked] = useState<Beat[]>([]);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [history, setHistory] = useState<QuizHistoryEntry[] | null>(null);
  const recordedRef = useRef(false);
  const { pinyinOn, setPinyinOn } = usePinyinPref();
  const { play, stop } = useClipPlayer();

  const load = (next: SceneQ[]) => {
    recordedRef.current = false;
    setRound(next);
    setIndex(0);
    setPool(next[0]?.pool ?? []);
    setPicked([]);
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
    setPool(next[0]?.pool ?? []);
    setPicked([]);
    setChecked(false);
    setAnswers({});
    setHistory(readQuizHistory("scenes"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    stop();
  }, [index, stop]);

  const question = round?.[index];
  const finished = round !== null && index >= round.length;
  const total = round?.length ?? 5;
  const complete = picked.length === 4;
  const correct =
    checked &&
    question !== undefined &&
    picked.length === 4 &&
    picked.every((b, i) => b.id === question.ordered[i].id);

  const score = Object.values(answers).filter(Boolean).length;
  const attempts = history && history.length > 0 ? history.length : finished ? 1 : 0;
  const best =
    history && history.length > 0 ? Math.max(...history.map((e) => e.score)) : score;

  const pickCard = (beat: Beat) => {
    if (checked) return;
    setPool((p) => p.filter((b) => b.id !== beat.id));
    setPicked((a) => [...a, beat]);
  };

  const undoCard = (beat: Beat) => {
    if (checked) return;
    setPicked((a) => a.filter((b) => b.id !== beat.id));
    setPool((p) => [...p, beat]);
  };

  const handleCheck = () => {
    if (!question || !complete || checked) return;
    const ok = picked.every((b, i) => b.id === question.ordered[i].id);
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
        mode: "scenes",
      });
      setHistory(readQuizHistory("scenes"));
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setChecked(false);
    setPicked([]);
    setPool(round[nextIndex]?.pool ?? []);
  };

  const renderCard = (beat: Beat, opts: { number?: number; onActivate: () => void }) => {
    const speaker = speakerChip(beat.speaker);
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3",
          checked && opts.number != null && beat.id === question?.ordered[opts.number - 1]?.id
            ? "border-emerald-400/40 bg-emerald-500/10"
            : checked && opts.number != null
              ? "border-rose-400/40 bg-rose-500/10"
              : "",
        )}
      >
        {opts.number != null && (
          <span className="mt-1 w-5 font-mono text-xs text-white/40">{opts.number}</span>
        )}
        <PlayClipButton
          url={chineseClip(beat.id)}
          play={play}
          label={`Play line by ${speaker.name}`}
          caption="Play"
        />
        <button
          type="button"
          onClick={opts.onActivate}
          disabled={checked}
          className="min-w-0 flex-1 text-left disabled:cursor-default"
        >
          <p className="inline-flex items-center gap-2 text-xs text-white/50">
            <span className={`size-2 rounded-full ${speaker.color}`} />
            <span lang="zh-CN">{speaker.name}</span>
            {speaker.nameEn && <span>{speaker.nameEn}</span>}
          </p>
          <p lang="zh-CN" className="mt-1 font-serif text-base text-white">
            {beat.chinese}
          </p>
          {pinyinOn && <p className="mt-0.5 text-xs text-teal-200/80">{beat.pinyin}</p>}
          {pinyinOn && <p className="mt-0.5 text-xs text-white/45">{beat.english}</p>}
        </button>
      </div>
    );
  };

  return (
    <TrainModeShell
      title="Scene order"
      description="Four lines from one scene, shuffled. Tap them in the order they were spoken."
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
              ? "Every scene in order — you can hear the conversation turn."
              : score >= 3
                ? "Close. The reveal timestamps show where the line sat."
                : "Listen to each clip before you lock the column."
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
            Round {index + 1} of {total}
          </div>

          <p className="mb-2 text-xs uppercase tracking-widest text-white/40">
            Spoken order
          </p>
          <div className="mb-6 space-y-2">
            {picked.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/15 px-3 py-4 text-sm text-white/35">
                Tap a line below to place it first.
              </p>
            )}
            {picked.map((beat, i) => (
              <div key={beat.id}>
                {renderCard(beat, { number: i + 1, onActivate: () => undoCard(beat) })}
              </div>
            ))}
          </div>

          {pool.length > 0 && (
            <>
              <p className="mb-2 text-xs uppercase tracking-widest text-white/40">
                Lines
              </p>
              <div className="space-y-2">
                {pool.map((beat) => (
                  <div key={beat.id}>
                    {renderCard(beat, { onActivate: () => pickCard(beat) })}
                  </div>
                ))}
              </div>
            </>
          )}

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
              beatId={question.ordered[0]?.id}
              onNext={handleNext}
              nextLabel={index === total - 1 ? "See score" : "Next scene"}
            >
              <ol className="space-y-2">
                {question.ordered.map((beat, i) => (
                  <li key={beat.id} className="text-sm">
                    <span className="mr-2 font-mono text-[10px] text-white/40">
                      {i + 1}. {beat.timestamp}
                    </span>
                    <span lang="zh-CN" className="font-serif text-white">
                      {beat.chinese}
                    </span>
                  </li>
                ))}
              </ol>
            </QuizReveal>
          )}
        </article>
      ) : null}
    </TrainModeShell>
  );
}
