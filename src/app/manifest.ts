import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "英語學習",
    short_name: "英語學習",
    description: "專為繁體中文使用者設計的英式英語學習應用程式",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
