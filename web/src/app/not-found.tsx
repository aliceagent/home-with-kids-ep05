import Link from "next/link";

export const metadata = {
  title: "Not found — 家有儿女 EP5",
  description: "This page doesn't exist in Home With Kids EP5.",
};

const LINKS = [
  { href: "/", label: "Back to the episode", description: "Watch from the start" },
  { href: "/train", label: "Training", description: "Listening, flashcards, tones, and more" },
  { href: "/transcript", label: "Transcript", description: "Read every line of the episode" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4 py-16 text-white">
      <div className="mx-auto w-full max-w-md text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-400/90">
          Home With Kids · EP5 <span lang="zh-CN">猫鼠之争</span>
        </p>
        <p lang="zh-CN" className="mt-4 font-serif text-5xl text-white/20">
          迷路了
        </p>
        <h1 className="mt-3 font-serif text-3xl text-white md:text-4xl">
          This scene isn&apos;t in the episode
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          There&apos;s no page at that address. Pick up where the story actually
          happens.
        </p>

        <div className="mt-8 grid gap-2.5 text-left">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex min-h-[44px] items-center justify-between rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 transition hover:border-amber-400/40 hover:bg-white/[0.08]"
            >
              <span>
                <span className="block text-sm font-semibold text-amber-100 group-hover:text-amber-50">
                  {link.label}
                </span>
                <span className="block text-xs text-white/45">{link.description}</span>
              </span>
              <span className="text-white/25 transition group-hover:translate-x-0.5 group-hover:text-amber-300">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
