import { TranscriptReader } from "@/components/lesson/transcript-reader";

export const metadata = {
  title: "Transcript — 家有儿女 EP5",
  description:
    "Read every line of Home With Kids EP5, grouped by chapter, with pinyin, English, per-line audio, and player jump links",
};

export default function TranscriptPage() {
  return <TranscriptReader />;
}
