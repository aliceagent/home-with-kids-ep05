import type { Beat } from "./types";

export type ChapterDef = {
  id: string;
  startBeatId: string;
  thumbBeatId?: string;
  timeLabel: string;
  titleZh: string;
  titleEn: string;
  blurb: string;
};

export type Chapter = ChapterDef & {
  startIndex: number;
  endIndex: number;
  thumbBeat: Beat;
};

export const CHAPTER_DEFS: ChapterDef[] = [
  {
    id: "f4",
    startBeatId: "001",
    timeLabel: "0:02",
    titleZh: "牛奶与 F4",
    titleEn: "Milk and F4",
    blurb: "Xia Yu pours milk. Xue tests whether Auntie is a real F4 fan.",
  },
  {
    id: "karaoke",
    startBeatId: "017",
    thumbBeatId: "018",
    timeLabel: "1:08",
    titleZh: "阿姨开唱",
    titleEn: "Auntie sings",
    blurb: "Liu Mei launches into a stormy love song — lyrics and all.",
  },
  {
    id: "hobbies",
    startBeatId: "021",
    timeLabel: "3:12",
    titleZh: "共同的爱好",
    titleEn: "Shared hobbies",
    blurb:
      "Donghai rattles off sports. Bonding with the kids is harder than it looks.",
  },
  {
    id: "afraid",
    startBeatId: "041",
    thumbBeatId: "042",
    timeLabel: "4:22",
    titleZh: "最怕耗子",
    titleEn: "Terrified of mice",
    blurb: "Liu Mei draws a hard line: anything but mice.",
  },
  {
    id: "movie",
    startBeatId: "043",
    thumbBeatId: "048",
    timeLabel: "4:30",
    titleZh: "耗子大片",
    titleEn: "The mouse movie",
    blurb: "Xue brings home a blockbuster. Xia Yu thinks mice are adorable.",
  },
  {
    id: "haozi",
    startBeatId: "071",
    timeLabel: "6:32",
    titleZh: "和耗子争宠",
    titleEn: "Compete with Haozi",
    blurb: "She cannot admit the fear — the mouse is her bridge to Xue.",
  },
  {
    id: "photo",
    startBeatId: "091",
    thumbBeatId: "100",
    timeLabel: "7:54",
    titleZh: "贴在卧室",
    titleEn: "Photo on the wall",
    blurb: "A mouse photo is going up in the bedroom. Liu Mei panics politely.",
  },
  {
    id: "live",
    startBeatId: "137",
    thumbBeatId: "140",
    timeLabel: "10:26",
    titleZh: "活的小耗子",
    titleEn: "A live mouse",
    blurb: "Homework upgrade: Xue is now observing a real mouse.",
  },
  {
    id: "expert",
    startBeatId: "153",
    thumbBeatId: "170",
    timeLabel: "11:14",
    titleZh: "老鼠专家",
    titleEn: "Rat expert",
    blurb: "Liu Mei bluffs expertise — then has to feed the thing.",
  },
];

export function buildChapters(beats: Beat[]): Chapter[] {
  const chapters: Chapter[] = [];
  for (let i = 0; i < CHAPTER_DEFS.length; i++) {
    const def = CHAPTER_DEFS[i];
    const startIndex = beats.findIndex((beat) => beat.id === def.startBeatId);
    if (startIndex < 0) continue;
    const next = CHAPTER_DEFS[i + 1];
    const nextStart = next
      ? beats.findIndex((beat) => beat.id === next.startBeatId)
      : beats.length;
    const endIndex = nextStart > startIndex ? nextStart - 1 : beats.length - 1;
    const thumbIndex = def.thumbBeatId
      ? beats.findIndex((beat) => beat.id === def.thumbBeatId)
      : startIndex;
    const thumbBeat = beats[thumbIndex >= 0 ? thumbIndex : startIndex];
    chapters.push({
      ...def,
      startIndex,
      endIndex,
      thumbBeat,
    });
  }
  return chapters;
}

export function currentChapter(chapters: Chapter[], index: number) {
  let found: Chapter | null = null;
  for (const chapter of chapters) {
    if (chapter.startIndex <= index) found = chapter;
  }
  return found;
}
