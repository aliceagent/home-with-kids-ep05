"use client";

import type { AudioLayer, Beat, PlayerSettings } from "@/lib/types";
import { isTeachingBeat, shouldPlayTeachingBeat } from "@/lib/teaching";
import { activeLayers, audioPath } from "@/lib/voices";

type CacheEntry = {
  blobUrl: string;
  audio: HTMLAudioElement;
  ready: Promise<void>;
  lastUsed: number;
};

let generation = 0;
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry | null>>();
let active = 0;
const waiters: Array<() => void> = [];

async function limit<T>(fn: () => Promise<T>): Promise<T> {
  while (active >= 4) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }
  active += 1;
  try {
    return await fn();
  } finally {
    active -= 1;
    waiters.shift()?.();
  }
}

function resetAudio(audio: HTMLAudioElement) {
  audio.pause();
  try {
    audio.currentTime = 0;
  } catch {
    /* ignore */
  }
}

export function isAudioReady(url: string): boolean {
  const entry = cache.get(url);
  return !!(entry && entry.audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA);
}

function evict() {
  if (cache.size <= 40) return;
  const entries = [...cache.entries()].sort(
    (a, b) => a[1].lastUsed - b[1].lastUsed,
  );
  while (cache.size > 40) {
    const next = entries.shift();
    if (!next) break;
    const [url, entry] = next;
    if (entry.audio.paused) {
      URL.revokeObjectURL(entry.blobUrl);
      resetAudio(entry.audio);
      entry.audio.removeAttribute("src");
      try {
        entry.audio.load();
      } catch {
        /* ignore */
      }
      cache.delete(url);
    }
  }
}

export function prefetchAudio(url: string): Promise<CacheEntry | null> {
  const hit = cache.get(url);
  if (hit) {
    hit.lastUsed = Date.now();
    return hit.ready.then(() => hit);
  }
  const pending = inflight.get(url);
  if (pending) return pending;

  const gen = generation;
  const work = limit(async () => {
    try {
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) return null;
      const blob = await res.blob();
      if (blob.size < 64) return null;
      const blobUrl = URL.createObjectURL(blob);
      if (gen !== generation) {
        URL.revokeObjectURL(blobUrl);
        return null;
      }
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = blobUrl;
      const ready =
        audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              const done = () => {
                audio.removeEventListener("canplaythrough", done);
                audio.removeEventListener("loadeddata", done);
                audio.removeEventListener("error", done);
                resolve();
              };
              audio.addEventListener("canplaythrough", done);
              audio.addEventListener("loadeddata", done);
              audio.addEventListener("error", done);
              try {
                audio.load();
              } catch {
                resolve();
              }
            });
      const entry: CacheEntry = {
        blobUrl,
        audio,
        ready,
        lastUsed: Date.now(),
      };
      cache.set(url, entry);
      evict();
      await ready;
      return entry;
    } catch {
      return null;
    } finally {
      inflight.delete(url);
    }
  });
  inflight.set(url, work);
  return work;
}

export function prefetchUrls(urls: string[]) {
  for (const url of urls) prefetchAudio(url);
}

export async function loadAudio(
  url: string,
  timeoutMs = 8000,
): Promise<HTMLAudioElement> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), timeoutMs);
  });
  const raced = await Promise.race([prefetchAudio(url), timeout]);
  if (timer) clearTimeout(timer);
  const entry = raced ?? cache.get(url) ?? null;
  if (entry) {
    entry.lastUsed = Date.now();
    resetAudio(entry.audio);
    return entry.audio;
  }
  const audio = new Audio();
  audio.preload = "auto";
  audio.src = url;
  return audio;
}

export function upcomingAudioUrls(
  beats: Beat[],
  fromIndex: number,
  settings: PlayerSettings,
  count = 12,
): string[] {
  const urls: string[] = [];
  let seen = 0;
  for (let i = fromIndex; i < beats.length && seen < count; i++) {
    const beat = beats[i];
    if (isTeachingBeat(beat) && !shouldPlayTeachingBeat(beat, settings)) continue;
    const layers = activeLayers(settings, beat);
    if (layers.length === 0) {
      seen += 1;
      continue;
    }
    for (const layer of layers) urls.push(audioPath(beat.id, layer));
    seen += 1;
  }
  return urls;
}

export function nextAudioUrl(
  beats: Beat[],
  index: number,
  settings: PlayerSettings,
): string | null {
  return upcomingAudioUrls(beats, index + 1, settings, 1)[0] ?? null;
}

export function disposeAudioCache() {
  generation += 1;
  for (const entry of cache.values()) {
    URL.revokeObjectURL(entry.blobUrl);
    resetAudio(entry.audio);
    entry.audio.removeAttribute("src");
    try {
      entry.audio.load();
    } catch {
      /* ignore */
    }
  }
  cache.clear();
  inflight.clear();
}

export function layerLabel(layer: AudioLayer): string {
  if (layer === "chinese") return "中文";
  if (layer === "english") return "English";
  if (layer === "narrator") return "Narrator";
  return "拼音";
}
