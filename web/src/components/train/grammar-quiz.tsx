"use client";

/* AGENT-DONE(R5-grammar): grammar-step examples; pick the matching pattern; history mode "grammar". */

import { buildGrammarRound } from "@/lib/curriculum-quizzes";
import { McqSession } from "@/components/train/mcq-session";

export function GrammarQuiz() {
  return (
    <McqSession
      mode="grammar"
      title="Grammar"
      description="A worked example from the episode — pick the pattern it is using."
      build={buildGrammarRound}
      messages={{
        perfect: "Every pattern — 比 and 比较 are staying in their lanes.",
        good: "Close. Jump to the line and read the card again.",
        retry: "Look at the example first, then the four patterns.",
      }}
      renderStem={(q) => (
        <>
          <p className="text-lg text-white md:text-xl">{q.prompt}</p>
          {q.promptZh && (
            <p lang="zh-CN" className="mt-3 font-serif text-2xl text-amber-100">
              {q.promptZh}
            </p>
          )}
        </>
      )}
      renderReveal={(q, { pinyinOn }) => (
        <>
          {pinyinOn && q.pinyin && (
            <p className="text-teal-200/90">{q.pinyin}</p>
          )}
          {q.english && <p className="mt-1 text-white/85">{q.english}</p>}
          {q.note && <p className="mt-2 text-sm text-white/55">{q.note}</p>}
        </>
      )}
    />
  );
}
