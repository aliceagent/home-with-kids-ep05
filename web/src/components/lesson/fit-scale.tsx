"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FitScaleProps {
  children: ReactNode;
  /** Recalculate when the visible card contents change */
  contentKey: string;
  className?: string;
  contentClassName?: string;
}

/**
 * Uniformly scales children to fit the parent box. CSS overflow scroll is
 * never used — required so teaching cards can be captured as video frames.
 */
export function FitScale({
  children,
  contentKey,
  className,
  contentClassName,
}: FitScaleProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;

    const measure = () => {
      const availW = frame.clientWidth;
      const availH = frame.clientHeight;
      // Transform does not change layout size, so these stay "natural"
      const needW = content.scrollWidth;
      const needH = content.scrollHeight;
      if (availW < 4 || availH < 4 || needW < 4 || needH < 4) return;
      const next = Math.min(1, availW / needW, availH / needH);
      const clamped = Number.isFinite(next) && next > 0 ? Math.max(next, 0.42) : 1;
      setScale((prev) => (Math.abs(prev - clamped) < 0.008 ? prev : clamped));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(content);
    return () => observer.disconnect();
  }, [contentKey]);

  return (
    <div
      ref={frameRef}
      className={cn(
        "flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden",
        className,
      )}
    >
      <div
        ref={contentRef}
        className={cn("min-w-0 max-w-full", contentClassName)}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
