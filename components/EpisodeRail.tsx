"use client";

import Link from "next/link";
import type { EpisodeDTO } from "@/lib/types";
import { formatLongDuration } from "@/lib/format";
import { usePlayer } from "./player/PlayerProvider";
import { Thumb } from "./ui/Thumb";

/** Horizontal rail of 16:9 episode tiles, used for "latest" rows. */
export function EpisodeRail({ episodes, progress }: { episodes: EpisodeDTO[]; progress?: Record<string, number> }) {
  const { play } = usePlayer();
  return (
    <div className="scroll-row -mx-5 scroll-px-5 lg:scroll-px-10 auto-cols-[78%] gap-4 px-5 sm:auto-cols-[44%] lg:-mx-10 lg:auto-cols-[30%] lg:px-10 2xl:auto-cols-[23%]">
      {episodes.map((ep) => (
        <Link key={ep.videoId} href={`/watch/${ep.videoId}`} onClick={() => play(ep, episodes)} className="group block">
          <div className="relative aspect-video overflow-hidden rounded-[3px] bg-room">
            <Thumb src={ep.thumbnail} className="h-full w-full object-cover transition-transform duration-700 ease-(--ease-studio) group-hover:scale-[1.03]" />
            {ep.durationSeconds > 0 && (
              <span className="absolute right-2 bottom-2 rounded-sm bg-ink/80 px-1.5 py-0.5 text-xs text-ivory tabular-nums backdrop-blur">
                {formatLongDuration(ep.durationSeconds)}
              </span>
            )}
            {progress?.[ep.videoId] !== undefined && (
              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-ink/60">
                <span className="block h-full bg-brass" style={{ width: `${Math.max(4, progress[ep.videoId] * 100)}%` }} />
              </span>
            )}
          </div>
          <p className="mt-3 line-clamp-2 leading-snug font-medium text-ivory transition-colors group-hover:text-brass-soft">
            {ep.title}
          </p>
          <p className="mt-1 text-[0.8125rem] text-sage">{ep.showTitle}</p>
        </Link>
      ))}
    </div>
  );
}
