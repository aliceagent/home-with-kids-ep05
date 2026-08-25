"use client";

import { useEffect, useRef, useState } from "react";
import beatsData from "@/data/ep05-beats.json";
import { SmartPlayer } from "@/components/lesson/smart-player";
import { DEFAULT_DISPLAY, type Beat, type DisplaySettings } from "@/types/lesson";
import { EP05_META } from "@/lib/episode-meta";
import { SETTINGS_KEY, readStored, writeStored } from "@/lib/player-storage";

const beats = beatsData as Beat[];

export type PresetMode = "full" | "immersion" | "listen" | "reading" | "minimal";

const PRESETS: Record<PresetMode, DisplaySettings> = {
  full: { ...DEFAULT_DISPLAY },
  /** Each line spoken in Chinese, then its English translation */
  listen: {
    ...DEFAULT_DISPLAY,
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
    audioEnglish: true,
    audioPinyin: false,
    audioNarrator: false,
  },
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

/**
 * Which preset (if any) the current settings match exactly — every key equal
 * to that preset's value. "custom" once the learner has hand-tweaked a toggle.
 */
export function detectActiveMode(settings: DisplaySettings): PresetMode | "custom" {
  for (const [id, preset] of Object.entries(PRESETS) as [PresetMode, DisplaySettings][]) {
    const keys = Object.keys(preset) as (keyof DisplaySettings)[];
    if (keys.every((key) => settings[key] === preset[key])) return id;
  }
  return "custom";
}

export function LessonViewer() {
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_DISPLAY);
  /** Skips the first write so a fresh mount cannot clobber the saved settings */
  const settingsSavedRef = useRef(false);

  /**
   * Restore saved toggles. Storage can only be read after mount — the page is
   * statically prerendered — and unknown keys are merged over the defaults so
   * an older stored blob still gets any newly added toggle.
   */
  /* eslint-disable react-hooks/set-state-in-effect -- restoring persisted state
     is only hydration-safe after mount */
  useEffect(() => {
    const saved = readStored<Partial<DisplaySettings>>(SETTINGS_KEY);
    if (saved) setSettings((s) => ({ ...s, ...saved }));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!settingsSavedRef.current) {
      settingsSavedRef.current = true;
      return;
    }
    writeStored(SETTINGS_KEY, settings);
  }, [settings]);

  const updateSetting = (key: keyof DisplaySettings, value: boolean) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const applyPreset = (preset: PresetMode) => {
    setSettings(PRESETS[preset]);
  };

  const activeMode = detectActiveMode(settings);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-stone-950 text-white">
      <header className="shrink-0 border-b border-white/10 px-4 py-1.5 md:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            <span lang="zh-CN">{EP05_META.series}</span> · EP{EP05_META.episode}
          </p>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 sm:flex">
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
              {/* AGENT-TASK(R1) — remove this audition link; per task T3 a
                  /train link may take its place. AGENT-DONE(R1) when done. */}
              <a
                href="/audition"
                className="text-xs text-amber-400/80 transition hover:text-amber-300"
              >
                Voice audition
              </a>
            </div>
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
        activeMode={activeMode}
      />
    </div>
  );
}
