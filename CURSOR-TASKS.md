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

- [ ] 5 — lint error fixed, baseline now 2
- [ ] 1a — progress storage helpers
- [ ] 1b — seen-line recording
- [ ] 1c — cover progress line
- [ ] 2 — CSV export + studied badges
- [ ] 3a — generated question bank
- [ ] 3b — sampled quiz + score history
- [ ] 4 (optional) — episode meta registry
