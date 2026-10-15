"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReelDTO } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useToast } from "@/components/ui/Toast";
import { ReelCover } from "./ReelCover";

/**
 * Full-screen vertical feed. One reel per screen with snap scrolling (swipe on phones,
 * wheel / arrow keys on desktop). Reels imported through the Instagram API play natively;
 * manually added ones load Instagram's own embed player when they come into view.
 */
export function ReelsFeed({ reels, startAt }: { reels: ReelDTO[]; startAt?: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(() => Math.max(0, reels.findIndex((r) => r.shortcode === startAt)));
  const [muted, setMuted] = useState(true);
  const { pause: pauseEpisode } = usePlayer();

  // Jump to the reel in the link, without animation
  useEffect(() => {
    const el = slides.current[active];
    if (el && scroller.current) scroller.current.scrollTop = el.offsetTop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track which slide fills the screen
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.6) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { root, threshold: [0.6] }
    );
    slides.current.forEach((s) => s && io.observe(s));
    return () => io.disconnect();
  }, [reels.length]);

  // Keep the address shareable without re-rendering the page
  useEffect(() => {
    const r = reels[active];
    if (r) window.history.replaceState(null, "", `/reels?r=${encodeURIComponent(r.shortcode)}`);
  }, [active, reels]);

  const go = useCallback((i: number) => {
    const el = slides.current[Math.max(0, Math.min(reels.length - 1, i))];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [reels.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea")) return;
      if (e.key === "ArrowDown" || e.key === "j") (e.preventDefault(), go(active + 1));
      if (e.key === "ArrowUp" || e.key === "k") (e.preventDefault(), go(active - 1));
      if (e.key === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  const toggleMute = () => {
    setMuted((m) => {
      if (m) pauseEpisode();
      return !m;
    });
  };

  return (
    <div className="fixed right-0 left-0 z-30 bg-[#071a16] lg:left-(--sidebar-w)" style={{ top: "var(--reels-top)", bottom: "calc(var(--tabbar-h) + env(safe-area-inset-bottom))" }}>
      <div ref={scroller} className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none]" aria-label="Reels" role="feed">
        {reels.map((r, i) => (
          <section
            key={r.id}
            ref={(el) => {
              slides.current[i] = el;
            }}
            data-index={i}
            aria-label={r.caption ? r.caption.slice(0, 80) : `Reel ${i + 1}`}
            className="relative flex h-full snap-start snap-always items-center justify-center lg:py-5"
          >
            <ReelSlide reel={r} active={i === active} near={Math.abs(i - active) <= 1} muted={muted} onToggleMute={toggleMute} />
          </section>
        ))}
      </div>

      {/* Desktop stepper */}
      <div className="absolute top-1/2 right-6 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        <button
          onClick={() => go(active - 1)}
          disabled={active === 0}
          className="grid size-12 place-items-center rounded-full bg-room text-ivory hover:bg-panel disabled:opacity-30"
          aria-label="Previous reel"
        >
          <Icon name="up" size={20} />
        </button>
        <button
          onClick={() => go(active + 1)}
          disabled={active === reels.length - 1}
          className="grid size-12 place-items-center rounded-full bg-room text-ivory hover:bg-panel disabled:opacity-30"
          aria-label="Next reel"
        >
          <Icon name="down" size={20} />
        </button>
        <p className="mt-1 text-center text-xs text-moss tabular-nums">
          {active + 1}/{reels.length}
        </p>
      </div>
    </div>
  );
}

function ReelSlide({
  reel,
  active,
  near,
  muted,
  onToggleMute,
}: {
  reel: ReelDTO;
  active: boolean;
  near: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const toast = useToast();

  const native = Boolean(reel.videoUrl) && !videoFailed;
  const embed = !native && reel.source !== "demo";

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (active) {
      v.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [active]);

  const togglePlay = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPaused(false));
    else (v.pause(), setPaused(true));
  };

  const share = async () => {
    const url = `${window.location.origin}/reels?r=${encodeURIComponent(reel.shortcode)}`;
    try {
      if (navigator.share) await navigator.share({ title: reel.caption.slice(0, 80) || "74 Tribe Studios reel", url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied");
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink lg:aspect-9/16 lg:h-full lg:w-auto lg:rounded-xl">
      {native ? (
        <video
          ref={video}
          src={near ? reel.videoUrl : undefined}
          poster={reel.thumbnail || undefined}
          muted={muted}
          loop
          playsInline
          preload={near ? "auto" : "none"}
          onClick={togglePlay}
          onError={() => setVideoFailed(true)}
          className="h-full w-full cursor-pointer object-cover"
        />
      ) : embed && near ? (
        // Instagram's own player. Loaded only for the reel on screen and its neighbours.
        <iframe
          src={`https://www.instagram.com/reel/${reel.shortcode}/embed/`}
          title={reel.caption.slice(0, 80) || "Instagram reel"}
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          loading="lazy"
          className="h-full w-full border-0 bg-white"
        />
      ) : (
        <ReelCover reel={reel} />
      )}

      {native && paused && (
        <button onClick={togglePlay} className="absolute inset-0 grid place-items-center bg-black/25" aria-label="Play reel">
          <span className="grid size-16 place-items-center rounded-full bg-ivory/90 text-ink">
            <Icon name="play" size={24} />
          </span>
        </button>
      )}

      {reel.source === "demo" && (
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-md bg-ink/70 p-4 text-center text-sm text-ivory/90 backdrop-blur">
          Sample reel. Connect Instagram or add reel links in Studio admin and they’ll play here.
        </div>
      )}

      {/* Caption and actions. Instagram's embed shows its own caption, so keep this out of its way. */}
      {!embed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent px-5 pt-24 pb-6">
          <div className="pointer-events-auto flex items-end gap-4">
            <div className="min-w-0 flex-1">
              {reel.showTitle && (
                <Link
                  href={`/shows/${reel.showSlug}`}
                  className="mb-2 inline-flex items-center gap-2 rounded-full bg-ivory/12 px-3 py-1 text-[0.8125rem] text-ivory backdrop-blur hover:bg-ivory/20"
                >
                  {reel.showTitle}
                </Link>
              )}
              {reel.caption && (
                <button onClick={() => setExpanded((e) => !e)} className="block text-left" aria-expanded={expanded}>
                  <p className={`text-[0.95rem] leading-relaxed whitespace-pre-line text-ivory ${expanded ? "max-h-48 overflow-y-auto" : "line-clamp-2"}`}>
                    {reel.caption}
                  </p>
                </button>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              {native && (
                <RoundButton onClick={onToggleMute} label={muted ? "Turn sound on" : "Mute"}>
                  <Icon name={muted ? "mute" : "volume"} size={20} />
                </RoundButton>
              )}
              <RoundButton onClick={share} label="Share reel">
                <Icon name="share" size={19} />
              </RoundButton>
              {reel.source !== "demo" && (
                <a
                  href={reel.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-11 place-items-center rounded-full bg-ivory/12 text-ivory backdrop-blur hover:bg-ivory/22"
                  aria-label="Open on Instagram"
                >
                  <Icon name="instagram" size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {embed && (
        <div className="absolute top-3 right-3 flex gap-2">
          {reel.showTitle && (
            <Link href={`/shows/${reel.showSlug}`} className="rounded-full bg-ink/80 px-3 py-1.5 text-[0.8125rem] text-ivory backdrop-blur">
              {reel.showTitle}
            </Link>
          )}
          <RoundButton onClick={share} label="Share reel" dark>
            <Icon name="share" size={17} />
          </RoundButton>
        </div>
      )}
    </div>
  );
}

function RoundButton({ children, onClick, label, dark = false }: { children: React.ReactNode; onClick: () => void; label: string; dark?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-11 place-items-center rounded-full text-ivory backdrop-blur transition-colors ${dark ? "size-9 bg-ink/80 hover:bg-ink" : "bg-ivory/12 hover:bg-ivory/22"}`}
    >
      {children}
    </button>
  );
}
