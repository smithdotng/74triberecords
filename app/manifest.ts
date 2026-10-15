import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "74 Tribe Studios",
    short_name: "74 Tribe",
    description: "Watch every show from 74 Tribe Studios and build your own playlists.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "any",
    background_color: "#0c231e",
    theme_color: "#0c231e",
    categories: ["entertainment", "podcasts", "video"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Shows", url: "/shows", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Your library", url: "/library", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Search", url: "/search", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Book a session", url: "/book", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
