import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-serif-sc",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const SITE_URL = "https://home-with-kids-ep05.vercel.app";
const TITLE = "Learn Chinese — 家有儿女 EP5";
const DESCRIPTION =
  "Study Home With Kids episode 5 猫鼠之争 line by line: 173 lines of dialogue with character voices, tappable word hints, flashcards, and 19 training modes.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Child pages set their own full titles (e.g. "Training — 家有儿女 EP5"),
  // so no template here — it would double the suffix.
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "家有儿女 EP5",
  keywords: [
    "learn Chinese", "Mandarin", "家有儿女", "Home With Kids",
    "Chinese subtitles", "pinyin", "HSK", "listening practice", "flashcards",
  ],
  // The icon / opengraph-image / twitter-image files in this folder supply the
  // image tags; everything here is the text around them.
  openGraph: {
    type: "video.episode",
    siteName: "Learn Chinese with Home With Kids",
    title: "猫鼠之争 — Cat vs. Mouse (Episode 5)",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "猫鼠之争 — Learn Chinese with Home With Kids EP5",
    description: DESCRIPTION,
  },
  appleWebApp: { capable: true, title: "家有儿女 EP5", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSC.variable} h-full antialiased`}
    >
      <body className="h-full font-sans">{children}</body>
    </html>
  );
}
