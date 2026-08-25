"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DISPLAY_LABELS, type DisplaySettings } from "@/types/lesson";
import { Settings2 } from "lucide-react";

interface DisplayTogglesProps {
  settings: DisplaySettings;
  onChange: (key: keyof DisplaySettings, value: boolean) => void;
  onPreset: (preset: "full" | "immersion" | "reading" | "minimal") => void;
}

const PRESETS = [
  { id: "full" as const, label: "All on" },
  { id: "immersion" as const, label: "Uninterrupted story" },
  { id: "full" as const, label: "All teaching pauses" },
  { id: "reading" as const, label: "Reading" },
  { id: "minimal" as const, label: "Chinese only" },
];

export function DisplayToggles({ settings, onChange, onPreset }: DisplayTogglesProps) {
  const keys = Object.keys(DISPLAY_LABELS) as (keyof DisplaySettings)[];

  return (
    <Card className="border-amber-200/60 bg-white/80 shadow-sm backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Settings2 className="size-4 text-amber-700" />
          Learning layers
        </CardTitle>
        <div className="flex flex-wrap gap-2 pt-1">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPreset(p.id)}
              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 transition hover:bg-amber-100"
            >
              {p.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {keys.map((key) => (
          <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2">
            <Label htmlFor={`toggle-${key}`} className="cursor-pointer text-sm font-normal">
              {DISPLAY_LABELS[key]}
            </Label>
            <Switch
              id={`toggle-${key}`}
              checked={settings[key]}
              onCheckedChange={(v) => onChange(key, v)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
