import type { Beat } from "@/types/lesson";

export interface EpisodeChapterDef {
  id: string;
  startBeatId: string;
  /** Beat whose still is more recognizable than the opening line */
  thumbBeatId?: string;
  timeLabel: string;
  titleZh: string;
  titleEn: string;
  blurb: string;
}

/** Story beats for 家有儿女 EP5 猫鼠之争 (screenshot coverage 0:02–13:12). */
export const EP05_CHAPTERS: EpisodeChapterDef[] = [
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
    blurb: "Donghai rattles off sports. Bonding with the kids is harder than it looks.",
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

export interface ResolvedChapter extends EpisodeChapterDef {
  startIndex: number;
  endIndex: number;
  thumbBeat: Beat;
}

export function resolveChapters(beats: Beat[]): ResolvedChapter[] {
  const resolved: ResolvedChapter[] = [];

  for (let i = 0; i < EP05_CHAPTERS.length; i++) {
    const def = EP05_CHAPTERS[i];
    const startIndex = beats.findIndex((b) => b.id === def.startBeatId);
    if (startIndex < 0) continue;

    const nextDef = EP05_CHAPTERS[i + 1];
    const nextIndex = nextDef
      ? beats.findIndex((b) => b.id === nextDef.startBeatId)
      : beats.length;
    const endIndex = nextIndex > startIndex ? nextIndex - 1 : beats.length - 1;

    const thumbIndex = def.thumbBeatId
      ? beats.findIndex((b) => b.id === def.thumbBeatId)
      : startIndex;
    const thumbBeat = beats[thumbIndex >= 0 ? thumbIndex : startIndex];

    resolved.push({
      ...def,
      startIndex,
      endIndex,
      thumbBeat,
    });
  }

  return resolved;
}

export function chapterAtIndex(
  chapters: ResolvedChapter[],
  index: number,
): ResolvedChapter | null {
  let current: ResolvedChapter | null = null;
  for (const chapter of chapters) {
    if (chapter.startIndex <= index) current = chapter;
  }
  return current;
}
