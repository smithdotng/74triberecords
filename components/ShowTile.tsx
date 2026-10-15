import Link from "next/link";
import type { ShowDTO } from "@/lib/types";

/** Portrait show cover. Falls back to a typeset cover in the show's accent when no artwork is set. */
export function ShowTile({ show, fallbackImage, size = "md" }: { show: ShowDTO; fallbackImage?: string; size?: "md" | "lg" }) {
  const img = show.coverImage || fallbackImage;
  return (
    <Link href={`/shows/${show.slug}`} className="group block" style={{ ["--accent" as string]: show.accent }}>
      <div className="relative aspect-4/5 overflow-hidden rounded-tile bg-room">
        {img ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1.2s] ease-(--ease-studio) group-hover:scale-[1.04]"
            />
            {!show.coverImage && (
              <div className="absolute inset-0 flex items-end bg-linear-to-t from-ink via-ink/40 to-transparent p-5">
                <span className="display text-3xl text-ivory">{show.title}</span>
              </div>
            )}
          </>
        ) : (
          <div
            className="flex h-full flex-col justify-end p-5"
            style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${show.accent} 45%, #0c231e), #0c231e 70%)` }}
          >
            <span className="display text-3xl text-ivory">{show.title}</span>
          </div>
        )}
        <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-(--accent) transition-transform duration-500 ease-(--ease-studio) group-hover:scale-x-100" />
      </div>
      <div className={size === "lg" ? "mt-4" : "mt-3"}>
        <p className="font-medium text-ivory transition-colors group-hover:text-brass-soft">{show.title}</p>
        {show.tagline && <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-sage">{show.tagline}</p>}
      </div>
    </Link>
  );
}
