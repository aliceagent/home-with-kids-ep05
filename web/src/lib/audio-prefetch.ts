import type { Beat, DisplaySettings } from "@/types/lesson";
import { shouldPlayTeachingBeat, isTeachingBeat } from "@/lib/teaching";
import { activeLayers, audioPath } from "@/lib/voices";

const MAX_ENTRIES = 40;
const CONCURRENCY = 4;
let cacheEpoch = 0;

type Entry = {
  blobUrl: string;
  audio: HTMLAudioElement;
  ready: Promise<void>;
  lastUsed: number;
};

const entries = new Map<string, Entry>();
const inflight = new Map<string, Promise<Entry | null>>();
let running = 0;
const waiters: Array<() => void> = [];

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  while (running >= CONCURRENCY) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }
  running += 1;
  try {
    return await fn();
  } finally {
    running -= 1;
    waiters.shift()?.();
  }
}

function whenDecodable(audio: HTMLAudioElement): Promise<void> {
  if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const done = () => {
      audio.removeEventListener("canplaythrough", done);
      audio.removeEventListener("loadeddata", done);
      audio.removeEventListener("error", done);
      resolve();
    };
    audio.addEventListener("canplaythrough", done);
    audio.addEventListener("loadeddata", done);
    audio.addEventListener("error", done);
    // Some browsers sit at HAVE_NOTHING until load() is called again
    try {
      audio.load();
    } catch {
      resolve();
    }
  });
}

function rewind(audio: HTMLAudioElement) {
  audio.pause();
  try {
    audio.currentTime = 0;
  } catch {
    /* ignore */
  }
}

function evict() {
  if (entries.size <= MAX_ENTRIES) return;
  const sorted = [...entries.entries()].sort(
    (a, b) => a[1].lastUsed - b[1].lastUsed,
  );
  while (entries.size > MAX_ENTRIES) {
    const next = sorted.shift();
    if (!next) break;
    const [url, entry] = next;
    if (!entry.audio.paused) continue;
    URL.revokeObjectURL(entry.blobUrl);
    rewind(entry.audio);
    entry.audio.removeAttribute("src");
    try {
      entry.audio.load();
    } catch {
      /* ignore */
    }
    entries.delete(url);
  }
}

export function isAudioReady(url: string): boolean {
  const entry = entries.get(url);
  return Boolean(entry && entry.audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA);
}

export function warmAudio(url: string): Promise<Entry | null> {
  const existing = entries.get(url);
  if (existing) {
    existing.lastUsed = Date.now();
    return existing.ready.then(() => existing);
  }
  const pending = inflight.get(url);
  if (pending) return pending;

  const job = withSlot(async () => {
    const born = cacheEpoch;
    try {
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) return null;
      const blob = await res.blob();
      if (blob.size < 64) return null;
      const blobUrl = URL.createObjectURL(blob);
      if (born !== cacheEpoch) {
        URL.revokeObjectURL(blobUrl);
        return null;
      }
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = blobUrl;
      const ready = whenDecodable(audio);
      const entry: Entry = { blobUrl, audio, ready, lastUsed: Date.now() };
      entries.set(url, entry);
      evict();
      await ready;
      return entry;
    } catch {
      return null;
    } finally {
      inflight.delete(url);
    }
  });

  inflight.set(url, job);
  return job;
}

export function warmAudioUrls(urls: string[]): void {
  for (const url of urls) {
    void warmAudio(url);
  }
}

/** Wait until the clip is in memory, then return an element ready to play. */
export async function ensureAudio(
  url: string,
  timeoutMs = 8000,
): Promise<HTMLAudioElement> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), timeoutMs);
  });
  const warmed = await Promise.race([warmAudio(url), timedOut]);
  if (timer) clearTimeout(timer);

  const entry = warmed ?? entries.get(url) ?? null;
  if (entry) {
    entry.lastUsed = Date.now();
    rewind(entry.audio);
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
  settings: DisplaySettings,
  beatCount = 12,
): string[] {
  const urls: string[] = [];
  let counted = 0;
  for (let i = fromIndex; i < beats.length && counted < beatCount; i++) {
    const beat = beats[i];
    if (isTeachingBeat(beat) && !shouldPlayTeachingBeat(beat, settings)) {
      continue;
    }
    const layers = activeLayers(settings, beat);
    if (layers.length === 0) {
      counted += 1;
      continue;
    }
    for (const layer of layers) {
      urls.push(audioPath(beat.id, layer));
    }
    counted += 1;
  }
  return urls;
}

export function nextPlayableAudioUrl(
  beats: Beat[],
  afterIndex: number,
  settings: DisplaySettings,
): string | null {
  return upcomingAudioUrls(beats, afterIndex + 1, settings, 1)[0] ?? null;
}

export function releaseAudioCache(): void {
  cacheEpoch += 1;
  for (const entry of entries.values()) {
    URL.revokeObjectURL(entry.blobUrl);
    rewind(entry.audio);
    entry.audio.removeAttribute("src");
    try {
      entry.audio.load();
    } catch {
      /* ignore */
    }
  }
  entries.clear();
  inflight.clear();
}
