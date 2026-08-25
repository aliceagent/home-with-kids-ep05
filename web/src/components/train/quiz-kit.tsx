"use client";

/* AGENT-DONE(T2): shared pinyin pref/toggle, choice/reveal/score UI, and tap-to-play clip helper. History entries now carry mode (legacy rows count as "quiz"). */

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { readPinyinPref, writePinyinPref } from "@/lib/train-storage";
import { ArrowRight, Check, RotateCcw, Volume2, X } from "lucide-react";

export function usePinyinPref() {
  const [pinyinOn, setPinyinOnState] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect -- pref is client-only; default ON matches prerender */
  useEffect(() => {
    setPinyinOnState(readPinyinPref());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setPinyinOn = (on: boolean) => {
    setPinyinOnState(on);
    writePinyinPref(on);
  };

  return { pinyinOn, setPinyinOn };
}

export function PinyinToggle({
  pinyinOn,
  onChange,
  className,
}: {
  pinyinOn: boolean;
  onChange: (on: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!pinyinOn)}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[10px] font-medium transition",
        pinyinOn
          ? "border-amber-400/60 bg-amber-500/20 text-amber-100"
          : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
        className,
      )}
      aria-pressed={pinyinOn}
    >
      Pinyin {pinyinOn ? "on" : "off"}
    </button>
  );
}

export function QuizChoiceButton({
  id,
  label,
  picked,
  revealed,
  correctId,
  onPick,
  lang,
}: {
  id: string;
  label: ReactNode;
  picked: string | null;
  revealed: boolean;
  correctId: string;
  onPick: (id: string) => void;
  lang?: string;
}) {
  const isCorrect = id === correctId;
  const isPicked = picked === id;

  return (
    <button
      type="button"
      disabled={revealed}
      onClick={() => onPick(id)}
      lang={lang}
      className={cn(
        "w-full rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition",
        !revealed && "border-white/15 bg-white/5 hover:bg-white/10",
        revealed && isCorrect && "border-emerald-400/60 bg-emerald-500/15 text-emerald-50",
        revealed && isPicked && !isCorrect && "border-rose-400/60 bg-rose-500/15 text-rose-50",
        revealed && !isPicked && !isCorrect && "border-white/10 bg-white/[0.03] text-white/50",
      )}
    >
      <span className="mr-2 font-mono text-xs text-white/40">{id.toUpperCase()}.</span>
      {label}
    </button>
  );
}

export function QuizReveal({
  correct,
  children,
  beatId,
  onNext,
  nextLabel,
}: {
  correct: boolean;
  children: ReactNode;
  beatId?: string;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
        {correct ? (
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
      <div className="mt-2 text-sm leading-relaxed text-white/75">{children}</div>
      {beatId && (
        <Link
          href={`/?beat=${beatId}`}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-400/80 transition hover:text-amber-300"
        >
          Jump to this line
          <ArrowRight className="size-3" />
        </Link>
      )}
      <div>
        <Button
          onClick={onNext}
          className="mt-4 bg-amber-600 text-white hover:bg-amber-500"
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}

export function QuizScoreCard({
  score,
  total,
  best,
  attempts,
  message,
  onRetry,
  extra,
}: {
  score: number;
  total: number;
  best: number;
  attempts: number;
  message: string;
  onRetry: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 md:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300/80">
        Score
      </p>
      <p className="mt-2 font-serif text-5xl text-white">
        {score}
        <span className="text-2xl text-white/50"> / {total}</span>
      </p>
      <p className="mt-2 text-sm text-white/55">
        Best so far: {best}/{total}
        <span className="text-white/35">
          {" "}
          · {attempts} {attempts === 1 ? "attempt" : "attempts"}
        </span>
      </p>
      <p className="mt-3 text-sm text-white/70">{message}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          onClick={onRetry}
          className="gap-2 bg-amber-600 text-white hover:bg-amber-500"
        >
          <RotateCcw className="size-4" />
          Try again
        </Button>
        {extra}
      </div>
    </div>
  );
}

/** Play a clip only in response to a tap. Stops on unmount and when `play` is called again. */
export function useClipPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = () => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.removeAttribute("src");
    try {
      el.load();
    } catch {
      /* ignore */
    }
    audioRef.current = null;
  };

  const play = (url: string) => {
    stop();
    const el = new Audio(url);
    audioRef.current = el;
    el.play().catch(() => {
      /* autoplay blocked — caller is a click handler so this should be rare */
    });
  };

  useEffect(() => stop, []);

  return { play, stop };
}

export function PlayClipButton({
  url,
  label = "Play",
  large = false,
  playingHint,
}: {
  url: string;
  label?: string;
  large?: boolean;
  playingHint?: string;
}) {
  const { play } = useClipPlayer();
  return (
    <button
      type="button"
      onClick={() => play(url)}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/50 bg-amber-600 font-semibold text-white shadow-lg shadow-amber-950/30 transition hover:bg-amber-500",
        large ? "size-20 text-sm" : "px-4 py-2 text-sm",
      )}
    >
      <Volume2 className={large ? "size-7" : "size-4"} />
      {!large && <span>{playingHint ?? label}</span>}
    </button>
  );
}
