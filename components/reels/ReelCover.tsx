import type { ReelDTO } from "@/lib/types";

/** Cover for a reel. Manually added reels may have no image — they get a typeset card instead. */
export function ReelCover({ reel, className = "" }: { reel: ReelDTO; className?: string }) {
  if (reel.thumbnail) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={reel.thumbnail} alt="" loading="lazy" className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div
      className={`flex h-full w-full flex-col justify-between p-4 ${className}`}
      style={{ background: "linear-gradient(170deg, color-mix(in oklab, var(--color-brass) 30%, #12322b), #0c231e 75%)" }}
    >
      <div className="weave h-1 w-14 opacity-80" aria-hidden />
      <p className="display line-clamp-5 text-xl leading-snug text-ivory">{reel.caption || "Watch on 74 Tribe"}</p>
    </div>
  );
}
