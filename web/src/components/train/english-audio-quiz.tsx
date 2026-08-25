"use client";

/* AGENT-DONE(R5-english-audio): tap plays english mp3, pick the matching Chinese line; history mode "english-audio". */

import { buildBeatMcqRound, englishClip, type BeatMcq } from "@/lib/train-pool";
import { AudioPrompt, McqSession } from "@/components/train/mcq-session";

function build(): BeatMcq[] {
  return buildBeatMcqRound(8, "chinese").map((q) => ({
    ...q,
    choices: q.choices.map((c) => ({ ...c, lang: "zh-CN" })),
  }));
}

export function EnglishAudioQuiz() {
  return (
    <McqSession
      mode="english-audio"
      title="English audio"
      description="Hear the English dub of a line, then pick the Chinese. Eight questions a round."
      build={build}
      messages={{
        perfect: "Every clip — you can hold both languages at once.",
        good: "Close. Jump to the line and read it while it plays.",
        retry: "Play the English twice, then look for the verbs in the Chinese.",
      }}
      renderStem={(q, { play }) => (
        <>
          <AudioPrompt
            url={englishClip(q.beat.id)}
            play={play}
            label="Play English line"
            caption="Tap to play the English — you can replay"
          />
          <p className="text-lg text-white md:text-xl">Which Chinese line is this?</p>
        </>
      )}
      renderReveal={(q, { pinyinOn }) => (
        <>
          <p lang="zh-CN" className="font-serif text-lg text-white">
            {q.beat.chinese}
          </p>
          {pinyinOn && <p className="mt-1 text-teal-200/90">{q.beat.pinyin}</p>}
          <p className="mt-1 text-white/70">{q.beat.english}</p>
        </>
      )}
    />
  );
}
