/*
 * AGENT-TASK(4) [multi-episode prep — OPTIONAL, structure only]
 * Brief + workflow: /CURSOR-TASKS.md. Attempt only after tasks 5, 1, 2, 3 are
 * done and green.
 * Goal: make adding episode 2 a data drop, not a code change. Introduce an
 * EpisodeMeta interface and an EPISODES registry keyed by episode id (e.g.
 * "ep05"), with EP05_META as its first entry (keep the named export as an
 * alias so nothing breaks). Parameterize the hardcoded "ep05" path segments
 * in lib/voices.ts (audioPath), lib/lesson-utils.ts (GHIBLI_BASE/FRAMES_BASE)
 * and the storage keys in lib/player-storage.ts ("hwk-ep05:*") to derive from
 * an episode id, defaulting to "ep05". NO UI changes, NO new routes — same
 * rendered output as before, verified by npm run build.
 * When done, replace this block with: AGENT-DONE(4): <summary>.
 */
export const EP05_META = {
  series: "家有儿女",
  seriesEn: "Home With Kids",
  episode: 5,
  /** Ghibli-stylized frame used as the title cover background */
  coverSource: "00m02s_001_来 宝贝 喝点牛奶.jpg",
  title: "猫鼠之争",
  titlePinyin: "Māo shǔ zhī zhēng",
  titleEn: "Cat vs. Mouse",
  taglineZh: "互动中文字幕 · 全集对白",
  taglineEn: "Interactive Mandarin — full episode dialogue",
  year: "2004",
  characters: [
    { name: "夏雪", nameEn: "Xia Xue", color: "bg-red-400" },
    { name: "刘梅", nameEn: "Liu Mei", color: "bg-pink-400" },
    { name: "夏东海", nameEn: "Donghai", color: "bg-blue-400" },
    { name: "夏雨", nameEn: "Xia Yu", color: "bg-green-400" },
  ],
} as const;
