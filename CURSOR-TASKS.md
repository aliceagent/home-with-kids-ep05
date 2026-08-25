# Task brief for the Cursor agent — Round 3: training modes

Work order for the next batch. Prepared by the reviewing Claude Code session;
Claude reviews the branch you push (including a Playwright pass over every
route) and merges it if it meets the bar. Round 2 shipped and its checklist is
archived at the bottom.

## How to work this brief

1. **Branch**: start from the latest `main`, work on `cursor/training-round-3`,
   push the branch when done. Do NOT merge to `main`, do NOT open a PR.
2. **Anchors**: some tasks have `AGENT-TASK(<id>)` comments in existing files —
   search for `AGENT-TASK`. Most of this round is NEW files; for those the spec
   in this document is authoritative.
3. **Order**: R1 → T2 → T3 → Q1 → Q2 → Q3 → Q4 → Q5 → B1 (B1 optional).
4. **Commits**: one commit per task id, no model names in messages.
5. **Verification before every commit**: `cd web && npm run build` passes;
   `npm run lint` adds nothing (baseline: 2 warnings — chapter-picker
   `no-img-element`, build-episode-beats unused var; 0 errors).
6. **Notes**: replace each `AGENT-TASK` with `AGENT-DONE(<id>): <summary>`;
   for new files put an `AGENT-DONE` note at the top of the main new file;
   update the Round-3 checklist below with 1–3 bullets per task, including
   deviations.

## Ground rules (unchanged from round 2, plus audio rules)

- Static prerender: `localStorage` reads and any randomness that affects the
  DOM happen only AFTER mount (useEffect into state, brief empty shell first).
  **Round-2 lesson: a lazy `useState` initializer that reads
  `window.location`/storage hydration-mismatches against the prerendered HTML
  (React #418). Don't do that.** The review runs Playwright over every route
  and fails the batch on any console error.
- Audio only ever starts from a user gesture (tap/click) — no autoplay on
  mount. Reuse the pattern in `smart-player`/`lib/audio-prefetch` or plain
  `new Audio(url)` created on demand; stop playback on unmount and when the
  next question renders.
- Existing audio assets you can rely on: for every dialogue beat id in
  `src/data/ep05-beats.json`, `/lessons/ep05/audio/<id>-chinese.mp3`,
  `<id>-pinyin.mp3`, `<id>-english.mp3` exist. Teaching beats have
  `<id>-narrator.mp3`. There is NO per-word audio — vocab items reference
  their lines via `heardAt`/`anchors` beat ids.
- Tailwind v4 + shadcn/ui + lucide, dark stone-950/amber theme, `lang="zh-CN"`
  on Chinese-only text, `aria-label` on icon-only buttons, `motion-safe:` on
  animations. Minimal diffs in existing files.
- No runtime API keys, no new API routes, no media regeneration. Exception to
  the usual "don't touch web/public" rule: task R1 explicitly deletes
  `web/public/lessons/ep05/auditions/`.

## Round 3 tasks

### R1 — Remove the voice-audition feature (testing-only, never meant to ship)
- Delete `web/src/app/audition/` and
  `web/src/components/lesson/voice-audition.tsx`.
- Remove the audition nav card from `episode-cover-sheet.tsx` and the header
  link in `lesson-viewer.tsx` (anchors in place).
- In `web/src/lib/voices.ts`, remove the `audition` field and anything only it
  used (anchor in place).
- Delete `web/public/lessons/ep05/auditions/` (5 mp3s).
- Update `web/README.md` if it mentions the audition page.

### T2 — Shared quiz kit + pinyin toggle (foundation for everything below)
New file `web/src/components/train/quiz-kit.tsx` (plus
`web/src/lib/train-storage.ts` if you prefer splitting logic):
- `usePinyinPref()`: boolean preference, key `hwk-ep05:quiz-pinyin:v1`,
  default ON, read after mount, persisted on change.
- `<PinyinToggle />`: small pill toggle ("Pinyin on/off") usable on every
  quiz/training screen.
- `<QuizChoiceButton />` and the reveal/score-card UI extracted from
  `exit-quiz.tsx` so all modes look identical (correct = emerald, wrong pick =
  rose, others dimmed; explanation box below).
- Extend quiz history storage: entries become
  `{ ts, score, total, mode: string }`; old entries without `mode` count as
  `"quiz"`. Add `readQuizHistory(mode?)` filtering.
- Wire into the existing `/quiz` page: show `<PinyinToggle />` in its header;
  when OFF, hide `promptZh`-adjacent pinyin and any pinyin lines in
  explanations (anchor in `exit-quiz.tsx`). Chinese characters stay visible —
  the toggle controls transliteration only.

### T3 — Training hub at `/train`
New page `web/src/app/train/page.tsx` + `components/train/train-hub.tsx`:
- Cards for each mode (Written quiz → `/quiz`, Listening → `/train/listening`,
  Match the audio → `/train/match-audio`, Flashcards → `/train/flashcards`,
  Who said it? → `/train/who-said-it`, Tone drill → `/train/tones`), each with
  a one-line description, an icon, and per-mode best score / attempt count
  from history (flashcards card shows cards due instead).
- Same page furniture as `/study` (back link, header, EP badge).
- On the cover (`episode-cover-sheet.tsx`, anchor): the nav cards become
  Training (`/train`), Exit quiz (`/quiz`), Study guide (`/study`).

### Q1 — Listening quiz: hear Chinese, pick the meaning (`/train/listening`)
- 8 questions per round, drawn after mount from dialogue beats that have ≥6
  characters of Chinese (skip fillers like 哎/嗯).
- Each question: a large play button that plays `<id>-chinese.mp3` (replayable,
  plays only on tap), question "What does this line mean?", 4 English choices —
  the beat's `english` plus 3 distractors sampled from other dialogue beats of
  similar length. After answering, reveal the Chinese text (and pinyin when
  the toggle is on) with a "Jump to this line" `/?beat=<id>` link.
- Score card + history entry `mode: "listening"`.

### Q2 — Match the audio: read the line, pick the clip (`/train/match-audio`)
- 8 questions per round. Show the written prompt: the English translation
  (plus the Chinese characters; pinyin only when the toggle is on).
- Three labeled play buttons (A/B/C) — one is the matching line's
  `<id>-chinese.mp3`, two are decoys from other lines of similar length. The
  learner may replay each clip, then locks in A/B/C.
- Reveal shows which clip was right and prints all three clips' Chinese text
  so wrong guesses teach something. History `mode: "match-audio"`.

### Q3 — Flashcards with light spaced repetition (`/train/flashcards`)
- Deck = all vocab-deck items + idioms from `src/data/curriculum.ts`.
- Card front: Chinese (big, serif) + a play button that plays the first
  `heardAt`/anchor line's chinese clip ("hear it in the show"). Back (flip on
  tap): pinyin (respects the toggle — when off, show it only after a second
  tap "show pinyin"), English, note/trap, "Jump to line" link.
- Grade buttons: Again / Good / Easy → next due at now / +1 day / +3 days
  (double the previous interval on repeat Good/Easy, cap 30 days). Store in
  `hwk-ep05:srs:v1` as `{ [cardId]: { due: number, interval: number } }`.
- A session serves the due cards first (shuffled), then new cards, 15 max;
  end screen shows counts. Hub card shows how many are due today.

### Q4 — Who said it? (`/train/who-said-it`)
- 8 rounds. Play a dialogue line's chinese clip (tap to play); choices are the
  four characters (夏雪 / 刘梅 / 夏东海 / 夏雨) as chips with their colors from
  `EP05_META.characters`. Only use beats whose `speaker` is one of those four.
- Reveal: the line's scene image (`getSceneImageCandidates`), Chinese text,
  translation, and speaker. History `mode: "who-said-it"`.

### Q5 — Tone drill (`/train/tones`)
- Uses vocab items whose pinyin contains tone marks. Show the Chinese word,
  play the anchor line's clip, and offer 4 pinyin variants: the correct one
  plus 3 generated by permuting tone marks on its syllables (e.g. hàozi /
  háozi / hǎozi / hāozi). Generate variants deterministically per word.
- This mode ignores the pinyin toggle (pinyin IS the question). Reveal shows
  the English and a jump link. History `mode: "tones"`.

### B1 (optional) — Written bank v2
- In `src/data/quiz.ts` (anchor): add a sentence-comprehension generator —
  show a dialogue line's Chinese, pick its English among 4 (distractors from
  other lines) — and grow the bank to 60+. Keep `pickQuiz` behavior and the
  ≥2 handwritten guarantee.

## Round 3 checklist (update as you go)

- [x] R1 — audition feature removed
  - Deleted `/audition`, `voice-audition.tsx`, `AUDITION_CAST`, the `audition` field on character voices, cover/header links, and `public/lessons/ep05/auditions/` (5 mp3s).
  - README no longer mentions the audition page. Cover still has quiz + study cards; Training is added in T3.
- [x] T2 — quiz kit + pinyin toggle (wired into /quiz)
  - New `quiz-kit.tsx` (`usePinyinPref`, `PinyinToggle`, choice/reveal/score-card, tap-to-play helper). Preference key `hwk-ep05:quiz-pinyin:v1`, default ON, read after mount.
  - History entries now include `mode`; missing mode counts as `"quiz"`. `/quiz` filters to that mode, shows the toggle, and hides beat-pinyin beside `promptZh` / in the reveal when off.
- [x] T3 — /train hub + cover cards
  - `/train` hub matches `/study` furniture: six mode cards with icon, blurb, and best/attempts (flashcards shows SRS due count, 0 until cards are graded).
  - Cover and player header now point to Training / Exit quiz / Study guide.
- [x] Q1 — listening quiz
  - `/train/listening`: 8 questions after mount from dialogue beats with ≥6 Han characters. Large tap-to-play chinese clip, 4 English choices from similar-length lines, reveal Chinese + pinyin (toggle) and jump link. History `mode: "listening"`.
- [x] Q2 — match the audio
  - `/train/match-audio`: 8 rounds. Written English + Chinese (pinyin if on), three tap-to-play clips (one match, two similar-length decoys), lock in A/B/C. Reveal labels the match and prints all three Chinese lines. History `mode: "match-audio"`.
- [x] Q3 — flashcards + SRS
  - Deck is every vocab item plus every idiom. Session: due (shuffled) then new, 15 max. Again = due now; Good/Easy seed 1d/3d then double interval, cap 30d, stored at `hwk-ep05:srs:v1`.
  - Front is Chinese + "hear it in the show"; back shows English/note and pinyin (toggle, or a second "show pinyin" tap). Hub due count includes unseen cards.
- [x] Q4 — who said it?
  - `/train/who-said-it`: 8 rounds from `spokenByCast()` (夏雪 / 刘梅 / 夏东海 / 夏雨). Large tap-to-play chinese clip, four character chips with `EP05_META` colors, reveal scene still + Chinese/pinyin/English + speaker. History `mode: "who-said-it"`.
- [x] Q5 — tone drill
  - `/train/tones`: 8 vocab items whose pinyin has tone marks. Chinese + first `heardAt` chinese clip, four deterministic variants of the first toned vowel (e.g. hàozi / háozi / hǎozi / hāozi). Pinyin toggle hidden. Reveal English + jump. History `mode: "tones"`.
- [x] B1 (optional) — written bank v2
  - `generateSentenceQuestions()` adds one item per quizable dialogue line (Chinese prompt, English among 4, nearest-length distractors). `pickQuiz` still always includes ≥2 handwritten. Bank is 185 (was ~33).

---

## Archive — Round 2 (learning loop): shipped in PR #4

All 8 tasks completed (lint fix, progress tracking, cover progress line, CSV
export + studied badges, generated quiz bank + sampler, quiz history, episode
registry). One review fix by Claude: the `?beat=` deep link moved into the
mount restore effect after the lazy-initializer approach hydration-mismatched
(React #418).
