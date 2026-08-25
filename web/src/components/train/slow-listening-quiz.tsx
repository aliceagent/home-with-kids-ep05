"use client";

/* AGENT-DONE(R5-slow): tap plays the slow pinyin-pace clip, pick the English meaning; history mode "slow". */

import { buildBeatMcqRound, pinyinClip, type BeatMcq } from "@/lib/train-pool";
import { AudioPrompt, McqSession } from "@/components/train/mcq-session";

function build(): BeatMcq[] {
  return buildBeatMcqRound(8, "english");
}

export function SlowListeningQuiz() {
  return (
    <McqSession
      mode="slow"
      title="Slow Chinese"
      description="Hear the line at pinyin pace, then pick what it means. Eight questions a round."
      build={build}
      messages={{
        perfect: "Every slow line — the extra space is working.",
        good: "Solid. Try the regular listening mode next.",
        retry: "Let the clip finish once before you pick.",
      }}
      renderStem={(q, { play }) => (
        <>
          <AudioPrompt
            url={pinyinClip(q.beat.id)}
            play={play}
            label="Play slow Chinese line"
            caption="Tap to play the slow reading — you can replay"
          />
          <p className="text-lg text-white md:text-xl">What does this line mean?</p>
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
