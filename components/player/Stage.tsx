"use client";

import { useEffect, useRef } from "react";
import type { EpisodeDTO } from "@/lib/types";
import { usePlayer } from "./PlayerProvider";

/**
 * Reserves a 16:9 slot on the watch page. The persistent player positions itself over this slot,
 * so playback carries on uninterrupted when the visitor navigates away (it docks as a mini player).
 */
export function Stage({ episode, queue, listId }: { episode: EpisodeDTO; queue: EpisodeDTO[]; listId?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { registerStage, current, play, queue: activeQueue } = usePlayer();

  useEffect(() => {
    registerStage(ref.current);
    return () => registerStage(null);
  }, [registerStage]);

  useEffect(() => {
    if (current?.videoId === episode.videoId) return;
    const inQueue = activeQueue.some((e) => e.videoId === episode.videoId);
    play(episode, inQueue ? activeQueue : queue, { listId });
    // Only react to the page's episode changing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode.videoId]);

  return (
    <div ref={ref} className="relative aspect-video w-full overflow-hidden rounded-md bg-room">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={episode.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 blur-sm" />
    </div>
  );
}
