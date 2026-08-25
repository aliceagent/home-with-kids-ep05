"use client";

/* AGENT-DONE(R5-culture): culture cards as meaning + fact questions; history mode "culture". */

import { buildCultureRound } from "@/lib/curriculum-quizzes";
import { McqSession } from "@/components/train/mcq-session";

export function CultureQuiz() {
  return (
    <McqSession
      mode="culture"
      title="Culture notes"
      description="阿姨, F4, 大片, and 作文 — the sidebars that make this episode land. Eight questions."
      build={buildCultureRound}
      messages={{
        perfect: "Every note — you know why she says 阿姨, not 妈.",
        good: "Close. The reveal is the rest of the sidebar.",
        retry: "These are the four culture cards from the study pause.",
      }}
      renderStem={(q) => (
        <>
          <p className="text-lg text-white md:text-xl">{q.prompt}</p>
          {q.promptZh && (
            <p lang="zh-CN" className="mt-3 font-serif text-3xl text-amber-100">
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
