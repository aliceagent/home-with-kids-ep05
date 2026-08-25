import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Lesson MP3s are immutable per deploy. Long cache so the player can
   * prefetch upcoming lines without re-downloading on every visit.
   */
  async headers() {
    return [
      {
        source: "/lessons/ep05/audio/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  /**
   * The dev server is reached through a port-forwarding proxy, so requests for
   * dev resources arrive with a different origin than the bind address. Without
   * these entries Next blocks the static chunks and the browser keeps serving
   * whatever JS it already had cached.
   */
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "0.0.0.0",
    "[::1]",
    "::1",
    "172.30.0.2",
    "172.17.0.1",
    "*.cursor.sh",
    "*.cursor.com",
  ],
};

export default nextConfig;
