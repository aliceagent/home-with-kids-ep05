"use client";

import Link from "next/link";

const PAGES = [
  { id: "study", href: "/study", label: "Study guide" },
  { id: "transcript", href: "/transcript", label: "Transcript" },
  { id: "progress", href: "/progress", label: "Progress" },
] as const;

type PageId = (typeof PAGES)[number]["id"];

/** Small cross-link row shown in the header of /study, /transcript, and /progress. */
export function PageCrossLinks({ current }: { current: PageId }) {
  return (
    <nav aria-label="Other pages" className="flex flex-wrap items-center gap-1.5">
      {PAGES.filter((p) => p.id !== current).map((p) => (
        <Link
          key={p.id}
          href={p.href}
          className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/60 transition hover:border-amber-400/40 hover:bg-white/10 hover:text-white"
        >
          {p.label}
        </Link>
      ))}
    </nav>
  );
}
