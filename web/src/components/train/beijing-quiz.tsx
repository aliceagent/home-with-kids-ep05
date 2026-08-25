"use client";

/* AGENT-DONE(R5-beijing): dialogue lines that carry a Beijing note; pick the standard Mandarin equivalent; history mode "beijing". */

import { chineseClip } from "@/lib/train-pool";
import { buildBeijingRound } from "@/lib/curriculum-quizzes";
import { AudioPrompt, McqSession } from "@/components/train/mcq-session";

export function BeijingQuiz() {
  return (
    <McqSession
      mode="beijing"
      title="Beijing speech"
      description="Hear a northern line and pick the standard Mandarin equivalent of the local word."
      build={buildBeijingRound}
      messages={{
        perfect: "Every 耗子 and 咱 — you can hear the register switch.",
        good: "Solid. The jump link shows the line in context.",
        retry: "Play the clip and listen for the casual word, not the textbook one.",
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
            <p lang="zh-CN" className="mt-3 font-serif text-xl text-amber-100">
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
