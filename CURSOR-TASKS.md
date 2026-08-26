# Task brief for the Cursor agent — Round 4: training games

Three large tasks. Two other agents are working in parallel on separate areas
(the player engine, and new standalone pages) — you own `web/src/components/train/`,
`web/src/app/train/`, and `web/src/data/quiz.ts`. Do not modify the player
(`smart-player`, `subtitle-overlay`, `player-*`), the cover sheet, or
`lesson-viewer` this round: another agent is changing them and your PR must not
conflict.

## How to work this brief

1. **Branch**: `cursor/round-4-games` cut from the LATEST `main` (fetch first).
2. **This round, OPEN A PULL REQUEST** to `main` when done (title
   "Training games: dictation, scene order, daily mix"; body summarizing per
   task + your build/lint results). Do NOT merge it — the reviewing agent
   verifies (build, lint, Playwright over every route) and merges.
3. One commit per task. Verification before every commit:
   `cd web && npm run build` passes; `npm run lint` adds nothing beyond the
   baseline (0 errors, 2 warnings: chapter-picker `no-img-element`,
   build-episode-beats unused var).
4. Notes: `AGENT-DONE(<id>)` comment at the top of each task's main new file
   and update the checklist below (1–3 bullets per task, note deviations).

## Ground rules (as rounds 2–3)

- Static prerender: storage reads and DOM-affecting randomness only AFTER
  mount (useEffect into state; brief empty shell). Never seed state from
  `window`/storage in a lazy initializer — hydration mismatch (React #418)
  fails the review.
- Audio starts only on user gesture; stop clips on unmount/next question.
  Per-line clips exist at `/lessons/ep05/audio/<beatId>-{chinese,pinyin,english}.mp3`.
- Reuse the round-3 kit: `components/train/quiz-kit.tsx` (PinyinToggle,
  usePinyinPref, choice/reveal/score UI), `lib/train-pool.ts`,
  `lib/train-storage.ts`, history via `pushQuizResult({..., mode})`.
- Tailwind v4 + shadcn + lucide, dark stone/amber theme, `lang="zh-CN"` on
  Chinese-only text, `aria-label` on icon-only buttons, `motion-safe:`.
- No runtime API keys, no API routes, no touching `web/public` or `lessons/`.

## Tasks

### C1 — Dictation builder (`/train/dictation`)
Hear it, then build the sentence:
- 8 rounds from dialogue beats of 6–14 Chinese characters. Tap-to-play the
  line's chinese clip (replayable).
- Below, a shuffled bank of single-character chips containing exactly the
  line's characters (punctuation stripped). Tapping a chip appends it to the
  answer row; tapping a chip in the answer row returns it to the bank. A
  progress row shows slots filling in.
- "Check" grades exact character order. Reveal shows the correct line,
  pinyin (toggle-aware), English, and a `/?beat=<id>` jump link; wrong
  positions highlighted. History `mode: "dictation"`.
- Shuffle deterministically per question instance (client-side after mount).

### C2 — Scene order (`/train/scenes`)
Discourse-flow training:
- 5 rounds. Each round takes 4 CONSECUTIVE dialogue beats from within one
  chapter (use `lib/episode-chapters.ts` to avoid crossing scene boundaries),
  shuffles them, and shows them as cards (speaker chip + Chinese; pinyin/
  English per the toggle, plus a small play button per card).
- The learner taps cards in the order they think the conversation happened;
  tapped cards move to a numbered answer column (tap again to undo).
- Grade: full credit for exact order; reveal shows the true order with
  timestamps and a jump link to the first line. History `mode: "scenes"`.

### C3 — Daily mix (`/train/daily`)
One-tap mixed review session:
- 10 questions sampled across the existing generators: 4 from the written
  bank (`pickQuiz`), 2 listening (hear clip → pick English), 2 who-said-it,
  2 tone-drill items — reuse the round-3 question-building logic by
  extracting/importing it, do not duplicate large code blocks. If an item
  type runs dry, backfill from the written bank.
- Renders each question with the shared kit UI; audio questions follow the
  gesture rule. Score card records history `mode: "daily"`.
- Hub: add three new cards (Daily mix FIRST, then Dictation, Scene order) to
  `components/train/train-hub.tsx` with best/attempts like the others.

## Round 4 checklist (update as you go)

- [x] C1 — dictation builder
  - `/train/dictation`: 8 lines of 6–14 Han characters. Tap-to-play chinese clip; punctuation-stripped character chips shuffled with a per-question seed; Check grades exact order and highlights wrong slots. History `mode: "dictation"`.
- [x] C2 — scene order
  - `/train/scenes`: 5 rounds. Four consecutive dialogue beats from one `resolveChapters` window, shuffled. Tap into a numbered column (tap again to undo). Full credit for exact order; reveal prints timestamps. History `mode: "scenes"`.
- [x] C3 — daily mix + hub cards
  - `/train/daily`: 10 questions (4 `pickQuiz`, 2 listening, 2 who-said-it, 2 tones). Shuffle; backfill from the written bank if a type runs short. History `mode: "daily"`.
  - Builders live in `web/src/lib/train-questions.ts`; listening / who-said-it / tone drill import them so the mix cannot drift.
  - Hub Games section is first: Daily mix, Dictation, Scene order, each with best/attempts.

---

## Archive

- **Round 3 (training modes)**: shipped in PR #6 — audition removed, quiz kit
  + pinyin toggle, /train hub, listening, match-audio, flashcards+SRS,
  who-said-it, tone drill, bank v2 (185 questions). No review fixes needed.
- **Round 2 (learning loop)**: shipped in PR #4 — one review fix (deep-link
  hydration mismatch, React #418).
