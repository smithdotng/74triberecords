"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { EpisodeDTO } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import { usePlayer } from "./player/PlayerProvider";
import { Thumb } from "./ui/Thumb";

export function UpNext({
  title,
  episodes,
  listId,
  currentId,
}: {
  title: string;
  episodes: EpisodeDTO[];
  listId?: string;
  currentId: string;
}) {
  const { play, playing } = usePlayer();
  const activeRef = useRef<HTMLLIElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const idx = episodes.findIndex((e) => e.videoId === currentId);

  useEffect(() => {
    // Scroll only the list, never the page
    const list = listRef.current;
    const el = activeRef.current;
    if (list && el) list.scrollTop = Math.max(0, el.offsetTop - 8);
  }, [currentId]);

  if (episodes.length <= 1) return null;

  return (
    <div className="xl:sticky xl:top-8">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id="upnext" className="display truncate text-2xl">
          {title}
        </h2>
        <span className="shrink-0 text-sm text-moss tabular-nums">
          {idx + 1} of {episodes.length}
        </span>
      </div>
      <ol ref={listRef} className="relative max-h-[70vh] space-y-1 overflow-y-auto pr-1">
        {episodes.map((ep, i) => {
          const active = ep.videoId === currentId;
          return (
            <li key={ep.videoId} ref={active ? activeRef : undefined}>
              <Link
                href={`/watch/${ep.videoId}${listId ? `?list=${listId}` : ""}`}
                onClick={() => play(ep, episodes, { listId })}
                scroll={false}
                aria-current={active ? "true" : undefined}
                className={`group flex gap-3 rounded-md p-2 transition-colors ${active ? "bg-room" : "hover:bg-room/60"}`}
              >
                <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-[3px] bg-room">
                  <Thumb src={ep.thumbnail} className="h-full w-full object-cover" />
                  {ep.durationSeconds > 0 && (
                    <span className="absolute right-1 bottom-1 rounded-sm bg-ink/85 px-1 text-[0.7rem] text-ivory tabular-nums">
                      {formatDuration(ep.durationSeconds)}
                    </span>
                  )}
                </span>
                <span className="min-w-0 py-0.5">
                  <span className={`line-clamp-2 text-sm leading-snug ${active ? "text-brass-soft" : "text-ivory group-hover:text-brass-soft"}`}>
                    {ep.title}
                  </span>
                  <span className="mt-1 block text-xs text-moss">
                    {active ? (playing ? "Playing now" : "Paused") : i === idx + 1 ? "Up next" : ep.showTitle}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
