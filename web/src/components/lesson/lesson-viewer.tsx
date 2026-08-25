"use client";

import { useState } from "react";
import beatsData from "@/data/ep05-beats.json";
import { SmartPlayer } from "@/components/lesson/smart-player";
import { DEFAULT_DISPLAY, type Beat, type DisplaySettings } from "@/types/lesson";
import { EP05_META } from "@/lib/episode-meta";

const beats = beatsData as Beat[];

const PRESETS: Record<string, DisplaySettings> = {
  full: { ...DEFAULT_DISPLAY },
  immersion: {
    ...DEFAULT_DISPLAY,
    english: false,
    pinyin: false,
    grammar: false,
    vocab: false,
    idiom: false,
    notes: false,
    beijing: false,
    culture: false,
    decks: false,
    drills: false,
    registerRewrite: false,
    breakdown: false,
    audioChinese: true,
    audioEnglish: false,
    audioPinyin: false,
    audioNarrator: false,
  },
  reading: {
    ...DEFAULT_DISPLAY,
    english: false,
    grammar: false,
    vocab: false,
    idiom: false,
    notes: false,
    beijing: true,
    culture: false,
    decks: false,
    drills: false,
    registerRewrite: true,
    breakdown: false,
    audioChinese: true,
    audioEnglish: false,
    audioPinyin: true,
    audioNarrator: true,
  },
  minimal: {
    ...DEFAULT_DISPLAY,
    english: false,
    pinyin: false,
    grammar: false,
    vocab: false,
    idiom: false,
    notes: false,
    beijing: false,
    culture: false,
    decks: false,
    drills: false,
    registerRewrite: false,
    breakdown: false,
    speaker: false,
    timestamp: false,
    audioChinese: true,
    audioEnglish: false,
    audioPinyin: false,
    audioNarrator: false,
  },
};

const dialogueCount = beats.filter((b) => b.type === "dialogue").length;
const lastBeat = beats[beats.length - 1];

export function LessonViewer() {
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_DISPLAY);

  const updateSetting = (key: keyof DisplaySettings, value: boolean) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const applyPreset = (preset: keyof typeof PRESETS) => {
    setSettings(PRESETS[preset]);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-stone-950 text-white">
      <header className="shrink-0 border-b border-white/10 px-4 py-1.5 md:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            {EP05_META.series} · EP{EP05_META.episode}
          </p>
          <div className="flex items-center gap-4">
            <a
              href="/quiz"
              className="text-xs text-amber-400/80 transition hover:text-amber-300"
            >
              Exit quiz
            </a>
            <a
              href="/study"
              className="text-xs text-amber-400/80 transition hover:text-amber-300"
            >
              Study guide
            </a>
            <a
              href="/audition"
              className="text-xs text-amber-400/80 transition hover:text-amber-300"
            >
              Voice audition
            </a>
            <p className="hidden text-xs text-white/30 sm:block">
              {dialogueCount} lines · 0:02–{lastBeat?.timestamp ?? "13:12"}
            </p>
          </div>
        </div>
      </header>

      <SmartPlayer
        beats={beats}
        settings={settings}
        onSettingsChange={updateSetting}
        onPreset={applyPreset}
      />
    </div>
  );
}
