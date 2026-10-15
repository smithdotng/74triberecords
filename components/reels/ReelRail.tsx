import Link from "next/link";
import type { ReelDTO } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { ReelCover } from "./ReelCover";

/** Horizontal row of vertical reel tiles. Each opens the full-screen feed at that reel. */
export function ReelRail({ reels, title, href = "/reels" }: { reels: ReelDTO[]; title: string; href?: string }) {
  if (!reels.length) return null;
  return (
    <section className="mt-16" aria-labelledby="reels-heading">
      <div className="mb-7 flex items-end justify-between gap-6">
        <h2 id="reels-heading" className="display text-[1.9rem] sm:text-4xl">
          {title}
        </h2>
        <Link href={href} className="text-sm text-sage hover:text-brass-soft">
          Watch all reels
        </Link>
      </div>
      <div className="scroll-row -mx-5 scroll-px-5 auto-cols-[42%] gap-3 px-5 sm:auto-cols-[28%] md:auto-cols-[22%] lg:-mx-10 lg:scroll-px-10 lg:auto-cols-[calc((100%-5*0.875rem)/6)] lg:gap-3.5 lg:px-10">
        {reels.map((r) => (
          <Link key={r.id} href={`/reels?r=${encodeURIComponent(r.shortcode)}`} className="group block">
            <div className="relative aspect-9/16 overflow-hidden rounded-md bg-room">
              <ReelCover reel={r} className="transition-transform duration-700 ease-(--ease-studio) group-hover:scale-[1.04]" />
              <span className="absolute inset-0 bg-linear-to-t from-ink/80 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 grid size-9 place-items-center rounded-full bg-ivory/90 text-ink transition-colors group-hover:bg-brass-soft">
                <Icon name="play" size={14} />
              </span>
            </div>
            {r.showTitle && <p className="mt-2.5 truncate text-[0.8125rem] text-sage">{r.showTitle}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
