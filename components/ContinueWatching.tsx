"use client";

import { useEffect, useState } from "react";
import { readHistory, type HistoryEntry } from "./player/history";
import { EpisodeRail } from "./EpisodeRail";

export function ContinueWatching() {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const load = () =>
      setItems(readHistory().filter((h) => h.seconds > 30 && (!h.duration || h.seconds < h.duration - 30)).slice(0, 10));
    load();
    window.addEventListener("t74:history", load);
    return () => window.removeEventListener("t74:history", load);
  }, []);

  if (!items.length) return null;

  return (
    <section className="mt-16" aria-labelledby="continue">
      <h2 id="continue" className="display mb-6 text-[1.9rem] sm:text-4xl">
        Pick up where you left off
      </h2>
      <EpisodeRail
        episodes={items.map((i) => i.episode)}
        progress={Object.fromEntries(items.map((i) => [i.episode.videoId, i.duration ? i.seconds / i.duration : 0]))}
      />
    </section>
  );
}
