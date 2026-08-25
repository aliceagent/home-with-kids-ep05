"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  ListVideo,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
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
  onReplay: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  /** Zero-based beat index the viewer scrubbed to */
  onSeek: (index: number) => void;
  speed: number;
  onCycleSpeed: () => void;
  /** False when the browser has no Fullscreen API — the button is hidden */
  canFullscreen: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
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
  onReplay,
  onSkipBack,
  onSkipForward,
  onSeek,
  speed,
  onCycleSpeed,
  canFullscreen,
  isFullscreen,
  onToggleFullscreen,
  canSkipBack,
  canSkipForward,
}: PlayerControlsProps) {
  const isActive = playing || paused;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  /** Horizontal position inside the bar → beat index */
  const seekToClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el || totalSteps < 2) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    onSeek(Math.round(ratio * (totalSteps - 1)));
  };

  const handleTrackPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    seekToClientX(e.clientX);
  };

  const handleTrackPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) seekToClientX(e.clientX);
  };

  const handleTrackPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleTrackKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    // Stop the player's window-level shortcut from moving a second line
    e.preventDefault();
    e.stopPropagation();
    onSeek(currentStep - 1 + (e.key === "ArrowRight" ? 1 : -1));
  };

  return (
    <footer className="relative z-40 shrink-0 border-t border-white/10 bg-stone-950/95 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-3 py-2 md:px-6">
        <div className="mb-1.5 flex items-center gap-3">
          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Lesson position"
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-valuenow={currentStep}
            aria-valuetext={`Line ${currentStep} of ${totalSteps}`}
            onPointerDown={handleTrackPointerDown}
            onPointerMove={handleTrackPointerMove}
            onPointerUp={handleTrackPointerUp}
            onPointerCancel={handleTrackPointerUp}
            onKeyDown={handleTrackKeyDown}
            className="group relative h-4 flex-1 cursor-pointer touch-none select-none outline-none"
          >
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/10 transition-[height] group-hover:h-1.5 group-focus-visible:h-1.5 group-focus-visible:ring-1 group-focus-visible:ring-amber-400/60">
              <div
                className="h-full rounded-full bg-amber-500/90"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
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

            <Button
              onClick={onReplay}
              size="icon"
              variant="ghost"
              className="text-white/70 hover:bg-white/10 hover:text-white"
              title="Replay this line (R)"
              aria-label="Replay this line"
            >
              <RotateCw className="size-4" />
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
                  title="Stop playback"
                  aria-label="Stop playback"
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

            <Button
              onClick={onCycleSpeed}
              size="sm"
              variant="ghost"
              className="min-w-12 font-mono text-xs text-white/70 hover:bg-white/10 hover:text-white"
              title="Playback speed — cycles 0.75× / 1× / 1.25×"
            >
              {speed}×
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {status && (
              <p
                aria-live="polite"
                className="hidden text-sm text-amber-300/90 sm:block"
              >
                {status}
              </p>
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
            {canFullscreen && (
              <Button
                type="button"
                onClick={onToggleFullscreen}
                size="icon"
                variant="ghost"
                className="relative z-10 text-white/70 hover:bg-white/10 hover:text-white"
                title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="size-4" />
                ) : (
                  <Maximize className="size-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {status && (
          <p
            aria-hidden="true"
            className="mt-1 truncate text-xs text-amber-300/80 sm:hidden"
          >
            {status}
          </p>
        )}
      </div>
    </footer>
  );
}
