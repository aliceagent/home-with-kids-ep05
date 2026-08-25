"use client";

/* AGENT-DONE(R5-cloze): vocab word blanked in its episode line; pick the missing characters; history mode "cloze". */

import { chineseClip } from "@/lib/train-pool";
import { buildClozeRound } from "@/lib/curriculum-quizzes";
import { AudioPrompt, McqSession } from "@/components/train/mcq-session";

export function ClozeQuiz() {
  return (
    <McqSession
      mode="cloze"
      title="Fill the blank"
      description="A vocab word is missing from an episode line. Pick the characters that belong there."
      build={buildClozeRound}
      messages={{
        perfect: "Every blank — you know these words in their real sentences.",
        good: "Close. Jump to the line and hear the missing word.",
        retry: "Play the clip once; the blank is a word you already studied.",
      }}
      renderStem={(q, { play }) => (
        <>
          {q.beatId && (
            <AudioPrompt
              url={chineseClip(q.beatId)}
              play={play}
              label="Play Chinese line"
            />
          )}
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
