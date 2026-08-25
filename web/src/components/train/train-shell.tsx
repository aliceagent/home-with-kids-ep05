"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PinyinToggle } from "@/components/train/quiz-kit";

export function TrainModeShell({
  title,
  description,
  pinyinOn,
  onPinyinChange,
  showPinyinToggle = true,
  children,
}: {
  title: string;
  description: string;
  pinyinOn?: boolean;
  onPinyinChange?: (on: boolean) => void;
  showPinyinToggle?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-12">
        <Link
          href="/train"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to training
        </Link>

        <header className="mb-8">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-400/90">
              Home With Kids · EP5 <span lang="zh-CN">猫鼠之争</span>
            </p>
            {showPinyinToggle && pinyinOn != null && onPinyinChange && (
              <PinyinToggle pinyinOn={pinyinOn} onChange={onPinyinChange} />
            )}
          </div>
          <h1 className="mt-2 font-serif text-4xl text-white md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
            {description}
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}
