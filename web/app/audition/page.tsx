import { AUDITION_CAST } from "@/lib/voices";
import Link from "next/link";

export default function AuditionPage() {
  return (
    <main className="min-h-dvh bg-stone-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Link
          href="/"
          className="text-sm text-amber-400/80 transition hover:text-amber-300"
        >
          ← Back to the player
        </Link>
        <h1 className="mt-4 font-serif text-4xl">Voice audition</h1>
        <p className="mt-2 text-sm text-white/60">
          Character voices for 家有儿女 EP5. Each clip is the same line so you can
          compare timbre before watching.
        </p>
        <ul className="mt-8 space-y-4">
          {AUDITION_CAST.map((voice) => (
            <li
              key={voice.id}
              className={`rounded-2xl border p-5 ${voice.accentColor}`}
            >
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h2 className="font-serif text-2xl">{voice.name}</h2>
                <p className="text-sm text-white/70">{voice.nameEn}</p>
                <p className="text-xs uppercase tracking-widest text-white/40">
                  {voice.role}
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {voice.description}
              </p>
              <audio className="mt-4 w-full" controls src={voice.audition} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
