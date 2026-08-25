# Task brief for the Cursor agent — learning-loop round

This file is the work order for the next batch of improvements to the EP5
lesson player. It was prepared by the Claude Code session that shipped the
recent security fix, asset optimization, and player UX work. Claude will
review the branch you push and merge it if it meets the bar below.

## How to work this brief

1. **Branch**: start from the latest `main` and work on a branch named
   `cursor/learning-loop-round-2`. Push that branch to this GitHub repo when
   done. **Do not merge to `main` and do not open a PR** — the reviewing
   session handles the merge.
2. **Find the work**: every task below has one or more anchor comments in the
   code marked `AGENT-TASK(<id>)`. Search the repo for `AGENT-TASK` — the
   comment at each site is the authoritative spec for that site.
3. **Order**: do task 5 (lint fix) first — it shrinks the lint baseline the
   rest of your work is measured against. Then 1a → 1b → 1c → 2 → 3a → 3b.
   Task 4 is optional: attempt it only if everything else is done and green.
4. **Commits**: one commit per numbered task (1a–1c may share one commit),
   descriptive message, no model names in messages.
5. **Verification (required before every commit)**:
   - `cd web && npm ci` once, then `npm run build` must pass.
   - `npm run lint` must not introduce anything new. Current baseline is
     3 problems (smart-player `react-hooks/set-state-in-effect` error,
     chapter-picker `no-img-element` warning, build-episode-beats.mjs
     unused-var warning). After task 5 the baseline becomes 2.
6. **Notes to leave behind** (this is part of the deliverable):
   - When a task is done, replace its `AGENT-TASK(...)` comment with a short
     `AGENT-DONE(<id>): <one-line summary of what was implemented and any
     deviation>` comment in the same place.
   - Update the checklist at the bottom of this file: mark the task done and
     add 1–3 bullet notes per task — what you changed, decisions you made,
     anything you skipped and why.
   - If you deliberately deviate from a spec, say so in both places.

## Ground rules

- Match the existing code style: Tailwind v4 utility classes, shadcn/ui
  components, lucide icons, dark stone-950/amber theme, existing comment
  density. Minimal diffs; no drive-by refactors.
- The app is statically prerendered: `localStorage` may only be read inside
  `useEffect` (or a lazily-initialized state guarded by `typeof window`).
  Follow the try/catch pattern in `web/src/lib/player-storage.ts`.
- Keep all `lang="zh-CN"` attributes on Chinese text; add them to any new
  Chinese-only text you render.
- Icon-only buttons need `aria-label`. New animations use `motion-safe:`.
- Never add a runtime API dependency or key. Do not re-create `/api/tts`.
  Do not regenerate or re-encode any media files.
- Do not touch `lessons/` (legacy authoring assets) or anything under
  `web/public` except reading.

## The tasks

1. **Progress tracking** — the app should know what the learner has studied.
   - (1a) storage helpers — `web/src/lib/player-storage.ts`
   - (1b) record watched lines — `web/src/components/lesson/smart-player.tsx`
   - (1c) progress on the cover — `web/src/components/lesson/episode-cover-sheet.tsx`
2. **Vocab export + studied highlighting** — `web/src/components/lesson/study-guide.tsx`
3. **Generated quiz bank + score history**
   - (3a) question bank — `web/src/data/quiz.ts`
   - (3b) quiz session — `web/src/components/lesson/exit-quiz.tsx`
4. **Multi-episode prep (optional)** — `web/src/lib/episode-meta.ts`
5. **Fix the pre-existing lint error** — `web/src/components/lesson/smart-player.tsx`

## Status checklist (update as you go)

- [x] 5 — lint error fixed, baseline now 2
  - Replaced the `?beat=` `useEffect`/`setIndex` with a `typeof window`-guarded lazy `useState` initializer so prerender stays at 0 and the browser lands on the deep-linked beat.
  - Left the restore effect's `has("beat")` early-return in place so deep links still win over saved position.
- [x] 1a — progress storage helpers
  - Added `SEEN_KEY` / `QUIZ_HISTORY_KEY` and `readSeen`, `markSeen` (skips write when already present), `readQuizHistory`, `pushQuizResult` (keeps the 50 most recent) using the existing try/catch storage pattern.
- [x] 1b — seen-line recording
  - `markSeen(b.id)` runs after a dialogue beat's audio/hold (and after shadowing if on), and at the end of `playTeachingBeat` once the card has actually been shown. Cancel/seek/deep-link landing does not record.
- [x] 1c — cover progress line
  - Cover takes `seenCount` / `dialogueTotal` from smart-player (dialogue ids only). Renders nothing until storage is read and N > 0: "You've studied N of 173 lines" with an amber N.
- [x] 2 — CSV export + studied badges
  - Export CSV sits next to search on Vocabulary/Idioms tabs only; downloads the filtered rows as UTF-8 CSV with BOM (`chinese,pinyin,english,note,heardAt`). Idiom `note` is the trap text when present.
  - Emerald "studied" badge after the English gloss when every `heardAt` / `anchors` beat is in `readSeen()`. Hidden when the set is empty so layout does not jump.
- [x] 3a — generated question bank
  - Kept the 5 handwritten questions and generated 28 more at module scope from curriculum + ep05-beats (idiom gloss vs trap/literal, Beijing → standard, vocab Chinese → English with same-deck distractors, grammar cloze from worked examples). Bank total 33, all with `why` and a `beatId`.
  - `pickQuiz(n=5)` shuffles client-side and always includes at least 2 handwritten questions.
- [ ] 3b — sampled quiz + score history
- [ ] 4 (optional) — episode meta registry
