# Home With Kids · EP5 lesson player

A Next.js app that turns one episode of 家有儿女 (Home With Kids), S1E5
"猫鼠之争" (Cat vs. Mouse), into an interactive Mandarin lesson: a
scene-by-scene player with synced Chinese/pinyin/English subtitles,
narrated teaching pauses (grammar, idioms, vocabulary, Beijing dialect
notes, culture), a searchable study guide, and a five-question exit quiz.

## Getting started

```bash
npm ci          # install dependencies
npm run dev     # start the dev server on :4318
npm run build   # production build
npm run lint    # eslint
```

No API key is needed to run the app — all lesson content, audio, and
images are pre-generated and committed under `public/` and `src/data/`.

## Content pipeline (`scripts/`)

These scripts regenerate the lesson data and are only needed when
producing a new episode or reprocessing this one. They are **not** run
at request time. Run in this rough order:

| Script | Command | What it does |
| --- | --- | --- |
| `build-episode-beats.mjs` | `npm run build:beats` | Builds `src/data/ep05-beats.json` from OCR'd screenshot frames plus a curated opening. |
| `clean-dialogue.mjs` | `npm run clean:dialogue` | Repairs OCR noise in the extracted dialogue (near-duplicate/garbled lines). |
| `fill-pinyin.mjs` | `npm run fill:pinyin` | Fills empty pinyin fields from the Chinese text. |
| `translate-episode.mjs` | `npm run translate:episode` | Fills empty English translations via the xAI chat API. |
| `inject-teaching-beats.mjs` | `npm run inject:teaching` | Weaves the teaching curriculum (`src/data/curriculum.ts`) into the dialogue timeline as pause beats — idempotent, safe to re-run after editing the curriculum. |
| `generate-audio.mjs` | `npm run generate:audio` | Generates TTS narration clips for every beat via the xAI TTS API. |
| `stylize-ghibli.mjs` | `npm run stylize:ghibli` | Ghibli-style img2img stylization of the episode screenshots via the xAI Imagine API. |

The scripts that call out to xAI (`translate-episode`, `generate-audio`,
`stylize-ghibli`) need `XAI_API_KEY` in `.env.local` locally — the
committed npm scripts load it with `node --env-file=.env.local`. The
other scripts only touch local files and need no key.

## Assets

Generated lesson assets live under `public/lessons/ep05/`:

- `frames/` — raw OCR'd screenshot frames, one per dialogue beat.
- `ghibli-4x3/` — Ghibli-stylized 4:3 versions of those frames, used as the on-screen scene art.
- `audio/` — per-beat TTS clips (`<beatId>-chinese.mp3`, `-english.mp3`, `-pinyin.mp3`, plus narrator audio for teaching beats).
- `auditions/` — one sample clip per character voice, used on `/audition`.

## App structure

- `/` — the player (`src/components/lesson/lesson-viewer.tsx` + `smart-player.tsx`), supports `?beat=<id>` deep links into a specific line.
- `/study` — searchable study guide across vocab decks, idioms, grammar, Beijing dialect notes, and culture cards (`src/data/curriculum.ts`).
- `/quiz` — the five-question exit quiz (`src/data/quiz.ts`).
- `/audition` — voice samples for each character.

Lesson content lives in `src/data/ep05-beats.json` (the playable
timeline) and `src/data/curriculum.ts` (the teaching material that gets
injected into it).
