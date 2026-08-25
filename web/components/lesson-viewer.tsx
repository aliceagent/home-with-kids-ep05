"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  disposeAudioCache,
  isAudioReady,
  layerLabel,
  loadAudio,
  nextAudioUrl,
  prefetchUrls,
  upcomingAudioUrls,
} from "@/lib/audio";
import {
  buildChapters,
  currentChapter,
  type Chapter,
} from "@/lib/chapters";
import {
  DEFAULT_SETTINGS,
  PRESET_BUTTONS,
  PRESETS,
  SETTING_GROUPS,
  SETTING_LABELS,
} from "@/lib/settings";
import {
  isTeachingBeat,
  shouldPlayTeachingBeat,
  teachingKindLabel,
  textbookRewrite,
} from "@/lib/teaching";
import type {
  AudioLayer,
  Beat,
  PlayerSettings,
  PresetId,
  SettingsKey,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  activeLayers,
  audioPath,
  sceneImageCandidates,
  voiceForBeat,
} from "@/lib/voices";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Landmark,
  Layers,
  Lightbulb,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  SkipBack,
  SkipForward,
  Sparkles,
  Square,
  TriangleAlert,
  Languages,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SERIES_ZH = "家有儿女";
const SERIES_EN = "Home With Kids";
const EPISODE = 5;
const TITLE_SOURCE = "00m02s_001_来 宝贝 喝点牛奶.jpg";
const TITLE_ZH = "猫鼠之争";
const TITLE_PY = "Māo shǔ zhī zhēng";
const TITLE_EN = "Cat vs. Mouse";
const TAGLINE_ZH = "互动中文字幕 · 全集对白";
const TAGLINE_EN = "Interactive Mandarin — full episode dialogue";
const YEAR = "2004";
const CAST = [
  { name: "夏雪", nameEn: "Xia Xue", color: "bg-red-400" },
  { name: "刘梅", nameEn: "Liu Mei", color: "bg-pink-400" },
  { name: "夏东海", nameEn: "Donghai", color: "bg-blue-400" },
  { name: "夏雨", nameEn: "Xia Yu", color: "bg-green-400" },
];

const SPEAKER_BORDER: Record<string, string> = {
  夏雪: "border-l-red-400",
  刘梅: "border-l-pink-400",
  夏东海: "border-l-blue-400",
  夏雨: "border-l-green-400",
};
const SPEAKER_CHIP: Record<string, string> = {
  夏雪: "bg-black/60 text-white border-red-400",
  刘梅: "bg-black/60 text-white border-pink-400",
  夏东海: "bg-black/60 text-white border-blue-400",
  夏雨: "bg-black/60 text-white border-green-400",
};
const SPEAKER_DOT: Record<string, string> = {
  夏雪: "bg-red-400",
  刘梅: "bg-pink-400",
  夏东海: "bg-blue-400",
  夏雨: "bg-green-400",
};
const TYPE_LABEL: Record<string, string> = {
  title: "Intro",
  dialogue: "Dialogue",
  vocab: "Vocabulary",
  idiom: "Idiom",
  grammar: "Grammar",
  note: "Note",
  beijing: "Beijing speech",
  culture: "Culture",
  deck: "Review",
  outro: "Next lesson",
};
const CARD_SKIN: Record<string, string> = {
  idiom: "border-rose-400/60 bg-rose-950/95",
  grammar: "border-sky-400/60 bg-sky-950/95",
  vocab: "border-violet-400/60 bg-violet-950/95",
  note: "border-amber-400/60 bg-amber-950/95",
  beijing: "border-orange-400/60 bg-orange-950/95",
  culture: "border-emerald-400/60 bg-emerald-950/95",
  deck: "border-indigo-400/60 bg-indigo-950/95",
};

function Credit({ className }: { className?: string }) {
  return (
    <p
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-2 left-2 z-[50]",
        "rounded-sm bg-black/60 px-1.5 py-0.5",
        "font-sans text-[10px] font-medium leading-none tracking-wide text-white/90",
        "shadow-[0_1px_2px_rgba(0,0,0,0.65)]",
        className,
      )}
    >
      Jonathan Caras
    </p>
  );
}

function FitContent({
  children,
  contentKey,
  className,
  contentClassName,
}: {
  children: ReactNode;
  contentKey: string;
  className?: string;
  contentClassName?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const outer = frame.current;
    const box = inner.current;
    if (!outer || !box) return;
    const update = () => {
      const tw = outer.clientWidth;
      const th = outer.clientHeight;
      const sw = box.scrollWidth;
      const sh = box.scrollHeight;
      if (tw < 4 || th < 4 || sw < 4 || sh < 4) return;
      const next = Math.min(1, tw / sw, th / sh);
      const clamped = Number.isFinite(next) && next > 0 ? Math.max(next, 0.42) : 1;
      setScale((prev) => (Math.abs(prev - clamped) < 0.008 ? prev : clamped));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(box);
    return () => observer.disconnect();
  }, [contentKey]);

  return (
    <div
      ref={frame}
      className={cn(
        "flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden",
        className,
      )}
    >
      <div
        ref={inner}
        className={cn("min-w-0 max-w-full", contentClassName)}
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        {children}
      </div>
    </div>
  );
}

function TitleCard({
  beat,
  settings,
  active,
  playing = false,
}: {
  beat: Beat;
  settings: PlayerSettings;
  active: boolean;
  playing?: boolean;
}) {
  const [fallback, setFallback] = useState(0);
  const candidates = sceneImageCandidates(TITLE_SOURCE);
  const src = candidates[fallback] ?? null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-40 overflow-hidden",
        "transition-opacity duration-700 ease-in-out",
        active ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      {src && (
        <Image
          src={src}
          alt=""
          fill
          className={cn(
            "object-cover transition-transform duration-[4000ms] ease-out",
            playing ? "scale-110" : "scale-105",
          )}
          priority
          sizes="(max-width: 896px) 100vw, 896px"
          onError={() => setFallback((i) => (i + 1 < candidates.length ? i + 1 : i))}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/70 to-stone-950/45" />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-transparent to-stone-950/30" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 50% at 50% 30%, rgba(251, 191, 36, 0.25), transparent),
            radial-gradient(circle at 85% 75%, rgba(244, 114, 182, 0.1), transparent)
          `,
        }}
      />
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-5 py-6 text-center md:px-10 md:py-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-400/90 md:mb-3 md:text-xs">
          Learn Chinese with {SERIES_EN}
        </p>
        <p className="mb-1 font-serif text-sm tracking-wide text-white/50 md:text-base">
          {SERIES_ZH}
        </p>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/30 px-3 py-1 backdrop-blur-sm md:mb-5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
            Episode {EPISODE}
          </span>
          <span className="h-1 w-1 rounded-full bg-amber-500/60" />
          <span className="text-[10px] text-amber-200/70">{YEAR}</span>
        </div>
        <h1
          className={cn(
            "font-serif text-4xl font-bold leading-none tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl",
            playing && "animate-in fade-in zoom-in-95 duration-700",
          )}
        >
          {settings.chinese ? TITLE_ZH : beat.chinese}
        </h1>
        {settings.pinyin && (
          <p className="mt-2 text-base text-teal-300/90 drop-shadow md:mt-3 md:text-xl">
            {TITLE_PY}
          </p>
        )}
        {settings.english && (
          <p className="mt-1.5 text-sm font-medium text-amber-100/80 drop-shadow md:mt-2 md:text-lg">
            {TITLE_EN}
          </p>
        )}
        <div className="my-4 h-px w-16 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent md:my-6 md:w-24" />
        <p className="max-w-sm px-2 text-xs leading-snug text-white/55 drop-shadow md:text-sm md:leading-relaxed">
          {settings.chinese && TAGLINE_ZH}
          {settings.chinese && settings.english && " · "}
          {settings.english && TAGLINE_EN}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 md:mt-8 md:gap-3">
          {CAST.map((person) => (
            <span
              key={person.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] text-white/75 backdrop-blur-sm"
            >
              <span className={cn("size-1.5 rounded-full", person.color)} />
              {settings.chinese ? person.name : person.nameEn}
            </span>
          ))}
        </div>
        {!playing && (
          <p className="mt-6 animate-pulse text-xs text-white/40 md:mt-10">
            Press Play scene to begin
          </p>
        )}
        {playing && (
          <div className="mt-6 flex items-center gap-2 md:mt-8">
            <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
            <span className="text-[10px] uppercase tracking-widest text-amber-400/80">
              Starting episode
            </span>
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute left-4 top-4 size-8 border-l-2 border-t-2 border-amber-500/25 md:left-6 md:top-6 md:size-10" />
      <div className="pointer-events-none absolute right-4 top-4 size-8 border-r-2 border-t-2 border-amber-500/25 md:right-6 md:top-6 md:size-10" />
      <div className="pointer-events-none absolute bottom-4 left-4 size-8 border-b-2 border-l-2 border-amber-500/25 md:bottom-6 md:left-6 md:size-10" />
      <div className="pointer-events-none absolute bottom-4 right-4 size-8 border-b-2 border-r-2 border-amber-500/25 md:bottom-6 md:right-6 md:size-10" />
    </div>
  );
}

function SceneImage({
  url,
  alt,
  dimmed,
  onError,
}: {
  url: string | null;
  alt?: string;
  dimmed?: boolean;
  onError?: () => void;
}) {
  const idRef = useRef(0);
  const current = useRef<string | null>(null);
  const onErrorRef = useRef(onError);
  const [layers, setLayers] = useState<
    { id: number; url: string; opacity: number }[]
  >([]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let timeout: number | undefined;
    if (!url || url === current.current) return;
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (cancelled || url === current.current) return;
      const prev = current.current;
      current.current = url;
      idRef.current += 1;
      const id = idRef.current;
      if (prev) {
        setLayers((list) => [
          ...list
            .filter((layer) => layer.opacity > 0)
            .slice(-1)
            .map((layer) => ({ ...layer, opacity: 1 })),
          { id, url, opacity: 0 },
        ]);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!cancelled) {
              setLayers((list) =>
                list.map((layer) =>
                  layer.id === id ? { ...layer, opacity: 1 } : layer,
                ),
              );
            }
          });
        });
        timeout = window.setTimeout(() => {
          if (!cancelled) {
            setLayers((list) => {
              const last = list[list.length - 1];
              return last && last.url === url ? [{ ...last, opacity: 1 }] : list;
            });
          }
        }, 600);
      } else {
        setLayers([{ id, url, opacity: 1 }]);
      }
    };
    img.onerror = () => {
      if (!cancelled) onErrorRef.current?.();
    };
    img.src = url;
    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [url]);

  if (layers.length === 0) return null;
  return (
    <div className="absolute inset-0 bg-transparent">
      {layers.map((layer, index) => (
        <div
          key={layer.id}
          className={cn(
            "absolute inset-0 transition-opacity ease-in-out",
            dimmed && index === layers.length - 1 && "brightness-[0.45] scale-[1.02]",
          )}
          style={{
            opacity: layer.opacity,
            transitionDuration: "550ms",
            zIndex: index + 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={layer.url}
            alt={alt ?? ""}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}

function Subtitles({
  beat,
  settings,
  visible,
}: {
  beat: Beat;
  settings: PlayerSettings;
  visible: boolean;
}) {
  const voice = voiceForBeat(beat);
  const border = beat.speaker
    ? (SPEAKER_BORDER[beat.speaker] ?? "border-l-amber-400")
    : "border-l-amber-400";
  const rewrite = settings.registerRewrite
    ? textbookRewrite(beat.chinese)
    : null;
  const hasText =
    (settings.chinese && beat.chinese) ||
    (settings.pinyin && beat.pinyin) ||
    (settings.english && beat.english);
  if (!visible || !hasText) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-20 px-2.5 pb-1.5 pt-2",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "rounded-md border-l-[3px] bg-black/72 px-2.5 py-1 shadow-md backdrop-blur-sm",
          border,
        )}
      >
        <div className="mb-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {settings.speaker && beat.speaker && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border px-1.5 py-px text-[10px] font-semibold tracking-wide",
                SPEAKER_CHIP[beat.speaker] ??
                  "bg-black/60 text-white border-white/30",
              )}
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  SPEAKER_DOT[beat.speaker] ?? "bg-white/70",
                )}
              />
              {beat.speaker}
              <span className="font-normal text-white/75">{voice.nameEn}</span>
            </span>
          )}
          {!beat.speaker && beat.type !== "dialogue" && (
            <span className="rounded border border-white/20 bg-white/10 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-white/90">
              {TYPE_LABEL[beat.type]}
            </span>
          )}
          {settings.timestamp && (
            <span className="font-mono text-[9px] text-white/50">
              {beat.timestamp}
            </span>
          )}
        </div>
        {settings.chinese && beat.chinese && (
          <p className="font-serif text-base leading-tight text-white md:text-lg">
            {beat.chinese}
          </p>
        )}
        {settings.pinyin && beat.pinyin && (
          <p className="text-[11px] leading-tight text-teal-100 md:text-xs">
            {beat.pinyin}
          </p>
        )}
        {settings.english && beat.english && (
          <p className="text-[11px] leading-tight text-white/85 md:text-xs">
            {beat.english}
          </p>
        )}
        {rewrite && (
          <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-[11px] leading-tight">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-widest text-sky-300/80">
              <BookOpen className="size-2.5" />
              Textbook
            </span>
            <span className="font-serif text-sky-50">{rewrite}</span>
          </p>
        )}
        {settings.beijing && beat.beijingTags?.length ? (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {beat.beijingTags.map((tag) => (
              <span
                key={tag.badge}
                className="inline-flex items-center gap-1 rounded border border-orange-400/45 bg-orange-500/15 px-1.5 py-px text-[10px] font-medium text-orange-100"
              >
                <MapPin className="size-2.5 shrink-0" />
                {tag.badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TeachingIcon({ type }: { type: Beat["type"] }) {
  const className = "size-3.5";
  switch (type) {
    case "idiom":
      return <Sparkles className={className} />;
    case "grammar":
      return <BookOpen className={className} />;
    case "vocab":
      return <Languages className={className} />;
    case "beijing":
      return <MapPin className={className} />;
    case "culture":
      return <Landmark className={className} />;
    case "deck":
      return <Layers className={className} />;
    default:
      return <Lightbulb className={className} />;
  }
}

function TeachingCard({
  beat,
  settings,
  active,
}: {
  beat: Beat;
  settings: PlayerSettings;
  active: boolean;
}) {
  if (!active) return null;
  const isDeck = beat.type === "deck";
  const contentKey = [
    beat.id,
    settings.chinese,
    settings.pinyin,
    settings.english,
    settings.drills,
    settings.notes,
    settings.breakdown,
  ].join(":");

  return (
    <div
      className={cn(
        "absolute inset-0 z-30 flex flex-col overflow-hidden bg-black/70 p-2.5 pt-7 backdrop-blur-sm md:p-4 md:pt-8",
        "transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <FitContent
        contentKey={contentKey}
        className="min-h-0 flex-1"
        contentClassName={cn("w-full", isDeck ? "max-w-xl" : "max-w-md")}
      >
        <div
          className={cn(
            "w-full overflow-hidden rounded-xl border-2 px-3.5 py-3 shadow-2xl md:px-4 md:py-3.5",
            CARD_SKIN[beat.type] ?? CARD_SKIN.note,
          )}
        >
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/55">
              <TeachingIcon type={beat.type} />
              {teachingKindLabel(beat.type)}
            </p>
            {beat.ladder && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white/85">
                <span className="font-serif text-[13px] leading-none">
                  {beat.ladder.family}
                </span>
                <span className="flex gap-0.5">
                  {Array.from({ length: beat.ladder.of }, (_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "size-1.5 rounded-full",
                        i < beat.ladder!.step ? "bg-sky-300" : "bg-white/25",
                      )}
                    />
                  ))}
                </span>
                <span className="text-white/55">
                  {beat.ladder.step}/{beat.ladder.of}
                </span>
              </span>
            )}
          </div>
          {isDeck ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="font-serif text-lg leading-tight text-white">
                  {beat.deckTitle}
                </p>
                <p className="text-xs text-indigo-200">{beat.deckTitleEn}</p>
              </div>
              {(beat.deckItems ?? []).map((item) => (
                <div key={item.chinese} className="border-t border-white/10 pt-1">
                  <p className="font-serif text-base text-white">{item.chinese}</p>
                  <p className="text-[12px] text-teal-200">{item.pinyin}</p>
                  <p className="text-[12px] text-white/75">{item.english}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {settings.chinese && beat.chinese && (
                <p className="font-serif text-xl leading-snug text-white md:text-[1.35rem]">
                  {beat.chinese}
                </p>
              )}
              {settings.pinyin && beat.pinyin && (
                <p className="text-sm leading-snug text-teal-200">{beat.pinyin}</p>
              )}
              {settings.english && beat.english && (
                <p className="text-[13px] leading-snug text-white/80">
                  {beat.english}
                </p>
              )}
            </div>
          )}
          {beat.type === "beijing" && beat.standard && (
            <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5 border-t border-white/15 pt-2 text-[13px]">
              <span className="font-semibold text-orange-100">Standard:</span>
              <span className="font-serif text-base text-white/90">
                {beat.standard}
              </span>
            </p>
          )}
          {beat.literal && (
            <p className="mt-2 border-t border-white/15 pt-2 text-[12px] leading-snug text-white/70">
              <span className="font-semibold text-white/90">Literal: </span>
              {beat.literal}
            </p>
          )}
          {beat.trap && (
            <p className="mt-2 flex gap-1.5 rounded-md border border-amber-400/40 bg-amber-500/10 px-2 py-1.5 text-[12px] leading-snug text-amber-100">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
              <span>
                <span className="font-semibold">Watch out: </span>
                {beat.trap}
              </span>
            </p>
          )}
          {beat.example && (
            <div className="mt-2 border-t border-white/15 pt-2">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-white/40">
                From the episode
              </p>
              <p className="mt-0.5 font-serif text-base leading-snug text-white">
                {beat.example}
              </p>
              {settings.pinyin && beat.examplePinyin && (
                <p className="text-[12px] leading-snug text-teal-200">
                  {beat.examplePinyin}
                </p>
              )}
              {settings.english && beat.exampleEnglish && (
                <p className="text-[12px] leading-snug text-white/65">
                  {beat.exampleEnglish}
                </p>
              )}
            </div>
          )}
          {beat.drill && settings.drills && (
            <div className="mt-2 rounded-md border border-white/15 bg-black/30 px-2.5 py-1.5">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-sky-300/80">
                Your turn
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-white/85">
                {beat.drill}
              </p>
              {beat.drillAnswer && (
                <p className="mt-0.5 font-serif text-[15px] leading-snug text-sky-200">
                  {beat.drillAnswer}
                </p>
              )}
            </div>
          )}
          {beat.breakdown?.length && settings.breakdown ? (
            <ul className="mt-2 space-y-0.5 border-t border-white/15 pt-2 text-[12px] leading-snug text-violet-200">
              {beat.breakdown.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
          {beat.cultureBody && (
            <p className="mt-2 border-t border-white/15 pt-2 text-[12px] leading-snug text-emerald-50/90">
              {beat.cultureBody}
            </p>
          )}
          {beat.notes && settings.notes && (
            <p className="mt-2 border-t border-white/15 pt-2 text-[12px] leading-snug text-amber-100/90">
              <span className="font-semibold text-amber-50">Note: </span>
              {beat.notes}
            </p>
          )}
        </div>
      </FitContent>
    </div>
  );
}

function SettingsPanel({
  open,
  settings,
  onSettingChange,
  onPreset,
  onClose,
}: {
  open: boolean;
  settings: PlayerSettings;
  onSettingChange: (key: SettingsKey, value: boolean) => void;
  onPreset: (id: PresetId) => void;
  onClose: () => void;
}) {
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
      <div
        id="player-settings-panel"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 max-h-[82%] w-full overflow-hidden rounded-t-2xl bg-stone-900 py-0 text-white ring-1 ring-white/15"
      >
        <div className="flex flex-row items-start justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-5">
          <div>
            <h2 id="player-settings-title" className="text-base font-semibold text-white">
              Playback settings
            </h2>
            <p className="mt-1 text-xs text-white/55">
              Green + <span className="font-semibold text-emerald-300">On</span> is
              enabled. Gray + <span className="font-semibold text-white/50">Off</span> is
              skipped.
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
        </div>
        <div className="max-h-[min(32rem,78%)] overflow-y-auto px-4 py-3 md:px-5 md:py-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {PRESET_BUTTONS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPreset(preset.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  preset.id === "immersion"
                    ? "border-amber-400/70 bg-amber-500/25 text-amber-50 hover:bg-amber-500/35"
                    : "border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {SETTING_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  {group.label}
                </p>
                <div className="space-y-1.5">
                  {group.keys.map((key) => {
                    const on = settings[key];
                    const id = `player-toggle-${key}`;
                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 transition-colors",
                          on
                            ? "border-emerald-400/40 bg-emerald-500/15"
                            : "border-white/10 bg-black/30",
                        )}
                      >
                        <label
                          htmlFor={id}
                          className={cn(
                            "cursor-pointer text-xs font-medium leading-snug",
                            on ? "text-white" : "text-white/45",
                          )}
                        >
                          {SETTING_LABELS[key]}
                        </label>
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
                            onCheckedChange={(value) => onSettingChange(key, value)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChapterThumb({ source, alt }: { source?: string | null; alt: string }) {
  const [i, setI] = useState(0);
  const candidates = sceneImageCandidates(source);
  const src = candidates[i];
  if (!src) {
    return <div className="aspect-4/3 bg-stone-800" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="aspect-[4/3] w-full object-cover"
      onError={() => setI((n) => (n + 1 < candidates.length ? n + 1 : n))}
    />
  );
}

function ChapterPicker({
  open,
  chapters,
  currentIndex,
  onSelect,
  onClose,
}: {
  open: boolean;
  chapters: Chapter[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-[60] flex items-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chapter-picker-title"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close chapters"
        onClick={onClose}
      />
      <div
        id="chapter-picker-panel"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 max-h-[82%] w-full overflow-hidden rounded-t-2xl bg-stone-900 py-0 text-white ring-1 ring-white/15"
      >
        <div className="flex flex-row items-start justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-5">
          <div>
            <h2 id="chapter-picker-title" className="text-base font-semibold text-white">
              Jump to a scene
            </h2>
            <p className="mt-1 text-xs text-white/55">
              Nine beats from this cut of 猫鼠之争. Tap a still to play from there.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close chapters"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[min(34rem,78%)] overflow-y-auto px-4 py-3 md:px-5 md:py-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {chapters.map((chapter) => {
              const now =
                currentIndex >= chapter.startIndex &&
                currentIndex <= chapter.endIndex;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => onSelect(chapter.startIndex)}
                  className={cn(
                    "overflow-hidden rounded-xl text-left ring-1 transition",
                    now
                      ? "ring-amber-400 ring-offset-2 ring-offset-stone-900"
                      : "ring-white/10 hover:ring-white/30",
                  )}
                >
                  <div className="relative">
                    <ChapterThumb
                      source={chapter.thumbBeat.source}
                      alt={chapter.titleEn}
                    />
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white/90">
                      {chapter.timeLabel}
                    </span>
                    {now ? (
                      <span className="absolute right-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-stone-950">
                        Now
                      </span>
                    ) : null}
                  </div>
                  <div className="bg-black/40 px-2 py-1.5">
                    <p className="text-xs font-medium text-white">{chapter.titleZh}</p>
                    <p className="text-[11px] text-white/70">{chapter.titleEn}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-white/45">
                      {chapter.blurb}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerControls({
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
}: {
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
}) {
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
            {playing || paused ? (
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
            ) : (
              <Button
                onClick={onPlay}
                disabled={!canPlay}
                className="bg-amber-600 hover:bg-amber-500 text-white gap-2 px-4"
              >
                <Play className="size-5 fill-current" />
                Play scene
              </Button>
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
              <Clapperboard className="size-4" />
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

function Stage({
  beats,
  settings,
  onSettingsChange,
  onPreset,
}: {
  beats: Beat[];
  settings: PlayerSettings;
  onSettingsChange: (key: SettingsKey, value: boolean) => void;
  onPreset: (id: PresetId) => void;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [heldSource, setHeldSource] = useState(beats[0]?.source ?? null);
  const [teachingId, setTeachingId] = useState<string | null>(null);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());
  const playGen = useRef(0);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const stopFlag = useRef(false);
  const pauseFlag = useRef(false);
  const looping = useRef(false);
  const resumeIndex = useRef<number | null>(null);
  const beat = beats[index];
  const progress = ((index + 1) / beats.length) * 100;
  const chapters = useMemo(() => buildChapters(beats), [beats]);
  const chapter = currentChapter(chapters, index);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("beat");
    if (!id) return;
    const found = beats.findIndex((item) => item.id === id);
    if (found >= 0) setIndex(found);
  }, [beats]);

  useEffect(() => {
    if (!settings.sceneImage) return;
    for (let i = 1; i <= 3; i++) {
      const next = beats[index + i];
      if (!next?.source) continue;
      const url = sceneImageCandidates(next.source)[0];
      if (url) new window.Image().src = url;
    }
  }, [index, beats, settings.sceneImage]);

  useEffect(() => {
    prefetchUrls(upcomingAudioUrls(beats, index, settings, 12));
  }, [beats, index, settings]);

  const stopPlayback = useCallback(() => {
    resumeIndex.current = null;
    stopFlag.current = true;
    pauseFlag.current = false;
    looping.current = false;
    playGen.current += 1;
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.onended = null;
      currentAudio.current.onerror = null;
      currentAudio.current = null;
    }
    setPlaying(false);
    setPaused(false);
    setTeachingId(null);
    setStatus("");
  }, []);

  useEffect(
    () => () => {
      stopPlayback();
      disposeAudioCache();
    },
    [stopPlayback],
  );

  const playUrl = (url: string) =>
    new Promise<boolean>((resolve) => {
      const gen = ++playGen.current;
      const prev = currentAudio.current;
      if (prev) {
        prev.pause();
        prev.onended = null;
        prev.onerror = null;
      }
      let settled = false;
      let poll = 0;
      let audio: HTMLAudioElement | null = null;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        window.clearInterval(poll);
        if (audio) {
          audio.onended = null;
          audio.onerror = null;
        }
        resolve(ok);
      };
      poll = window.setInterval(() => {
        if (stopFlag.current || gen !== playGen.current) {
          audio?.pause();
          finish(false);
          return;
        }
        if (audio && currentAudio.current !== audio) finish(false);
        else if (audio?.ended) finish(true);
      }, 150);
      loadAudio(url)
        .then((el) => {
          if (settled || stopFlag.current || gen !== playGen.current) {
            finish(false);
            return;
          }
          audio = el;
          currentAudio.current = el;
          el.onended = () => finish(true);
          el.onerror = () => finish(false);
          return el.play();
        })
        .catch(() => finish(false));
    });

  const waitMs = (ms: number) =>
    new Promise<void>((resolve) => {
      const start = Date.now();
      const tick = () => {
        if (stopFlag.current) resolve();
        else if (pauseFlag.current) setTimeout(tick, 80);
        else if (Date.now() - start >= ms) resolve();
        else setTimeout(tick, 80);
      };
      tick();
    });

  const playLayers = async (
    item: Beat,
    layers: AudioLayer[],
    itemIndex: number,
  ) => {
    const voice = voiceForBeat(item);
    let any = false;
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (stopFlag.current) break;
      while (pauseFlag.current && !stopFlag.current) await waitMs(100);
      if (stopFlag.current) break;
      setStatus(`${voice.nameEn} · ${layerLabel(layer)}`);
      const ok = await playUrl(audioPath(item.id, layer));
      any = any || ok;
      const upcoming =
        i + 1 < layers.length
          ? audioPath(item.id, layers[i + 1])
          : nextAudioUrl(beats, itemIndex, settings);
      const ready = !!upcoming && isAudioReady(upcoming);
      await waitMs(layer === "narrator" ? 280 : ready ? 60 : 180);
    }
    return any;
  };

  const playTeaching = async (item: Beat, itemIndex: number) => {
    if (!shouldPlayTeachingBeat(item, settings)) return;
    setTeachingId(item.id);
    setStatus("Teaching pause");
    const started = Date.now();
    const layers = activeLayers(settings, item);
    if (!(layers.length > 0 && (await playLayers(item, layers, itemIndex))) && !stopFlag.current) {
      const min = Math.max((item.durationSec ?? 6) * 1000, 4000);
      await waitMs(min - (Date.now() - started));
    }
    const elapsed = Date.now() - started;
    if (elapsed < 4000 && !stopFlag.current) await waitMs(4000 - elapsed);
    setTeachingId(null);
    await waitMs(300);
  };

  const runFrom = async (start = 0) => {
    const hasAudio =
      settings.audioChinese ||
      settings.audioEnglish ||
      settings.audioPinyin ||
      settings.audioNarrator;
    stopFlag.current = false;
    pauseFlag.current = false;
    looping.current = true;
    setPlaying(true);
    setPaused(false);
    prefetchUrls(upcomingAudioUrls(beats, start, settings, 12));
    try {
      for (let i = start; i < beats.length && !stopFlag.current; i++) {
        const item = beats[i];
        setIndex(i);
        if (item.source) setHeldSource(item.source);
        prefetchUrls(upcomingAudioUrls(beats, i, settings, 12));
        if (isTeachingBeat(item)) {
          await playTeaching(item, i);
          continue;
        }
        const hold = Math.max((item.durationSec ?? 4) * 1000, 1500);
        const layers = activeLayers(settings, item);
        if (hasAudio && layers.length > 0) {
          const t0 = Date.now();
          if (!(await playLayers(item, layers, i)) && !stopFlag.current) {
            await waitMs(hold - (Date.now() - t0));
          }
        } else {
          setStatus(`${i + 1}/${beats.length}`);
          await waitMs(hold);
        }
        if (stopFlag.current) break;
        const upcoming = nextAudioUrl(beats, i, settings);
        await waitMs(upcoming && isAudioReady(upcoming) ? 80 : 220);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Playback error");
    } finally {
      looping.current = false;
      setTeachingId(null);
      const next = resumeIndex.current;
      resumeIndex.current = null;
      if (next !== null) {
        stopFlag.current = false;
        pauseFlag.current = false;
        runFrom(next).catch(() => setStatus("Playback failed — try again"));
        return;
      }
      setPlaying(false);
      setPaused(false);
      if (!stopFlag.current) setStatus("Scene complete");
    }
  };

  const jumpTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= beats.length || next === index) return;
      const wasRunning = looping.current || playing || paused;
      if (wasRunning) {
        stopFlag.current = true;
        playGen.current += 1;
      }
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current = null;
      }
      setTeachingId(null);
      setIndex(next);
      if (beats[next]?.source) setHeldSource(beats[next].source);
      if (wasRunning) {
        resumeIndex.current = next;
        pauseFlag.current = false;
        setPlaying(true);
        setPaused(false);
        setStatus("");
      }
    },
    [beats, index, playing, paused],
  );

  const isTitle = beat.type === "title";
  const teachingActive =
    isTeachingBeat(beat) &&
    shouldPlayTeachingBeat(beat, settings) &&
    (teachingId === beat.id || (!playing && teachingId === null));
  const showSubs =
    !teachingActive && !isTeachingBeat(beat) && beat.type !== "title";
  const source = playing || paused ? (heldSource ?? beat.source) : beat.source;
  const imageUrl = (settings.sceneImage ? sceneImageCandidates(source) : []).find(
    (url) => !failedUrls.has(url),
  ) ?? null;
  const showImage = settings.sceneImage && imageUrl;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-stone-950">
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-2"
        style={{ containerType: "size" }}
      >
        <div
          className="relative overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
          style={{
            aspectRatio: "4 / 3",
            width: "min(100cqw, 56rem, calc(100cqh * 4 / 3))",
            height: "min(100cqh, calc(min(100cqw, 56rem) * 3 / 4))",
          }}
        >
          <SceneImage
            url={showImage ? imageUrl : null}
            alt={beat.chinese}
            dimmed={teachingActive}
            onError={() => {
              if (!imageUrl) return;
              setFailedUrls((prev) => {
                if (prev.has(imageUrl)) return prev;
                const next = new Set(prev);
                next.add(imageUrl);
                return next;
              });
            }}
          />
          {showImage || isTitle ? null : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-900/40 via-stone-900 to-stone-950 p-8">
              {settings.chinese && (
                <p className="text-center font-serif text-3xl text-white/90 md:text-4xl">
                  {beat.chinese}
                </p>
              )}
            </div>
          )}
          <TitleCard
            beat={beat}
            settings={settings}
            active={isTitle}
            playing={playing && isTitle}
          />
          <Subtitles beat={beat} settings={settings} visible={showSubs} />
          <TeachingCard beat={beat} settings={settings} active={teachingActive} />
          {status === "Scene complete" && !playing && !paused && (
            <div className="absolute inset-0 z-[35] flex items-end justify-center bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 pb-10">
              <a
                href="/quiz"
                className="rounded-full border border-amber-400/50 bg-amber-600 px-5 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-amber-500"
              >
                Take the 5-question exit quiz
              </a>
            </div>
          )}
          <Credit />
          <SettingsPanel
            open={showSettings}
            settings={settings}
            onSettingChange={onSettingsChange}
            onPreset={onPreset}
            onClose={() => setShowSettings(false)}
          />
          <ChapterPicker
            open={showChapters}
            chapters={chapters}
            currentIndex={index}
            onSelect={(next) => {
              setShowChapters(false);
              if (looping.current || playing || paused) {
                if (next !== index) jumpTo(next);
                return;
              }
              setIndex(next);
              if (beats[next]?.source) setHeldSource(beats[next].source);
              setPlaying(true);
              setStatus("Starting…");
              runFrom(next).catch(() => setStatus("Playback failed — try again"));
            }}
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
        chapterLabel={chapter ? chapter.titleEn : null}
        onToggleChapters={() => {
          setShowChapters((v) => !v);
          setShowSettings(false);
        }}
        onPlay={() => {
          if (paused) {
            pauseFlag.current = false;
            setPlaying(true);
            setPaused(false);
            setStatus("");
            currentAudio.current?.play().catch(() =>
              setStatus("Tap Play to start audio"),
            );
            return;
          }
          const start = status === "Scene complete" ? 0 : index;
          setPlaying(true);
          setStatus("Starting…");
          runFrom(start).catch(() => setStatus("Playback failed — try again"));
        }}
        onPause={() => {
          if (playing) {
            pauseFlag.current = true;
            currentAudio.current?.pause();
            setPlaying(false);
            setPaused(true);
            setStatus("Paused");
          } else if (paused) {
            pauseFlag.current = false;
            currentAudio.current?.play();
            setPlaying(true);
            setPaused(false);
            setStatus("");
          }
        }}
        onStop={stopPlayback}
        onRestart={() => {
          resumeIndex.current = null;
          stopPlayback();
          setTeachingId(null);
          setIndex(0);
          setHeldSource(beats[0]?.source ?? null);
        }}
        onSkipBack={() => jumpTo(index - 1)}
        onSkipForward={() => jumpTo(index + 1)}
        canSkipBack={index > 0}
        canSkipForward={index < beats.length - 1}
      />
    </div>
  );
}

export function LessonViewer({ beats }: { beats: Beat[] }) {
  const [settings, setSettings] = useState<PlayerSettings>(DEFAULT_SETTINGS);
  const dialogueCount = beats.filter((beat) => beat.type === "dialogue").length;
  const last = beats[beats.length - 1];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-stone-950 text-white">
      <header className="shrink-0 border-b border-white/10 px-4 py-1.5 md:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            {SERIES_ZH} · EP{EPISODE}
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
              {dialogueCount} lines · 0:02–{last?.timestamp ?? "13:12"}
            </p>
          </div>
        </div>
      </header>
      <Stage
        beats={beats}
        settings={settings}
        onSettingsChange={(key, value) => {
          setSettings((prev) => ({ ...prev, [key]: value }));
        }}
        onPreset={(id) => setSettings(PRESETS[id])}
      />
    </div>
  );
}
