# Learn Chinese with 家有儿女

Full-episode interactive player and video-ready lesson packs for *Home With Kids* EP5 **猫鼠之争**.

## Deploy (Vercel)

The Next.js app lives in `web/`. On Vercel, set **Root Directory** to `web`.

**Current production:** https://home-with-kids-player.vercel.app

The first Vercel project (`home-with-kids-ep05`) only built once from Cursor Origin. Use **home-with-kids-player** for ongoing deploys.

```bash
cd web
npx vercel --prod --yes
```

Pre-generated scene audio and Ghibli frames are in `web/public/lessons/`. Playback does not need an API key. Optional on-demand TTS (`POST /api/tts`) needs `XAI_API_KEY` in the Vercel project environment.

## Full episode player

```bash
cd web
npm install
npm run dev
```

The dev script binds `0.0.0.0:4318` so the app is reachable through a
port-forwarding proxy, not just from inside the machine. `next.config.ts` lists
the matching `allowedDevOrigins`; without them Next 16 blocks its own dev chunks
and the browser silently keeps serving stale JavaScript.

Open http://127.0.0.1:4318 — press **Play scene** to watch **every dialogue line** from the episode (0:02–13:12 from screenshots), with:

- Ghibli-stylized scene frames (img2img via xAI, 4:3)
- Speaker-coloured subtitles (中文 / pinyin / English toggles)
- Character voices via xAI TTS
- Bottom control bar — uninterrupted playback

**Study guide:** http://127.0.0.1:4318/study — searchable vocabulary decks, 成语 idioms, grammar ladders, Beijing colloquial notes, culture cards.

**Exit quiz:** http://127.0.0.1:4318/quiz — five questions on 耗子, 咱, 好不容易, the 比 ladder, and 阿姨.

**Voice audition:** http://127.0.0.1:4318/audition — 30-second samples for each cast voice.

## Teaching curriculum

All teaching content lives in `web/src/data/curriculum.ts`, anchored to dialogue beat ids so pauses land right after the line the learner just heard.

| Track | Contents |
|---|---|
| 北京话 Beijing speech | 耗子 vs 老鼠 register switch, inclusive 咱, sentence-final 呀/呢/啊 |
| 成语 Idioms | 臭味相投, 好不容易 (false friend), 自讨苦吃, 幸灾乐祸, 眼不见心不烦, 打个预防针 |
| Grammar | 3-step 比 ladder (比…都 / 比…还 / 比较), 不但不…反而, 至于吗, 反而会 |
| Vocabulary decks | Pop music, ball sports, mice & fear, family & address, colloquialisms, school |
| Culture | 阿姨 as address term, F4 and 2004 fandom, 大片 VCD era, 语文作文 |

Dialogue lines anchored to a Beijing feature also show an inline badge under the subtitle during playback.

### Rebuild the pipeline

```bash
cd web
npm run build:beats          # screenshots → dialogue beats
npm run clean:dialogue       # repair OCR damage, fix speakers
npm run fill:pinyin
npm run translate:episode    # needs XAI_API_KEY
npm run inject:teaching      # curriculum → teaching pauses (idempotent)
npm run generate:audio       # TTS for dialogue + narrator cards
```

### Rebuild dialogue from screenshots

```bash
cd web
npm run build:beats              # parse /workspace/screenshots → ep05-beats.json
npm run translate:episode        # fill English (needs XAI_API_KEY)
npm run generate:audio           # TTS for all beats
```

**Coverage:** 213 screenshots → ~182 dialogue beats through **13:12**. The episode is ~25 min; the second half (13:12–25:00) needs the source video or additional screenshots.

### Character voices (xAI TTS)

| Character | Voice |
|---|---|
| 夏雪 | `eve` (young female) |
| 刘梅 | `ara` (adult female) |
| 夏东海 | `rex` (adult male) |
| 夏雨 | `leo` (young male) |

Audio: `web/public/lessons/ep05/audio/` · Ghibli frames: `web/public/lessons/ep05/ghibli-4x3/` · Raw frames: `web/public/lessons/ep05/frames/`

### Ghibli stylization (img2img)

All screenshots are transformed into Studio Ghibli–style illustrations via xAI `grok-imagine-image-2.0`:

```bash
cd web
npm run stylize:ghibli -- --concurrency 3   # all 213 frames (~15 min)
npm run stylize:ghibli -- --limit 5         # test a few
```

Requires `XAI_API_KEY` in `web/.env.local`. Skips already-generated files; re-run to fill gaps.

## Lesson 1 pack (video editing)

**Location:** `lessons/ep05/lesson-01/` — curated opening scene + Ghibli slides for YouTube lessons.

See `lessons/ep05/lesson-01/script.md` and `video/beats.json`.
