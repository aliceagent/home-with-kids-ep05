import type { MetadataRoute } from "next";

/** Home-screen identity when the player is installed as a PWA */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Learn Chinese — 家有儿女 EP5",
    short_name: "家有儿女 EP5",
    description:
      "Study Home With Kids episode 5 猫鼠之争 line by line, with character voices, flashcards, and training modes.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0a09",
    theme_color: "#0c0a09",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
