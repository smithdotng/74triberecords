"use client";

import Link from "next/link";
import type { EpisodeDTO } from "@/lib/types";
import { formatDate, formatLongDuration } from "@/lib/format";
import { usePlayer } from "./player/PlayerProvider";
import { AddToPlaylist } from "./AddToPlaylist";
import { Thumb } from "./ui/Thumb";
import { Icon } from "./ui/Icon";
import type { ReactNode } from "react";

type Props = {
  episodes: EpisodeDTO[];
  listId?: string;
  showShow?: boolean;
  /** Extra controls rendered at the end of each row (e.g. reorder/remove in a playlist) */
  actions?: (ep: EpisodeDTO, i: number) => ReactNode;
};

/** A tracklist: wide rows with a thumbnail, not a grid of cards. */
export function EpisodeList({ episodes, listId, showShow = true, actions }: Props) {
  const { current, playing, play } = usePlayer();
  const href = (id: string) => `/watch/${id}${listId ? `?list=${listId}` : ""}`;

  return (
    <ol className="divide-y divide-seam/70 border-y hairline">
      {episodes.map((ep, i) => {
        const isCurrent = current?.videoId === ep.videoId;
        return (
          <li key={ep.videoId} className="group relative flex items-center gap-4 py-3.5 sm:gap-5 sm:py-4">
            <Link
              href={href(ep.videoId)}
              onClick={() => play(ep, episodes, { listId })}
              className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-[3px] bg-room sm:w-44"
            >
              <Thumb src={ep.thumbnail} className="h-full w-full object-cover transition-transform duration-700 ease-(--ease-studio) group-hover:scale-[1.03]" />
              {isCurrent && (
                <span className="absolute inset-0 grid place-items-center bg-ink/55 text-brass">
                  <span className={`eq flex h-4 items-end gap-[3px] ${playing ? "" : "paused"}`} aria-hidden>
                    <span className="h-4" />
                    <span className="h-4" />
                    <span className="h-4" />
                  </span>
                </span>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                href={href(ep.videoId)}
                onClick={() => play(ep, episodes, { listId })}
                className={`line-clamp-2 text-[0.98rem] leading-snug font-medium transition-colors sm:text-[1.05rem] ${
                  isCurrent ? "text-brass-soft" : "text-ivory hover:text-brass-soft"
                }`}
              >
                <span className="absolute inset-0 sm:hidden" aria-hidden />
                {ep.title}
              </Link>
              <p className="mt-1 flex flex-wrap gap-x-3 text-[0.8125rem] text-sage">
                {showShow && ep.showTitle && (
                  <Link href={`/shows/${ep.showSlug}`} className="relative z-1 hover:text-ivory">
                    {ep.showTitle}
                  </Link>
                )}
                {ep.publishedAt && <time dateTime={ep.publishedAt}>{formatDate(ep.publishedAt)}</time>}
                {ep.durationSeconds > 0 && (
                  <span className="inline-flex items-center gap-1 text-moss">
                    <Icon name="clock" size={13} />
                    {formatLongDuration(ep.durationSeconds)}
                  </span>
                )}
              </p>
            </div>

            <div className="relative z-1 flex shrink-0 items-center gap-1">
              <AddToPlaylist episode={ep} />
              {actions?.(ep, i)}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
