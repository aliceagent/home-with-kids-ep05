# Lesson 1 — Video Edit Timeline

Use this shot list to assemble the lesson in DaVinci Resolve, CapCut, Premiere, or Final Cut.

**Format:** 1920×1080 (16:9) · 30fps  
**Total runtime:** ~1 min 58 sec (preview) · expand to 8–12 min with VO pauses  
**Assets folder:** `video/slides-16x9/` (ready-made frames) + `video/ghibli-4x3/` (scene art only)

---

## How to use these assets

Each PNG in `slides-16x9/` is a **complete video frame**:
- **Dialogue slides:** 4:3 Ghibli scene (letterboxed) + lower-third with 中文 / pinyin / English
- **Vocab/idiom/grammar slides:** Full-screen teaching card over blurred scene
- **Title/outro slides:** Full-screen text

**Workflow:**
1. Import all slides from `slides-16x9/` in order (01-intro → 18-outro)
2. Set each clip duration from the table below
3. Record voiceover using `script.md` — pause 2–3× longer on dialogue lines for teaching
4. Optional: swap letterboxed scene for full 4:3 Ghibli PNG + your own lower-third

---

## Shot List

| # | File | Duration | Type | Timestamp | Content |
|---|---|---|---|---|---|
| 1 | `01-intro.png` | 5s | title | 0:00 | 来，宝贝 — F4 聊天 |
| 2 | `02.png` | 6s | dialogue | 0:08 | 夏雪：阿姨，你喜欢 F4 吗？ |
| 3 | `03.png` | 4s | dialogue | 0:08 | 刘梅：喜欢呢，真的。 |
| 4 | `04.png` | 6s | dialogue | 0:14 | 刘梅：我觉得他们比 F4 都帅。 |
| 5 | `05.png` | 5s | dialogue | 0:24 | 夏雪：那是什么乐队呀？ |
| 6 | `06.png` | 5s | dialogue | 0:30 | 刘梅：那都是些老乐队。 |
| 7 | `07.png` | 6s | dialogue | 0:36 | 夏雪：还真有研究 |
| 8 | `08.png` | 6s | dialogue | 0:38 | 刘梅：阿姨是老追星族 |
| 9 | `09.png` | 8s | vocab | 0:40 | 追星族 breakdown |
| 10 | `10.png` | 5s | dialogue | 0:48 | 夏雪：《要定你》 |
| 11 | `11.png` | 6s | dialogue | 0:52 | 刘梅：我也喜欢这首 |
| 12 | `12.png` | 6s | dialogue | 0:54 | 夏东海：臭味相投 |
| 13 | `13.png` | 10s | idiom | 0:56 | 臭味相投 deep dive |
| 14 | `14.png` | 7s | dialogue | 0:58 | 不是一家人，不进一家门 |
| 15 | `15.png` | 10s | grammar | 1:00 | A 比 B 都 + Adj |
| 16 | `16.png` | 5s | dialogue | 1:02 | 夏雪：唱两句 |
| 17 | `17.png` | 7s | dialogue | 1:10 | 刘梅 botches F4 lyrics |
| 18 | `18-outro.png` | 5s | outro | 1:12 | Next lesson tease |

**Preview total:** 1:58  
**With VO teaching pauses:** stretch each dialogue slide to 15–30s → ~8–12 min final video

---

## Ghibli 4:3 scene files (no text)

Use these if you want to build your own lower-thirds or cut between original clip + illustration:

| Source screenshot | Ghibli file |
|---|---|
| `00m08s_003_喜欢呢 真的.jpg` | `ghibli-4x3/00m08s_003_喜欢呢 真的.png` |
| `00m16s_006_...` | `ghibli-4x3/00m16s_006_...png` |
| `00m24s_010_...` | `ghibli-4x3/00m24s_010_...png` |
| `00m36s_014_...` | `ghibli-4x3/00m36s_014_...png` |
| `00m38s_015_...` | `ghibli-4x3/00m38s_015_...png` |
| `00m54s_021_...` | `ghibli-4x3/00m54s_021_...png` |
| `00m58s_023_...` | `ghibli-4x3/00m58s_023_...png` |
| `01m02s_024_...` | `ghibli-4x3/01m02s_024_...png` |
| `01m10s_025_...` | `ghibli-4x3/01m10s_025_...png` |

All Ghibli frames are **4:3 (1280×960)** — same aspect ratio as the show.

---

## Regenerate slides

```bash
cd lessons/ep05/lesson-01/video
python3 generate_slides.py      # rebuild 16:9 slides
python3 build_preview.py        # stitch preview MP4
```

## Expand for full lesson video

- Add **repeat drills:** duplicate slides 02–04, hide English on first pass
- Insert **original clips** (fair use, ≤15s) before each Ghibli slide
- Stretch vocab/idiom slides (09, 13, 15) to 30–60s with VO explanation
