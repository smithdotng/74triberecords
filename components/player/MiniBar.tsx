"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { usePlayer } from "./PlayerProvider";

export function MiniBar() {
  const { current, playing, toggle, next, prev, close, progress, queue, index, listId } = usePlayer();
  if (!current) return null;
  const pct = progress.duration ? Math.min(100, (progress.seconds / progress.duration) * 100) : 0;
  const href = `/watch/${current.videoId}${listId ? `?list=${listId}` : ""}`;
  const hasNext = index + 1 < queue.length;

  return (
    <div
      className="sheet-enter fixed right-0 left-0 z-60 border-t hairline bg-room/95 backdrop-blur-xl lg:left-(--sidebar-w)"
      style={{ bottom: "calc(var(--tabbar-h) + env(safe-area-inset-bottom))", height: "var(--minibar-h)" }}
      role="region"
      aria-label="Now playing"
    >
      <div className="absolute top-0 right-0 left-0 h-px bg-seam">
        <div className="h-full bg-brass transition-[width] duration-1000 ease-linear" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex h-full items-center gap-3 pr-2 pl-[104px] lg:gap-6 lg:pr-6 lg:pl-[150px]">
        <Link href={href} className="min-w-0 flex-1 group">
          <p className="truncate text-[0.9375rem] font-medium text-ivory group-hover:text-brass-soft">{current.title}</p>
          <p className="truncate text-[0.8125rem] text-sage">{current.showTitle}</p>
        </Link>

        <div className="flex items-center gap-1">
          <button onClick={prev} className="hidden size-10 place-items-center rounded-full text-sage hover:text-ivory sm:grid" aria-label="Previous">
            <Icon name="prev" size={18} />
          </button>
          <button
            onClick={toggle}
            className="grid size-11 place-items-center rounded-full bg-ivory text-ink hover:bg-brass-soft"
            aria-label={playing ? "Pause" : "Play"}
          >
            <Icon name={playing ? "pause" : "play"} size={18} />
          </button>
          <button
            onClick={next}
            disabled={!hasNext}
            className="grid size-10 place-items-center rounded-full text-sage hover:text-ivory disabled:opacity-30"
            aria-label="Next episode"
          >
            <Icon name="next" size={18} />
          </button>
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          <Link href={href} className="grid size-10 place-items-center rounded-full text-sage hover:text-ivory" aria-label="Open player">
            <Icon name="expand" size={17} />
          </Link>
          <button onClick={close} className="grid size-10 place-items-center rounded-full text-sage hover:text-ivory" aria-label="Close player">
            <Icon name="close" size={17} />
          </button>
        </div>
        <button onClick={close} className="grid size-10 place-items-center rounded-full text-sage lg:hidden" aria-label="Close player">
          <Icon name="close" size={17} />
        </button>
      </div>
    </div>
  );
}
