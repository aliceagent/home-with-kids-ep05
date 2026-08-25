"use client";

/* AGENT-DONE(R5-listen-pinyin): tap plays chinese mp3, pick the matching full-line pinyin; history mode "listen-pinyin". */

import { buildBeatMcqRound, chineseClip, type BeatMcq } from "@/lib/train-pool";
import { AudioPrompt, McqSession } from "@/components/train/mcq-session";

function build(): BeatMcq[] {
  return buildBeatMcqRound(8, "pinyin");
}

export function ListenPinyinQuiz() {
  return (
    <McqSession
      mode="listen-pinyin"
      title="Listen for pinyin"
      description="Hear the line in Chinese, then pick its pinyin. Eight questions a round."
      showPinyinToggle={false}
      build={build}
      messages={{
        perfect: "Every syllable — you are hearing the marks.",
        good: "Good ear. Replay the misses before you try again.",
        retry: "Play it twice and listen for the first toned vowel.",
      }}
      renderStem={(q, { play }) => (
        <>
          <AudioPrompt url={chineseClip(q.beat.id)} play={play} label="Play Chinese line" />
          <p className="text-lg text-white md:text-xl">Which pinyin is this line?</p>
        </>
      )}
      renderReveal={(q) => (
        <>
          <p lang="zh-CN" className="font-serif text-lg text-white">
            {q.beat.chinese}
          </p>
          <p className="mt-1 text-teal-200/90">{q.beat.pinyin}</p>
          <p className="mt-1 text-white/70">{q.beat.english}</p>
        </>
      )}
    />
  );
}
