"use client";

import { useRouter } from "next/navigation";
import type { EpisodeDTO } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { usePlayer } from "./PlayerProvider";

type Props = {
  episode: EpisodeDTO;
  queue?: EpisodeDTO[];
  listId?: string;
  label?: string;
  variant?: "brass" | "ghost" | "icon";
  /** Open the watch page as well as starting playback */
  navigate?: boolean;
  className?: string;
};

export function PlayButton({ episode, queue, listId, label = "Play", variant = "brass", navigate = true, className = "" }: Props) {
  const router = useRouter();
  const { play, current, playing, toggle } = usePlayer();
  const isCurrent = current?.videoId === episode.videoId;

  const onClick = () => {
    if (isCurrent && !navigate) return toggle();
    play(episode, queue, { listId });
    if (navigate) router.push(`/watch/${episode.videoId}${listId ? `?list=${listId}` : ""}`);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={onClick}
        className={`grid size-11 shrink-0 place-items-center rounded-full bg-ivory text-ink transition-colors hover:bg-brass-soft ${className}`}
        aria-label={isCurrent && playing ? `Pause ${episode.title}` : `Play ${episode.title}`}
      >
        <Icon name={isCurrent && playing && !navigate ? "pause" : "play"} size={17} />
      </button>
    );
  }

  return (
    <button onClick={onClick} className={`btn ${variant === "brass" ? "btn-brass" : "btn-ghost"} ${className}`}>
      <Icon name="play" size={16} />
      {isCurrent && playing ? "Now playing" : label}
    </button>
  );
}
