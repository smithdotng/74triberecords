import type { IconName } from "@/components/ui/Icon";

export const NAV: { href: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { href: "/", label: "Home", icon: "home", match: (p) => p === "/" },
  { href: "/shows", label: "Shows", icon: "shows", match: (p) => p.startsWith("/shows") },
  { href: "/reels", label: "Reels", icon: "reel", match: (p) => p.startsWith("/reels") },
  { href: "/search", label: "Search", icon: "search", match: (p) => p.startsWith("/search") },
  { href: "/library", label: "Library", icon: "library", match: (p) => p.startsWith("/library") },
];
