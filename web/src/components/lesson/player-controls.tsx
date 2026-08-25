"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  ListVideo,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  SkipBack,
  SkipForward,
  Square,
} from "lucide-react";

interface PlayerControlsProps {
  playing: boolean;
  paused: boolean;
  canPlay: boolean;
  progress: number;
  currentStep: number;
  totalSteps: number;
  status: string;
  showSettings: boolean;
  onToggleSettings: () => void;
  showChapters: boolean;
  chapterLabel: string | null;
  onToggleChapters: () => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRestart: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  canSkipBack: boolean;
  canSkipForward: boolean;
}

export function PlayerControls({
  playing,
  paused,
  canPlay,
  progress,
  currentStep,
  totalSteps,
  status,
  showSettings,
  onToggleSettings,
  showChapters,
  chapterLabel,
  onToggleChapters,
  onPlay,
  onPause,
  onStop,
  onRestart,
  onSkipBack,
  onSkipForward,
  canSkipBack,
  canSkipForward,
}: PlayerControlsProps) {
  const isActive = playing || paused;

  return (
    <footer className="relative z-40 shrink-0 border-t border-white/10 bg-stone-950/95 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-3 py-2 md:px-6">
        <div className="mb-1.5 flex items-center gap-3">
          <Progress value={progress} className="h-1 flex-1 bg-white/10" />
          <span className="shrink-0 font-mono text-xs text-white/50">
            {currentStep}/{totalSteps}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={onSkipBack}
              disabled={!canSkipBack}
              size="icon"
              variant="ghost"
              className="text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
              title="Previous line"
            >
              <SkipBack className="size-4" />
            </Button>

            {!isActive ? (
              <Button
                onClick={onPlay}
                disabled={!canPlay}
                className="bg-amber-600 hover:bg-amber-500 text-white gap-2 px-4"
              >
                <Play className="size-5 fill-current" />
                Play scene
              </Button>
            ) : (
              <>
                <Button
                  onClick={onPause}
                  variant="secondary"
                  className="gap-2 bg-white/10 text-white hover:bg-white/20"
                >
                  {playing ? (
                    <>
                      <Pause className="size-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="size-5" />
                      Resume
                    </>
                  )}
                </Button>
                <Button
                  onClick={onStop}
                  size="icon"
                  variant="ghost"
                  className="text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <Square className="size-4" />
                </Button>
              </>
            )}

            <Button
              onClick={onSkipForward}
              disabled={!canSkipForward}
              size="icon"
              variant="ghost"
              className="text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
              title="Next line"
            >
              <SkipForward className="size-4" />
            </Button>

            <Button
              onClick={onRestart}
              size="icon"
              variant="ghost"
              className="text-white/50 hover:bg-white/10 hover:text-white"
              title="Restart from beginning"
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {status && (
              <p className="hidden text-sm text-amber-300/90 sm:block">{status}</p>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-expanded={showChapters}
              aria-controls="chapter-picker-panel"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleChapters();
              }}
              className="relative z-10 gap-1.5 rounded-full border border-white/20 bg-white/5 text-white/90 hover:bg-white/10 hover:text-white"
            >
              <ListVideo className="size-4" />
              {showChapters ? "Hide scenes" : "Scenes"}
              {chapterLabel && !showChapters ? (
                <span className="hidden max-w-[9rem] truncate text-white/50 sm:inline">
                  · {chapterLabel}
                </span>
              ) : null}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-expanded={showSettings}
              aria-controls="player-settings-panel"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSettings();
              }}
              className="relative z-10 gap-1.5 rounded-full border border-white/20 bg-white/5 text-white/90 hover:bg-white/10 hover:text-white"
            >
              <Settings2 className="size-4" />
              {showSettings ? "Hide settings" : "View settings"}
              {showSettings ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronUp className="size-3.5" />
              )}
            </Button>
          </div>
        </div>

        {status && (
          <p className="mt-1 truncate text-xs text-amber-300/80 sm:hidden">{status}</p>
        )}
      </div>
    </footer>
  );
}
