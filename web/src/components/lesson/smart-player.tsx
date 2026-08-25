"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { Beat, DisplaySettings } from "@/types/lesson";
import type { PresetMode } from "@/components/lesson/lesson-viewer";
import { getSceneImageCandidates } from "@/lib/lesson-utils";
import { audioPath, activeLayers, type AudioLayer, voiceForBeat } from "@/lib/voices";
import { isTeachingBeat, shouldPlayTeachingBeat } from "@/lib/teaching";
import {
  ensureAudio,
  isAudioReady,
  nextPlayableAudioUrl,
  releaseAudioCache,
  upcomingAudioUrls,
  warmAudioUrls,
} from "@/lib/audio-prefetch";
import { SubtitleOverlay } from "@/components/lesson/subtitle-overlay";
import { EpisodeCoverSheet } from "@/components/lesson/episode-cover-sheet";
import { SceneCrossfade } from "@/components/lesson/scene-crossfade";
import { SceneWatermark } from "@/components/lesson/scene-watermark";
import { TeachingPauseOverlay } from "@/components/lesson/teaching-pause-overlay";
import { PlayerSettingsDrawer } from "@/components/lesson/player-settings-drawer";
import { ChapterPicker } from "@/components/lesson/chapter-picker";
import { PlayerControls } from "@/components/lesson/player-controls";
import { chapterAtIndex, resolveChapters } from "@/lib/episode-chapters";
import {
  LOOP_KEY,
  LOOP_MODES,
  POSITION_KEY,
  SPEED_KEY,
  TEXT_SIZES,
  TEXT_SIZE_KEY,
  loopPlayCount,
  markSeen,
  readSeen,
  readStored,
  writeStored,
  type LoopMode,
  type TextSize,
} from "@/lib/player-storage";

/** Playback rates the speed button cycles through */
const SPEEDS = [0.75, 1, 1.25];

/** Breather between a line and its loop repeat, so repeats stay legible */
const LOOP_GAP_MS = 400;

/** Single source of truth for where playback stands */
type PlaybackPhase = "idle" | "playing" | "paused" | "complete";

/**
 * Fullscreen lives in the DOM, not in React — read it straight from `document`
 * so no effect has to mirror it into state. The server snapshot is `false`, so
 * the prerender simply omits the button until the client knows better.
 */
const subscribeFullscreen = (onChange: () => void) => {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
};
const readFullscreenActive = () => document.fullscreenElement !== null;
const readFullscreenSupported = () => document.fullscreenEnabled === true;
const noFullscreen = () => false;

interface SmartPlayerProps {
  beats: Beat[];
  settings: DisplaySettings;
  onSettingsChange: (key: keyof DisplaySettings, value: boolean) => void;
  onPreset: (preset: PresetMode) => void;
  /** Which preset the current settings match, if any — for highlighting the active mode */
  activeMode: PresetMode | "custom";
}

export function SmartPlayer({
  beats,
  settings,
  onSettingsChange,
  onPreset,
  activeMode,
}: SmartPlayerProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<PlaybackPhase>("idle");
  /** Display text only — never a state gate */
  const [status, setStatus] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loopMode, setLoopMode] = useState<LoopMode>("off");
  const [textSize, setTextSize] = useState<TextSize>("small");
  const [displaySource, setDisplaySource] = useState<string | null>(
    beats[0]?.source ?? null,
  );
  /** Id of the beat whose teaching card is on screen, or null */
  const [teachingCardId, setTeachingCardId] = useState<string | null>(null);
  /** Scene URLs that 404'd, so we fall through to the next candidate */
  const [failedSceneUrls, setFailedSceneUrls] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const playing = phase === "playing";
  const paused = phase === "paused";

  const playGenerationRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelRef = useRef(false);
  const pauseRef = useRef(false);
  const playingRef = useRef(false);
  const skipTargetRef = useRef<number | null>(null);
  /** Latest speed, readable from the long-lived scene loop's closure */
  const speedRef = useRef(1);
  /** Latest loop mode, read fresh on every repeat so a mid-line change lands */
  const loopRef = useRef<LoopMode>("off");
  /** Set by any manual navigation — drops the repeats still owed to this line */
  const loopBreakRef = useRef(false);
  /** Generation of the single-line replay that runs outside the scene loop */
  const idleReplayRef = useRef(0);
  /** Skips the first write so a fresh mount cannot clobber the saved position */
  const positionSavedRef = useRef(false);
  /** The element handed to the Fullscreen API — the stage, not the controls */
  const stageRef = useRef<HTMLDivElement | null>(null);

  const beat = beats[index];
  const progress = ((index + 1) / beats.length) * 100;
  const chapters = useMemo(() => resolveChapters(beats), [beats]);
  const currentChapter = chapterAtIndex(chapters, index);
  const dialogueTotal = useMemo(
    () => beats.filter((b) => b.type === "dialogue").length,
    [beats],
  );
  const [seenCount, setSeenCount] = useState<number | null>(null);

  const isFullscreen = useSyncExternalStore(
    subscribeFullscreen,
    readFullscreenActive,
    noFullscreen,
  );
  const canFullscreen = useSyncExternalStore(
    subscribeFullscreen,
    readFullscreenSupported,
    noFullscreen,
  );

  /* AGENT-DONE(5): ?beat= deep link handled in the mount restore effect below
     (a lazy useState initializer hydration-mismatched against the prerendered
     index-0 HTML — React #418 — so post-mount setState is the correct shape;
     the scoped disable already covers it and the lint error is gone). */

  /**
   * Land on a ?beat=<id> deep link, else pick up where this browser left off.
   * Deep links always win over the saved position.
   */
  /* eslint-disable react-hooks/set-state-in-effect -- deep-link landing and
     persisted-state restore are only hydration-safe after mount */
  useEffect(() => {
    const savedSpeed = readStored<number>(SPEED_KEY);
    if (typeof savedSpeed === "number" && SPEEDS.includes(savedSpeed)) {
      speedRef.current = savedSpeed;
      setSpeed(savedSpeed);
    }

    const savedSize = readStored<TextSize>(TEXT_SIZE_KEY);
    if (savedSize && TEXT_SIZES.includes(savedSize)) setTextSize(savedSize);

    const savedLoop = readStored<LoopMode>(LOOP_KEY);
    if (savedLoop && LOOP_MODES.includes(savedLoop)) {
      loopRef.current = savedLoop;
      setLoopMode(savedLoop);
    }

    const beatParam = new URLSearchParams(window.location.search).get("beat");
    if (beatParam) {
      const i = beats.findIndex((b) => b.id === beatParam);
      if (i > 0) setIndex(i);
      return;
    }
    const savedIndex = readStored<number>(POSITION_KEY);
    if (typeof savedIndex !== "number") return;
    if (savedIndex <= 0 || savedIndex >= beats.length) return;
    setIndex(savedIndex);
    setStatus(`Resumed at line ${savedIndex + 1} — press Play`);
  }, [beats]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Remember the current line so a reload lands back on it
  useEffect(() => {
    if (!positionSavedRef.current) {
      positionSavedRef.current = true;
      return;
    }
    writeStored(POSITION_KEY, index);
  }, [index]);

  /* eslint-disable react-hooks/set-state-in-effect -- restoring persisted state
     is only hydration-safe after mount */
  useEffect(() => {
    const seen = readSeen();
    let n = 0;
    for (const b of beats) {
      if (b.type === "dialogue" && seen.has(b.id)) n += 1;
    }
    setSeenCount(n);
  }, [beats, index, phase]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* AGENT-DONE(1b): markSeen(b.id) after a beat's audio/hold (and after playTeachingBeat) finishes, skipped on cancel/seek. */

  // Preload upcoming scene images so crossfades never wait on network
  useEffect(() => {
    if (!settings.sceneImage) return;
    for (let offset = 1; offset <= 3; offset++) {
      const next = beats[index + offset];
      if (!next?.source) continue;
      const nextUrl = getSceneImageCandidates(next.source)[0];
      if (!nextUrl) continue;
      const img = new window.Image();
      img.src = nextUrl;
    }
  }, [index, beats, settings.sceneImage]);

  // Fetch and decode the next ~12 lines so playback does not stall on download
  useEffect(() => {
    warmAudioUrls(upcomingAudioUrls(beats, index, settings, 12));
  }, [beats, index, settings]);

  /**
   * While the scene loop drives playback it owns the displayed frame; when
   * idle the frame simply follows the selected beat.
   */
  const sceneSource = playing || paused ? (displaySource ?? beat.source) : beat.source;
  const sceneCandidates = settings.sceneImage
    ? getSceneImageCandidates(sceneSource)
    : [];
  const sceneImageUrl =
    sceneCandidates.find((url) => !failedSceneUrls.has(url)) ?? null;
  const showSceneImage = settings.sceneImage && sceneImageUrl;

  const stop = useCallback(() => {
    skipTargetRef.current = null;
    loopBreakRef.current = true;
    cancelRef.current = true;
    pauseRef.current = false;
    playingRef.current = false;
    playGenerationRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    setPhase("idle");
    setTeachingCardId(null);
    setStatus("");
  }, []);

  useEffect(
    () => () => {
      stop();
      releaseAudioCache();
    },
    [stop],
  );

  /**
   * Play one clip. Never rejects and never hangs.
   *
   * Resolves `false` when the clip is missing, blocked, or interrupted. A
   * watchdog also settles the promise if playback is cancelled externally
   * (skip / stop blanks the element, which does not reliably fire `error`) —
   * without it the scene loop could wedge mid-beat and leave a teaching
   * card's state stuck on.
   */
  const playUrl = (url: string) =>
    new Promise<boolean>((resolve) => {
      const generation = ++playGenerationRef.current;
      const previous = audioRef.current;
      if (previous) {
        previous.pause();
        previous.onended = null;
        previous.onerror = null;
      }

      let settled = false;
      let watchdog = 0;
      let audio: HTMLAudioElement | null = null;

      function finish(ok: boolean) {
        if (settled) return;
        settled = true;
        window.clearInterval(watchdog);
        if (audio) {
          audio.onended = null;
          audio.onerror = null;
        }
        resolve(ok);
      }

      watchdog = window.setInterval(() => {
        if (cancelRef.current || generation !== playGenerationRef.current) {
          audio?.pause();
          finish(false);
          return;
        }
        if (audio && audioRef.current !== audio) {
          finish(false);
          return;
        }
        if (audio?.ended) finish(true);
      }, 150);

      ensureAudio(url)
        .then((el) => {
          if (settled || cancelRef.current || generation !== playGenerationRef.current) {
            finish(false);
            return;
          }
          audio = el;
          audioRef.current = el;
          el.playbackRate = speedRef.current;
          el.onended = () => finish(true);
          el.onerror = () => finish(false);
          return el.play();
        })
        .catch(() => finish(false));
    });

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const start = Date.now();
      const tick = () => {
        if (cancelRef.current) {
          resolve();
          return;
        }
        if (pauseRef.current) {
          setTimeout(tick, 80);
          return;
        }
        if (Date.now() - start >= ms) {
          resolve();
          return;
        }
        setTimeout(tick, 80);
      };
      tick();
    });

  /**
   * Returns true if at least one layer actually produced audio.
   *
   * `isStale` lets a caller outside the scene loop (the idle replay) bail out
   * without touching cancelRef, which the loop owns.
   */
  const playBeatLayers = async (
    b: Beat,
    layers: AudioLayer[],
    beatIndex: number,
    isStale?: () => boolean,
  ) => {
    const voice = voiceForBeat(b);
    let anyPlayed = false;

    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li];
      if (cancelRef.current || isStale?.()) return anyPlayed;
      while (pauseRef.current && !cancelRef.current) {
        await wait(100);
      }
      if (cancelRef.current || isStale?.()) return anyPlayed;

      const label =
        layer === "chinese"
          ? "中文"
          : layer === "english"
            ? "English"
            : layer === "narrator"
              ? "Narrator"
              : "拼音";
      setStatus(`${voice.nameEn} · ${label}`);
      const played = await playUrl(audioPath(b.id, layer));
      anyPlayed = anyPlayed || played;

      const nextUrl =
        li + 1 < layers.length
          ? audioPath(b.id, layers[li + 1])
          : nextPlayableAudioUrl(beats, beatIndex, settings);
      const nextReady = nextUrl ? isAudioReady(nextUrl) : false;
      await wait(layer === "narrator" ? 280 : nextReady ? 60 : 180);
    }

    return anyPlayed;
  };

  /** Teaching cards stay up long enough to actually read */
  const MIN_CARD_MS = 4000;

  const playTeachingBeat = async (b: Beat, beatIndex: number) => {
    if (!shouldPlayTeachingBeat(b, settings)) {
      return;
    }

    // Show the card before any audio work, so it renders even if audio fails
    setTeachingCardId(b.id);
    setStatus("Teaching pause");

    const shownAt = Date.now();
    const layers = activeLayers(settings, b);
    const played = layers.length > 0 ? await playBeatLayers(b, layers, beatIndex) : false;

    if (!played && !cancelRef.current) {
      // No narration available — hold the card for its own reading time
      const fallbackMs = Math.max((b.durationSec ?? 6) * 1000, MIN_CARD_MS);
      await wait(fallbackMs - (Date.now() - shownAt));
    }

    const onScreenFor = Date.now() - shownAt;
    if (onScreenFor < MIN_CARD_MS && !cancelRef.current) {
      await wait(MIN_CARD_MS - onScreenFor);
    }

    setTeachingCardId(null);
    await wait(300);
    if (!cancelRef.current) markSeen(b.id);
  };

  /**
   * Repeat-after-me hold. Reuses the normal pause so Play, Space, Pause and
   * seeking all behave exactly as they do for a hand-made pause.
   */
  const shadowPause = async () => {
    // The line's clip has already ended — drop it so resuming cannot replay it
    audioRef.current = null;
    pauseRef.current = true;
    setPhase("paused");
    setStatus("Your turn — say the line, then press Play");
    while (pauseRef.current && !cancelRef.current) {
      await wait(100);
    }
  };

  const playScene = async (startIndex = 0) => {
    const hasAnyAudio =
      settings.audioChinese ||
      settings.audioEnglish ||
      settings.audioPinyin ||
      settings.audioNarrator;

    cancelRef.current = false;
    pauseRef.current = false;
    playingRef.current = true;
    setPhase("playing");
    warmAudioUrls(upcomingAudioUrls(beats, startIndex, settings, 12));

    try {
      for (let i = startIndex; i < beats.length; i++) {
        if (cancelRef.current) break;

        const b = beats[i];
        setIndex(i);
        if (b.source) setDisplaySource(b.source);
        warmAudioUrls(upcomingAudioUrls(beats, i, settings, 12));

        if (isTeachingBeat(b)) {
          await playTeachingBeat(b, i);
          continue;
        }

        const readingMs = Math.max((b.durationSec ?? 4) * 1000, 1500);
        const layers = activeLayers(settings, b);
        // Every new line starts with a fresh repeat budget
        loopBreakRef.current = false;
        let spoke = false;
        let plays = 0;

        // One pass per play of this line: once normally, then once more for
        // each loop repeat still owed.
        for (;;) {
          if (hasAnyAudio && layers.length > 0) {
            const startedAt = Date.now();
            const played = await playBeatLayers(b, layers, i);
            spoke = played;
            // Silent line (missing clip, blocked autoplay) — still hold the subtitle
            if (!played && !cancelRef.current) {
              await wait(readingMs - (Date.now() - startedAt));
            }
          } else {
            setStatus(`${i + 1}/${beats.length}`);
            await wait(readingMs);
          }
          plays += 1;

          if (cancelRef.current) break;
          // Looping drills the spoken line — title and teaching beats never repeat
          if (b.type !== "dialogue" || loopBreakRef.current) break;

          const wanted = loopPlayCount(loopRef.current);
          if (plays >= wanted) break;

          setStatus(
            wanted === Number.POSITIVE_INFINITY
              ? "Looping this line — skip to move on"
              : `Loop ${plays + 1} of ${wanted}`,
          );
          await wait(LOOP_GAP_MS);
          if (cancelRef.current || loopBreakRef.current) break;
        }

        if (cancelRef.current) break;

        // Shadowing hands the line back to the learner before moving on. Only
        // after a spoken dialogue line — there is nothing to repeat otherwise.
        if (settings.shadowing && spoke && b.type === "dialogue") {
          await shadowPause();
          if (cancelRef.current) break;
        }

        markSeen(b.id);

        const nextUrl = nextPlayableAudioUrl(beats, i, settings);
        await wait(nextUrl && isAudioReady(nextUrl) ? 80 : 220);
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Playback error");
    } finally {
      playingRef.current = false;
      setTeachingCardId(null);

      const resumeAt = skipTargetRef.current;
      skipTargetRef.current = null;

      if (resumeAt !== null) {
        cancelRef.current = false;
        pauseRef.current = false;
        playScene(resumeAt).catch(() => setStatus("Playback failed — try again"));
        return;
      }

      if (cancelRef.current) {
        setPhase("idle");
      } else {
        setPhase("complete");
        setStatus("Scene complete");
      }
    }
  };

  const handlePlay = () => {
    if (phase === "paused") {
      pauseRef.current = false;
      setPhase("playing");
      setStatus("");
      audioRef.current?.play().catch(() => setStatus("Tap Play to start audio"));
      return;
    }
    const startAt = phase === "complete" ? 0 : index;
    setPhase("playing");
    setStatus("Starting…");
    playScene(startAt).catch(() => setStatus("Playback failed — try again"));
  };

  const handlePause = () => {
    if (phase === "playing") {
      pauseRef.current = true;
      audioRef.current?.pause();
      setPhase("paused");
      setStatus("Paused");
    } else if (phase === "paused") {
      pauseRef.current = false;
      audioRef.current?.play();
      setPhase("playing");
      setStatus("");
    }
  };

  const handleRestart = () => {
    skipTargetRef.current = null;
    stop();
    setTeachingCardId(null);
    setIndex(0);
    setDisplaySource(beats[0]?.source ?? null);
  };

  /**
   * Move to `newIndex`. `allowSameIndex` lets the replay button re-enter the
   * scene loop on the line that is already showing.
   */
  const jumpToBeat = useCallback(
    (newIndex: number, allowSameIndex = false) => {
      if (newIndex < 0 || newIndex >= beats.length) return;
      if (newIndex === index && !allowSameIndex) return;

      // Moving by hand ends the current line's drill, however many repeats
      // it still had coming
      loopBreakRef.current = true;

      // Cancel first so any in-flight clip's watchdog settles immediately
      const sessionActive = playingRef.current || playing || paused;
      if (sessionActive) {
        cancelRef.current = true;
        playGenerationRef.current += 1;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setTeachingCardId(null);
      setIndex(newIndex);
      if (beats[newIndex]?.source) setDisplaySource(beats[newIndex].source);

      if (sessionActive) {
        skipTargetRef.current = newIndex;
        pauseRef.current = false;
        setPhase("playing");
        setStatus("");
      }
    },
    [beats, index, playing, paused],
  );

  const handleSkipBack = () => jumpToBeat(index - 1);
  const handleSkipForward = () => jumpToBeat(index + 1);

  /**
   * Replay the line on screen. Mid-session it re-enters the scene loop at the
   * same index; when idle it plays that line's layers once and stops there.
   */
  const handleReplay = async () => {
    if (playingRef.current || playing || paused) {
      jumpToBeat(index, true);
      return;
    }

    const layers = activeLayers(settings, beat);
    if (layers.length === 0) return;

    // A newer replay, or a scene that started meanwhile, retires this one
    const run = ++idleReplayRef.current;
    const isStale = () => run !== idleReplayRef.current || playingRef.current;

    cancelRef.current = false;
    await playBeatLayers(beat, layers, index, isStale);
    if (!cancelRef.current && !isStale()) setStatus("");
  };

  const handleTextSizeChange = (size: TextSize) => {
    setTextSize(size);
    writeStored(TEXT_SIZE_KEY, size);
  };

  /** Off → ×2 → ×3 → ∞ → off. Takes effect on the line already sounding. */
  const handleCycleLoop = () => {
    const next = LOOP_MODES[(LOOP_MODES.indexOf(loopMode) + 1) % LOOP_MODES.length];
    loopRef.current = next;
    // Turning the loop off mid-line drops what it still owed
    if (next === "off") loopBreakRef.current = true;
    setLoopMode(next);
    writeStored(LOOP_KEY, next);
  };

  const handleCycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    speedRef.current = next;
    setSpeed(next);
    // Take effect on the clip that is already sounding, not just the next one
    if (audioRef.current) audioRef.current.playbackRate = next;
    writeStored(SPEED_KEY, next);
  };

  /** Blow the stage up to the whole screen — the browser owns the state */
  const handleToggleFullscreen = () => {
    const el = stageRef.current;
    if (!el) return;
    try {
      const request = document.fullscreenElement
        ? document.exitFullscreen()
        : el.requestFullscreen();
      void Promise.resolve(request).catch(() =>
        setStatus("Fullscreen unavailable"),
      );
    } catch {
      setStatus("Fullscreen unavailable");
    }
  };

  /**
   * Tapping the picture toggles playback, the way a video player does. Taps
   * aimed at a control, or landing while a drawer is up, are left alone.
   */
  const handleStageClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (showSettings || showChapters) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("button,a,[role=slider]")) return;
    if (phase === "playing" || phase === "paused") handlePause();
    else handlePlay();
  };

  const handleSelectChapter = (startIndex: number) => {
    setShowChapters(false);
    const sessionActive = playingRef.current || playing || paused;
    if (sessionActive) {
      if (startIndex !== index) jumpToBeat(startIndex);
      return;
    }
    setIndex(startIndex);
    if (beats[startIndex]?.source) setDisplaySource(beats[startIndex].source);
    setPhase("playing");
    setStatus("Starting…");
    playScene(startIndex).catch(() => setStatus("Playback failed — try again"));
  };

  /**
   * Window-level shortcuts: Space, ArrowLeft/Right, R, F, Escape. Re-subscribed
   * every render (no dep array) so the handler always sees the current beat and
   * the current playback handlers — one listener swap per render is free.
   */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName.toLowerCase() ?? "";
      if (target?.isContentEditable) return;
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      // A focused button already activates on Space — don't toggle twice
      if (e.key === " " && (tag === "button" || tag === "a")) return;
      // The seek bar owns its own arrows while focused
      if (
        (e.key === "ArrowLeft" || e.key === "ArrowRight") &&
        target?.closest('[role="slider"]')
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (playing || paused) handlePause();
          else handlePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          jumpToBeat(index - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          jumpToBeat(index + 1);
          break;
        case "r":
        case "R":
          e.preventDefault();
          void handleReplay();
          break;
        case "l":
        case "L":
          e.preventDefault();
          handleCycleLoop();
          break;
        case "f":
        case "F":
          if (!canFullscreen) break;
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case "Escape":
          if (!showSettings && !showChapters) break;
          e.preventDefault();
          setShowSettings(false);
          setShowChapters(false);
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const showCover = beat.type === "title";

  /**
   * During playback the card is tied to a specific beat id, so it can never
   * outlive its beat. When idle or paused, land on a teaching beat and show it.
   */
  const teachingCardVisible =
    isTeachingBeat(beat) &&
    shouldPlayTeachingBeat(beat, settings) &&
    (teachingCardId === beat.id || (!playing && teachingCardId === null));

  const showDialogueSubtitles =
    !teachingCardVisible && !isTeachingBeat(beat) && beat.type !== "title";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-stone-950">
      <div
        ref={stageRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-stone-950 px-3 py-2"
        style={{ containerType: "size" }}
      >
        <div
          onClick={handleStageClick}
          className="relative overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
          style={{
            aspectRatio: "4 / 3",
            width: "min(100cqw, 56rem, calc(100cqh * 4 / 3))",
            height: "min(100cqh, calc(min(100cqw, 56rem) * 3 / 4))",
          }}
        >
            {/* Always keep last scene under overlays — never swap to empty/black */}
            <SceneCrossfade
              url={showSceneImage ? sceneImageUrl : null}
              alt={beat.chinese}
              dimmed={teachingCardVisible}
              onError={() => {
                if (!sceneImageUrl) return;
                setFailedSceneUrls((prev) => {
                  if (prev.has(sceneImageUrl)) return prev;
                  const next = new Set(prev);
                  next.add(sceneImageUrl);
                  return next;
                });
              }}
            />

            {!showSceneImage && !showCover ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-900/40 via-stone-900 to-stone-950 p-8">
                {settings.chinese && (
                  <p className="text-center font-serif text-3xl text-white/90 md:text-4xl">
                    {beat.chinese}
                  </p>
                )}
              </div>
            ) : null}

            <EpisodeCoverSheet
              beat={beat}
              settings={settings}
              active={showCover}
              playing={playing && showCover}
              onStart={handlePlay}
              onPreset={onPreset}
              activeMode={activeMode}
              seenCount={seenCount}
              dialogueTotal={dialogueTotal}
            />

            <SubtitleOverlay
              beat={beat}
              settings={settings}
              visible={showDialogueSubtitles}
              textSize={textSize}
            />
            <TeachingPauseOverlay
              beat={beat}
              settings={settings}
              active={teachingCardVisible}
              textSize={textSize}
            />

            {phase === "complete" && (
              <div className="absolute inset-0 z-[35] flex items-end justify-center bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 pb-10">
                <a
                  href="/quiz"
                  className="rounded-full border border-amber-400/50 bg-amber-600 px-5 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-amber-500"
                >
                  Take the 5-question exit quiz
                </a>
              </div>
            )}

            <SceneWatermark />

            <PlayerSettingsDrawer
              open={showSettings}
              settings={settings}
              onSettingChange={onSettingsChange}
              onPreset={onPreset}
              activeMode={activeMode}
              textSize={textSize}
              onTextSizeChange={handleTextSizeChange}
              onClose={() => setShowSettings(false)}
            />

            <ChapterPicker
              open={showChapters}
              chapters={chapters}
              currentIndex={index}
              onSelect={handleSelectChapter}
              onClose={() => setShowChapters(false)}
            />
          </div>
      </div>

      <PlayerControls
        playing={playing}
        paused={paused}
        canPlay
        progress={progress}
        currentStep={index + 1}
        totalSteps={beats.length}
        status={status}
        showSettings={showSettings}
        onToggleSettings={() => {
          setShowSettings((v) => !v);
          setShowChapters(false);
        }}
        showChapters={showChapters}
        chapterLabel={currentChapter ? currentChapter.titleEn : null}
        onToggleChapters={() => {
          setShowChapters((v) => !v);
          setShowSettings(false);
        }}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={stop}
        onRestart={handleRestart}
        onReplay={() => void handleReplay()}
        loopMode={loopMode}
        onCycleLoop={handleCycleLoop}
        onSkipBack={handleSkipBack}
        onSkipForward={handleSkipForward}
        onSeek={(target) => jumpToBeat(target)}
        speed={speed}
        onCycleSpeed={handleCycleSpeed}
        canFullscreen={canFullscreen}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        canSkipBack={index > 0}
        canSkipForward={index < beats.length - 1}
      />
    </div>
  );
}
