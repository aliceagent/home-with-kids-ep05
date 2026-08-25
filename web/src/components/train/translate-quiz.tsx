"use client";

/* AGENT-DONE(R5-translate): English prompt, four Chinese lines from similar-length dialogue; history mode "translate". */

import { buildBeatMcqRound, type BeatMcq } from "@/lib/train-pool";
import { McqSession } from "@/components/train/mcq-session";

function build(): BeatMcq[] {
  return buildBeatMcqRound(8, "chinese").map((q) => ({
    ...q,
    choices: q.choices.map((c) => ({ ...c, lang: "zh-CN" })),
  }));
}

export function TranslateQuiz() {
  return (
    <McqSession
      mode="translate"
      title="English → Chinese"
      description="Read the English, then pick the matching line from the episode. Eight questions a round."
      build={build}
      messages={{
        perfect: "Every line — you can see the Chinese as soon as you hear the English.",
        good: "Solid. Jump to the misses and read them in the show.",
        retry: "Cover the English and try matching the shape of the Chinese first.",
      }}
      renderStem={(q) => (
        <>
          <p className="text-lg text-white md:text-xl">Which line matches this?</p>
          <p className="mt-3 text-white/85">{q.beat.english}</p>
        </>
      )}
      renderReveal={(q, { pinyinOn }) => (
        <>
          <p lang="zh-CN" className="font-serif text-lg text-white">
            {q.beat.chinese}
          </p>
          {pinyinOn && <p className="mt-1 text-teal-200/90">{q.beat.pinyin}</p>}
        </>
      )}
    />
  );
}
