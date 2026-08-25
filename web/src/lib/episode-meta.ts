/** AGENT-DONE(4): EpisodeMeta + EPISODES registry; audio/image/storage paths derive from episode id (default ep05). Named EP05_META export kept. */

export const DEFAULT_EPISODE_ID = "ep05";

export interface EpisodeCharacter {
  name: string;
  nameEn: string;
  color: string;
}

export interface EpisodeMeta {
  id: string;
  series: string;
  seriesEn: string;
  episode: number;
  /** Ghibli-stylized frame used as the title cover background */
  coverSource: string;
  title: string;
  titlePinyin: string;
  titleEn: string;
  taglineZh: string;
  taglineEn: string;
  year: string;
  characters: readonly EpisodeCharacter[];
}

export const EP05_META = {
  id: DEFAULT_EPISODE_ID,
  series: "家有儿女",
  seriesEn: "Home With Kids",
  episode: 5,
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
} as const satisfies EpisodeMeta;

export const EPISODES: Record<string, typeof EP05_META> = {
  [EP05_META.id]: EP05_META,
};
