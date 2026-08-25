"use client";

import { useEffect, useMemo, useState } from "react";

type Chore = {
  id: string;
  title: string;
  assignee: string;
  points: number;
  done: boolean;
};

export default function Home() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [points, setPoints] = useState(5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/chores")
      .then((res) => res.json())
      .then((data: { chores: Chore[] }) => setChores(data.chores))
      .catch(() => setError("Could not load chores."))
      .finally(() => setLoading(false));
  }, []);

  const { earned, total, completed } = useMemo(() => {
    const total = chores.reduce((sum, c) => sum + c.points, 0);
    const earned = chores
      .filter((c) => c.done)
      .reduce((sum, c) => sum + c.points, 0);
    const completed = chores.filter((c) => c.done).length;
    return { earned, total, completed };
  }, [chores]);

  async function addChore(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const res = await fetch("/api/chores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, assignee, points }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not add chore.");
      return;
    }

    const { chore } = (await res.json()) as { chore: Chore };
    setChores((prev) => [...prev, chore]);
    setTitle("");
    setAssignee("");
    setPoints(5);
  }

  function toggle(id: string) {
    setChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
    );
  }

  function remove(id: string) {
    setChores((prev) => prev.filter((c) => c.id !== id));
  }

  const progress = total === 0 ? 0 : Math.round((earned / total) * 100);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-widest text-indigo-500">
          Home with Kids
        </span>
        <h1 className="text-4xl font-bold tracking-tight">Family Chore Board</h1>
        <p className="text-base text-black/60 dark:text-white/60">
          Add chores, assign them, and earn points as a family.
        </p>
      </header>

      <section className="rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-6 text-white shadow-lg">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Points earned</p>
            <p className="text-4xl font-bold" data-testid="points-earned">
              {earned}
              <span className="text-xl font-medium opacity-70"> / {total}</span>
            </p>
          </div>
          <p className="text-sm font-medium opacity-90" data-testid="completed-count">
            {completed} of {chores.length} done
          </p>
        </div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <form
        onSubmit={addChore}
        className="flex flex-col gap-3 rounded-2xl border border-black/10 p-5 dark:border-white/15 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Chore
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Take out the trash"
            className="rounded-lg border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-indigo-500 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Kid
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Name"
            className="w-28 rounded-lg border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-indigo-500 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Points
          <input
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-20 rounded-lg border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-indigo-500 dark:border-white/20"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {loading && <li className="text-black/50">Loading chores…</li>}
        {!loading && chores.length === 0 && (
          <li className="text-black/50 dark:text-white/50">
            No chores yet. Add one above!
          </li>
        )}
        {chores.map((chore) => (
          <li
            key={chore.id}
            className="flex items-center gap-4 rounded-xl border border-black/10 px-4 py-3 dark:border-white/15"
          >
            <input
              type="checkbox"
              checked={chore.done}
              onChange={() => toggle(chore.id)}
              aria-label={`Mark ${chore.title} done`}
              className="h-5 w-5 accent-indigo-600"
            />
            <div className="flex flex-1 flex-col">
              <span
                className={
                  chore.done
                    ? "text-base font-medium text-black/40 line-through dark:text-white/40"
                    : "text-base font-medium"
                }
              >
                {chore.title}
              </span>
              <span className="text-sm text-black/50 dark:text-white/50">
                {chore.assignee}
              </span>
            </div>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
              {chore.points} pts
            </span>
            <button
              onClick={() => remove(chore.id)}
              aria-label={`Remove ${chore.title}`}
              className="text-black/30 transition-colors hover:text-red-500 dark:text-white/40"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
