"use client";

/* AGENT-DONE(R5-idioms): episode 成语/set phrases; pick the meaning among literal and sibling traps; history mode "idioms". */

import { buildIdiomRound } from "@/lib/curriculum-quizzes";
import { McqSession } from "@/components/train/mcq-session";

export function IdiomsQuiz() {
  return (
    <McqSession
      mode="idioms"
      title="Idioms"
      description="Episode 成语 and set phrases. Watch the literal traps. One pass through the deck."
      build={buildIdiomRound}
      messages={{
        perfect: "Every idiom — you didn't fall for the surface reading.",
        good: "Good. Read the trap notes on the misses.",
        retry: "The literal is usually the distractor. Try again.",
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
