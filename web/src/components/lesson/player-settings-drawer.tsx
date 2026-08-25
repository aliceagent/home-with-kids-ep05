"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DISPLAY_LABELS, type DisplaySettings } from "@/types/lesson";
import type { PresetMode } from "@/components/lesson/lesson-viewer";
import { TEXT_SIZES, type TextSize } from "@/lib/player-storage";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerSettingsDrawerProps {
  open: boolean;
  settings: DisplaySettings;
  onSettingChange: (key: keyof DisplaySettings, value: boolean) => void;
  onPreset: (preset: PresetMode) => void;
  /** Which preset the current settings match, if any */
  activeMode: PresetMode | "custom";
  textSize: TextSize;
  onTextSizeChange: (size: TextSize) => void;
  onClose: () => void;
}

const TEXT_SIZE_LABELS: Record<TextSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

const PRESETS = [
  { id: "immersion" as const, label: "Uninterrupted story" },
  { id: "listen" as const, label: "Chinese → English" },
  { id: "full" as const, label: "All teaching pauses" },
  { id: "reading" as const, label: "Reading" },
  { id: "minimal" as const, label: "Chinese only" },
];

const TOGGLE_GROUPS: { label: string; keys: (keyof DisplaySettings)[] }[] = [
  {
    label: "Story interruptions — off = skip",
    keys: [
      "grammar",
      "idiom",
      "vocab",
      "decks",
      "notes",
      "beijing",
      "culture",
      "drills",
    ],
  },
  {
    label: "Subtitles",
    keys: [
      "chinese",
      "pinyin",
      "english",
      "speaker",
      "timestamp",
      "registerRewrite",
      "breakdown",
    ],
  },
  {
    label: "Audio",
    keys: [
      "audioChinese",
      "audioPinyin",
      "audioEnglish",
      "audioNarrator",
      "shadowing",
    ],
  },
];

function SettingRow({
  settingKey,
  on,
  onSettingChange,
}: {
  settingKey: keyof DisplaySettings;
  on: boolean;
  onSettingChange: (key: keyof DisplaySettings, value: boolean) => void;
}) {
  const id = `player-toggle-${settingKey}`;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 transition-colors",
        on
          ? "border-emerald-400/40 bg-emerald-500/15"
          : "border-white/10 bg-black/30",
      )}
    >
      <Label
        htmlFor={id}
        className={cn(
          "cursor-pointer text-xs font-medium leading-snug",
          on ? "text-white" : "text-white/45",
        )}
      >
        {DISPLAY_LABELS[settingKey]}
      </Label>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            "w-7 text-right font-mono text-[10px] font-bold uppercase tracking-wide",
            on ? "text-emerald-300" : "text-white/35",
          )}
        >
          {on ? "On" : "Off"}
        </span>
        <Switch
          id={id}
          checked={on}
          onCheckedChange={(v) => onSettingChange(settingKey, v)}
          className={cn(
            "border-2 shadow-none",
            "data-checked:bg-emerald-500 data-checked:border-emerald-200",
            "data-unchecked:bg-stone-700 data-unchecked:border-stone-500",
            "[&_[data-slot=switch-thumb]]:bg-white [&_[data-slot=switch-thumb]]:dark:bg-white",
          )}
        />
      </div>
    </div>
  );
}

export function PlayerSettingsDrawer({
  open,
  settings,
  onSettingChange,
  onPreset,
  activeMode,
  textSize,
  onTextSizeChange,
  onClose,
}: PlayerSettingsDrawerProps) {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-[60] flex items-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-settings-title"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close settings"
        onClick={onClose}
      />

      <Card
        id="player-settings-panel"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 max-h-[82%] w-full gap-0 overflow-hidden rounded-t-2xl rounded-b-none bg-stone-900 py-0 text-white ring-white/15",
          "motion-safe:animate-in motion-safe:slide-in-from-bottom-6 motion-safe:fade-in motion-safe:duration-300",
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-5">
          <div>
            <CardTitle id="player-settings-title" className="text-white">
              Playback settings
            </CardTitle>
            <p className="mt-1 text-xs text-white/55">
              Green + <span className="font-semibold text-emerald-300">On</span> is
              enabled. Gray +{" "}
              <span className="font-semibold text-white/50">Off</span> is skipped.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close settings"
          >
            <X className="size-4" />
          </button>
        </CardHeader>

        <CardContent className="max-h-[min(32rem,78%)] overflow-y-auto px-4 py-3 md:px-5 md:py-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPreset(p.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  p.id === activeMode
                    ? "border-amber-400/70 bg-amber-500/25 text-amber-50 hover:bg-amber-500/35"
                    : "border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mb-4 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Text size
            </span>
            <div className="flex overflow-hidden rounded-full border border-white/20">
              {TEXT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={size === textSize}
                  onClick={() => onTextSizeChange(size)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium transition",
                    size === textSize
                      ? "bg-amber-500/25 text-amber-50"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {TEXT_SIZE_LABELS[size]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {TOGGLE_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  {group.label}
                </p>
                <div className="space-y-1.5">
                  {group.keys.map((key) => (
                    <SettingRow
                      key={key}
                      settingKey={key}
                      on={settings[key]}
                      onSettingChange={onSettingChange}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
