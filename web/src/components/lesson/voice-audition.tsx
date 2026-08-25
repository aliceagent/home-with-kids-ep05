"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AUDITION_CAST, type CharacterVoice } from "@/lib/voices";
import { Button } from "@/components/ui/button";
import { Pause, Play, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

function AuditionCard({
  voice,
  playingId,
  onPlay,
}: {
  voice: CharacterVoice;
  playingId: string | null;
  onPlay: (id: string, src: string) => void;
}) {
  const isPlaying = playingId === voice.id;

  return (
    <article
      className={cn(
        "rounded-2xl border p-5 transition-colors md:p-6",
        voice.accentColor,
        isPlaying && "ring-2 ring-amber-400/60",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            {voice.role}
          </p>
          <h2 className="mt-1 font-serif text-3xl text-white md:text-4xl">
            {voice.name}
          </h2>
          <p className="mt-0.5 text-lg text-white/70">{voice.nameEn}</p>
        </div>
        <Button
          size="lg"
          onClick={() => onPlay(voice.id, voice.audition)}
          className={cn(
            "gap-2 shrink-0",
            isPlaying
              ? "bg-amber-500 text-stone-950 hover:bg-amber-400"
              : "bg-white/10 text-white hover:bg-white/20",
          )}
        >
          {isPlaying ? (
            <>
              <Pause className="size-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="size-4 fill-current" />
              Play 30s
            </>
          )}
        </Button>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white/75 md:text-base">
        {voice.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/50">
        <span className="rounded-full border border-white/15 px-2.5 py-0.5">
          {voice.gender === "female" ? "Female" : "Male"}
        </span>
        <span className="rounded-full border border-white/15 px-2.5 py-0.5">
          {voice.age === "young" ? "Young" : "Adult"}
        </span>
        <span className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono">
          voice: {voice.voiceId}
        </span>
        <span className="rounded-full border border-white/15 px-2.5 py-0.5">
          ~30 sec sample
        </span>
      </div>
    </article>
  );
}

export function VoiceAudition() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  const handlePlay = (id: string, src: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    audio.pause();
    audio.src = src;
    audio.currentTime = 0;
    setPlayingId(id);
    audio.play().catch(() => setPlayingId(null));
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to episode
        </Link>

        <header className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-400/90">
            Home With Kids · EP5
          </p>
          <h1 className="mt-2 font-serif text-4xl text-white md:text-5xl">
            Voice audition
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
            Thirty-second samples of each character voice used in the player —
            real dialogue lines from 猫鼠之争, spoken with the cast’s assigned
            xAI TTS voices.
          </p>
        </header>

        <div className="space-y-4">
          {AUDITION_CAST.map((voice) => (
            <AuditionCard
              key={voice.id}
              voice={voice}
              playingId={playingId}
              onPlay={handlePlay}
            />
          ))}
        </div>
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingId(null)} preload="none" />
    </div>
  );
}
