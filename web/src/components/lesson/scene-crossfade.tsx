"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SceneLayer {
  id: number;
  url: string;
  /** Incoming layer fades from 0→1; settled layers stay at 1 */
  opacity: number;
}

interface SceneCrossfadeProps {
  url: string | null;
  alt: string;
  dimmed?: boolean;
  onError?: () => void;
}

/**
 * Crossfade without black gaps: keep the current frame fully opaque
 * until the next frame is loaded and faded in on top, then drop the old one.
 */
export function SceneCrossfade({ url, alt, dimmed, onError }: SceneCrossfadeProps) {
  const idRef = useRef(0);
  const currentUrlRef = useRef<string | null>(null);
  const onErrorRef = useRef(onError);
  const [layers, setLayers] = useState<SceneLayer[]>([]);
  const fadeMs = 550;

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!url) return;
    if (url === currentUrlRef.current) return;

    let cancelled = false;
    const target = url;
    let cleanupTimer: number | undefined;

    const preload = new window.Image();
    preload.onload = () => {
      if (cancelled) return;
      if (target === currentUrlRef.current) return;

      const prevUrl = currentUrlRef.current;
      currentUrlRef.current = target;
      idRef.current += 1;
      const newId = idRef.current;

      // First frame: show immediately (no fade-from-black)
      if (!prevUrl) {
        setLayers([{ id: newId, url: target, opacity: 1 }]);
        return;
      }

      // Keep previous layer at opacity 1; stack new layer on top at 0
      setLayers((prev) => {
        const kept = prev
          .filter((l) => l.opacity > 0)
          .slice(-1)
          .map((l) => ({ ...l, opacity: 1 }));
        return [...kept, { id: newId, url: target, opacity: 0 }];
      });

      // Next frame: fade new layer in (old stays opaque underneath)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          setLayers((prev) =>
            prev.map((l) => (l.id === newId ? { ...l, opacity: 1 } : l)),
          );
        });
      });

      // After fade, drop everything except the top layer
      cleanupTimer = window.setTimeout(() => {
        if (cancelled) return;
        setLayers((prev) => {
          const top = prev[prev.length - 1];
          if (!top || top.url !== target) return prev;
          return [{ ...top, opacity: 1 }];
        });
      }, fadeMs + 50);
    };
    preload.onerror = () => {
      if (!cancelled) onErrorRef.current?.();
    };
    preload.src = target;

    return () => {
      cancelled = true;
      if (cleanupTimer) window.clearTimeout(cleanupTimer);
    };
  }, [url]);

  if (layers.length === 0) return null;

  return (
    <div className="absolute inset-0 bg-transparent">
      {layers.map((layer, i) => (
        <div
          key={layer.id}
          className={cn(
            "absolute inset-0 transition-opacity ease-in-out",
            dimmed && i === layers.length - 1 && "brightness-[0.45] scale-[1.02]",
          )}
          style={{
            opacity: layer.opacity,
            transitionDuration: `${fadeMs}ms`,
            zIndex: i + 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={layer.url}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
