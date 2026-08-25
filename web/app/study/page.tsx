import beijing from "@/data/beijing.json";
import culture from "@/data/culture.json";
import decks from "@/data/decks.json";
import grammar from "@/data/grammar.json";
import idioms from "@/data/idioms.json";
import {
  BookOpen,
  Landmark,
  Layers,
  MapPin,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

const TABS = [
  { id: "decks", label: "Vocabulary", icon: Layers },
  { id: "idioms", label: "成语 Idioms", icon: Sparkles },
  { id: "grammar", label: "Grammar", icon: BookOpen },
  { id: "beijing", label: "北京话", icon: MapPin },
  { id: "culture", label: "Culture", icon: Landmark },
] as const;

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 md:p-6 ${className}`}>{children}</div>
  );
}

export default function StudyPage() {
  const vocabCount = decks.reduce((sum, deck) => sum + deck.items.length, 0);

  return (
    <main className="min-h-dvh bg-stone-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Link
          href="/"
          className="text-sm text-amber-400/80 transition hover:text-amber-300"
        >
          ← Back to the player
        </Link>
        <h1 className="mt-4 font-serif text-4xl text-white">Study guide</h1>
        <p className="mt-2 text-sm text-white/60">
          Vocabulary, idioms, grammar, Beijing speech, and culture notes from 家有儿女
          EP5 猫鼠之争.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/50">
          {TABS.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 hover:border-amber-400/40 hover:text-white"
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </a>
          ))}
        </div>

        <section id="decks" className="mt-10 space-y-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-indigo-200">
            <Layers className="size-4" />
            Vocabulary · {vocabCount}
          </h2>
          {decks.map((deck) => (
            <Card key={deck.id} className="border-indigo-400/30 bg-indigo-500/[0.07]">
              <h3 className="font-serif text-2xl text-white">{deck.title}</h3>
              <p className="text-sm text-indigo-200">{deck.titleEn}</p>
              <p className="mt-1 text-xs text-white/45">{deck.theme}</p>
              <ul className="mt-4 divide-y divide-white/10">
                {deck.items.map((item) => (
                  <li key={item.chinese} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-serif text-xl text-white">
                        {item.chinese}
                      </span>
                      <span className="text-sm text-teal-200">{item.pinyin}</span>
                      <span className="text-sm text-white/75">{item.english}</span>
                    </div>
                    {item.breakdown && (
                      <p className="mt-1 text-xs text-violet-200/80">
                        {item.breakdown.join(" · ")}
                      </p>
                    )}
                    {item.note && (
                      <p className="mt-1 text-xs leading-relaxed text-white/50">
                        {item.note}
                      </p>
                    )}
                    <p className="mt-1 font-mono text-[10px] text-white/30">
                      heard at line {item.heardAt.join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </section>

        <section id="idioms" className="mt-10 space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-rose-200">
            <Sparkles className="size-4" />
            成语 · {idioms.length}
          </h2>
          {idioms.map((item) => (
            <Card key={item.id} className="border-rose-400/30 bg-rose-500/[0.07]">
              <h3 className="font-serif text-2xl text-white md:text-3xl">
                {item.chinese}
              </h3>
              <p className="mt-1 text-base text-teal-200">{item.pinyin}</p>
              <p className="mt-1.5 text-base text-white/85">{item.english}</p>
              <p className="mt-3 border-t border-white/10 pt-3 text-sm text-white/65">
                <span className="font-semibold text-white/85">Literal: </span>
                {item.literal}
              </p>
              {item.trap && (
                <p className="mt-3 flex gap-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm leading-relaxed text-amber-100">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <span>{item.trap}</span>
                </p>
              )}
            </Card>
          ))}
        </section>

        <section id="grammar" className="mt-10 space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-sky-200">
            <BookOpen className="size-4" />
            Grammar · {grammar.length}
          </h2>
          {grammar.map((item) => (
            <Card key={item.id} className="border-sky-400/30 bg-sky-500/[0.07]">
              <h3 className="font-serif text-2xl text-white">{item.pattern}</h3>
              <p className="mt-1 text-sm text-teal-200">{item.patternPinyin}</p>
              <p className="mt-1 text-sm text-white/80">{item.english}</p>
              {item.example && (
                <p className="mt-3 border-t border-white/10 pt-3 font-serif text-white">
                  {item.example}
                </p>
              )}
              {item.drill && (
                <p className="mt-2 text-sm text-sky-100/80">
                  Drill: {item.drill}
                  {item.drillAnswer ? ` → ${item.drillAnswer}` : ""}
                </p>
              )}
            </Card>
          ))}
        </section>

        <section id="beijing" className="mt-10 space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-orange-200">
            <MapPin className="size-4" />
            北京话 · {beijing.length}
          </h2>
          {beijing.map((item) => (
            <Card key={item.id} className="border-orange-400/30 bg-orange-500/[0.07]">
              <h3 className="font-serif text-2xl text-white">{item.feature}</h3>
              <p className="mt-1 text-sm text-teal-200">{item.featurePinyin}</p>
              <p className="mt-1 text-sm text-white/80">{item.english}</p>
              {item.standard && (
                <p className="mt-3 text-sm text-orange-100">
                  Standard: {item.standard}
                </p>
              )}
              {item.explanation && (
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {item.explanation}
                </p>
              )}
            </Card>
          ))}
        </section>

        <section id="culture" className="mt-10 space-y-4 pb-16">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-200">
            <Landmark className="size-4" />
            Culture · {culture.length}
          </h2>
          {culture.map((item) => (
            <Card key={item.id} className="border-emerald-400/30 bg-emerald-500/[0.07]">
              <h3 className="font-serif text-2xl text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-teal-200">{item.titlePinyin}</p>
              <p className="mt-1 text-sm text-white/70">{item.english}</p>
              <p className="mt-3 text-sm leading-relaxed text-emerald-50/90">
                {item.body}
              </p>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
