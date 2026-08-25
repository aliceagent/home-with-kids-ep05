"use client";

/* AGENT-DONE(R5-pinyin): pinyin prompt, four Chinese lines; pinyin IS the question so the toggle is hidden; history mode "pinyin". */

import { buildBeatMcqRound, type BeatMcq } from "@/lib/train-pool";
import { McqSession } from "@/components/train/mcq-session";

function build(): BeatMcq[] {
  return buildBeatMcqRound(8, "chinese").map((q) => ({
    ...q,
    choices: q.choices.map((c) => ({ ...c, lang: "zh-CN" })),
  }));
}

export function PinyinQuiz() {
  return (
    <McqSession
      mode="pinyin"
      title="Pinyin → Chinese"
      description="Read the pinyin, then pick the characters. Eight questions a round."
      showPinyinToggle={false}
      build={build}
      messages={{
        perfect: "Every reading — the marks are mapping onto the characters.",
        good: "Close. Read the line once more from the jump link.",
        retry: "Say the pinyin out loud before you pick — the tones split lookalikes.",
      }}
      renderStem={(q) => (
        <>
          <p className="text-lg text-white md:text-xl">Which characters are these?</p>
          <p className="mt-3 font-serif text-2xl text-teal-100">{q.beat.pinyin}</p>
        </>
      )}
      renderReveal={(q) => (
        <>
          <p lang="zh-CN" className="font-serif text-lg text-white">
            {q.beat.chinese}
          </p>
          <p className="mt-1 text-white/70">{q.beat.english}</p>
        </>
      )}
    />
  );
}
