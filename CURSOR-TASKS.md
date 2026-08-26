# Task brief for the Cursor agent — Round 5: enrich the lesson with more teaching cards

Jonathan wants many more in-player teaching pauses (the "story interruption"
cards: grammar, idioms, vocabulary, decks, teaching notes, Beijing dialect,
culture, drills) woven through the episode. This is a CONTENT round — the
player, settings, and card renderer already support everything; you are
authoring data.

## How to work this brief

1. **Branch**: `cursor/round-5-teaching-cards` cut from the LATEST `main`
   (fetch first). Open a PR to `main` when done (do NOT merge it — the
   reviewing agent verifies and merges).
2. One commit per task below. Before every commit: `cd web && npm run build`
   passes; `npm run lint` adds nothing beyond baseline (0 errors, 2 warnings:
   chapter-picker `no-img-element`, build-episode-beats unused var).
3. Leave `AGENT-DONE(<id>)` notes and update the checklist below (bullets per
   task, deviations included).

## Content ground rules (this round's most important section)

- **Accuracy above quantity.** Every card must teach something true about a
  REAL line in `web/src/data/ep05-beats.json`. Read the surrounding dialogue
  before writing a card. Never invent lines, translations, or facts. Pinyin
  always carries tone marks.
- **Follow the existing beat conventions exactly** (inspect several existing
  teaching beats first):
  - id: `<anchorDialogueId>-t-<kind>-<slug>` where kind ∈ gr | idiom | vocab |
    note | bj | cul | deck (e.g. `042-t-bj-haozi`). NEVER change or renumber
    an existing beat's id, and never reorder existing entries — insert new
    beats at the correct timeline position immediately after their anchor
    line, with the anchor line's timestamp.
  - Every card gets `narratorScript` (a short spoken-English explanation, in
    the voice/style of the existing ones). There is NO API key available, so
    do NOT generate audio — cards must read well silently (the player already
    holds silent cards for their reading time). The scripts make audio
    generation possible later.
  - Use the type-specific fields the renderer supports (see
    `web/src/types/lesson.ts` and existing examples): grammar cards want
    `example`/`examplePinyin`/`exampleEnglish` and, where natural, a
    `drill` + `drillAnswer` and `ladder`; idiom cards want `literal` and
    `trap`; beijing cards want `standard` (and the anchor line should carry a
    `beijingTags` entry if it lacks one); culture cards want `cultureBody`;
    decks want `deckTitle`/`deckTitleEn`/`deckTheme`/`deckItems` (each item
    chinese/pinyin/english + optional note/breakdown); vocab/note cards use
    `chinese`/`pinyin`/`english` + `notes`/`breakdown`.
- **Placement**: spread the new cards across the WHOLE episode. Current gaps
  to prioritize: ~1:30–3:28, ~2 more per minute through the middle scenes,
  and the nearly-empty stretch 11:04–13:02. A learner in "Full teaching" mode
  should hit a card roughly every 3–5 dialogue lines, never two cards back to
  back except where an existing pair already does that.
- The `vocab` and `note` card types exist in the schema but are currently
  unused — use them (single-word vocabulary spotlights; short teaching notes
  about register, particles, sentence-final 呀/啊/呗, measure words, etc.).

## Tasks

### N1 — Author 30+ new teaching beats in `web/src/data/ep05-beats.json`
Target mix (minimums): 7 grammar (extend existing ladders where real examples
exist — e.g. more 比 steps, 把-sentences, 得 complements, 是…的, rhetorical
questions), 5 idiom/set-phrase, 6 vocab spotlights, 4 teaching notes, 4
Beijing dialect, 3 culture, 3 new vocabulary decks (4–6 items each). Drills
with answers on at least 8 cards. Every card anchored to a real line, inserted
in timeline order, full narratorScript.

### N2 — Extend `web/src/data/curriculum.ts` in sync
Every new idiom, grammar pattern, Beijing note, culture card, and deck (and
any vocab-spotlight word worth reviewing) gets a matching curriculum entry
with correct `anchors`/`heardAt` beat ids. This automatically feeds the study
guide, flashcards, and quiz generators — verify the study-guide tab counts,
flashcard deck size, and generated quiz-bank size all grow, and that
`/train/idioms`, `/train/grammar`, `/train/beijing`, `/train/culture`,
`/train/cloze` still build their question sets without errors.

### N3 — Consistency + verification pass
- A small node script (run ad hoc, do not commit it) or careful manual check
  proving: all beat ids unique; array strictly in timeline order; every
  teaching beat's anchor id exists; every curriculum anchor exists in beats;
  every deckItems entry has chinese+pinyin+english.
- Playthrough check in the browser: land on several new cards via
  `/?beat=<newId>` (cards render, nothing overflows the 4:3 stage — FitScale
  shrinks big cards, but keep deck items ≤6 so they stay readable), and one
  "Full teaching" run across a formerly-empty stretch.
- Update the line/card counts in `web/README.md` if it states any.

## Round 5 checklist (update as you go)

- [ ] N1 — 30+ new teaching beats authored and placed
- [ ] N2 — curriculum extended in sync (study guide / flashcards / quizzes grew)
- [ ] N3 — consistency checks + browser pass

---

## Backlog — Round 4 games (still open, build AFTER round 5 or on request)

Dictation builder (`/train/dictation`), Scene order (`/train/scenes`), Daily
mix (`/train/daily`) + hub cards. Full specs are in the git history of this
file (commit e8699f6 and earlier); ask for them to be restored if you pick
this up.

## Archive

- Round 4 (agents): player line-loop/word-hints/activity (PR #9), transcript +
  progress pages (PR #10), ten quiz modes from Cursor (PRs #11/#12).
- Round 3: training hub + 5 modes, quiz kit + pinyin toggle, audition removed
  (PR #6). Round 2: learning loop (PR #4).
