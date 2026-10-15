"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { EpisodeDTO } from "@/lib/types";
import { loadYouTubeApi, YT_STATE, type YTPlayer } from "./yt";
import { resumePoint, saveProgress } from "./history";
import { MiniBar } from "./MiniBar";

type PlayerCtx = {
  current: EpisodeDTO | null;
  queue: EpisodeDTO[];
  index: number;
  playing: boolean;
  progress: { seconds: number; duration: number };
  /** Start an episode. Pass the surrounding list so "next" and autoplay work. */
  play: (episode: EpisodeDTO, queue?: EpisodeDTO[], opts?: { listId?: string }) => void;
  toggle: () => void;
  /** Pause without closing — used when another video (a reel) starts with sound */
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  close: () => void;
  listId: string | null;
  registerStage: (el: HTMLElement | null) => void;
};

const Ctx = createContext<PlayerCtx | null>(null);

export function usePlayer() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return c;
}

const isDemoId = (id: string) => id.startsWith("demo-");

export function PlayerProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [queue, setQueue] = useState<EpisodeDTO[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState({ seconds: 0, duration: 0 });
  const [listId, setListId] = useState<string | null>(null);
  const [stage, setStage] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const current = queue[index] ?? null;
  const hostRef = useRef<HTMLDivElement>(null);
  const ytRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef<Promise<YTPlayer> | null>(null);
  const stateRef = useRef({ queue, index, pathname, listId });
  stateRef.current = { queue, index, pathname, listId };

  // ---------- YouTube player lifecycle ----------
  const ensurePlayer = useCallback((videoId: string, start: number) => {
    if (readyRef.current) return readyRef.current;
    readyRef.current = loadYouTubeApi().then(
      (YT) =>
        new Promise<YTPlayer>((resolve) => {
          const mount = document.createElement("div");
          hostRef.current!.appendChild(mount);
          new YT.Player(mount, {
            videoId,
            host: "https://www.youtube-nocookie.com",
            playerVars: {
              autoplay: 1,
              start: Math.floor(start),
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              iv_load_policy: 3,
              color: "white",
              origin: window.location.origin,
            },
            events: {
              onReady: (e) => {
                ytRef.current = e.target;
                resolve(e.target);
              },
              onStateChange: (e) => {
                if (e.data === YT_STATE.PLAYING) setPlaying(true);
                if (e.data === YT_STATE.PAUSED || e.data === YT_STATE.ENDED) setPlaying(false);
                if (e.data === YT_STATE.ENDED) advance(true);
              },
            },
          });
        })
    );
    return readyRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInto = useCallback(
    async (ep: EpisodeDTO) => {
      setProgress({ seconds: 0, duration: ep.durationSeconds });
      if (isDemoId(ep.videoId)) {
        ytRef.current?.pauseVideo();
        setPlaying(false);
        return;
      }
      const start = resumePoint(ep.videoId);
      if (ytRef.current) {
        ytRef.current.loadVideoById({ videoId: ep.videoId, startSeconds: start });
      } else {
        await ensurePlayer(ep.videoId, start);
      }
    },
    [ensurePlayer]
  );

  // ---------- Queue controls ----------
  const goTo = useCallback(
    (i: number, fromEnded = false) => {
      const { queue: q, pathname: path, listId: lid } = stateRef.current;
      const ep = q[i];
      if (!ep) return;
      setIndex(i);
      loadInto(ep);
      // Keep the watch page in step with what's playing
      if (path.startsWith("/watch/")) {
        const qs = lid ? `?list=${lid}` : "";
        router.replace(`/watch/${ep.videoId}${qs}`, { scroll: !fromEnded });
      }
    },
    [loadInto, router]
  );

  const advance = useCallback(
    (fromEnded = false) => {
      const { queue: q, index: i } = stateRef.current;
      if (i + 1 < q.length) goTo(i + 1, fromEnded);
    },
    [goTo]
  );

  const play: PlayerCtx["play"] = useCallback(
    (episode, list, opts) => {
      const q = list && list.length ? list : [episode];
      const i = Math.max(0, q.findIndex((e) => e.videoId === episode.videoId));
      setQueue(q);
      setIndex(i);
      setListId(opts?.listId ?? null);
      loadInto(q[i]);
    },
    [loadInto]
  );

  const toggle = useCallback(() => {
    const p = ytRef.current;
    if (!p || !current || isDemoId(current.videoId)) return;
    if (p.getPlayerState() === YT_STATE.PLAYING) p.pauseVideo();
    else p.playVideo();
  }, [current]);

  const prev = useCallback(() => {
    const p = ytRef.current;
    if (p && p.getCurrentTime() > 5) return p.seekTo(0, true);
    if (stateRef.current.index > 0) goTo(stateRef.current.index - 1);
  }, [goTo]);

  const next = useCallback(() => advance(false), [advance]);

  const seek = useCallback((s: number) => ytRef.current?.seekTo(s, true), []);

  const pause = useCallback(() => ytRef.current?.pauseVideo(), []);

  const close = useCallback(() => {
    ytRef.current?.pauseVideo();
    setPlaying(false);
    setQueue([]);
    setIndex(0);
    setListId(null);
  }, []);

  // ---------- Progress + resume memory ----------
  useEffect(() => {
    if (!playing || !current) return;
    let tick = 0;
    const id = window.setInterval(() => {
      const p = ytRef.current;
      if (!p) return;
      const seconds = p.getCurrentTime();
      const duration = p.getDuration() || current.durationSeconds;
      setProgress({ seconds, duration });
      if (++tick % 5 === 0) saveProgress(current, seconds, duration);
    }, 1000);
    return () => {
      window.clearInterval(id);
      const p = ytRef.current;
      if (p) saveProgress(current, p.getCurrentTime(), p.getDuration() || current.durationSeconds);
    };
  }, [playing, current]);

  // ---------- Lock-screen / headset controls ----------
  useEffect(() => {
    if (!("mediaSession" in navigator) || !current) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.showTitle ?? "74 Tribe Studios",
      album: "74 Tribe Studios",
      artwork: [{ src: current.thumbnail, sizes: "1280x720", type: "image/jpeg" }],
    });
    navigator.mediaSession.setActionHandler("play", () => ytRef.current?.playVideo());
    navigator.mediaSession.setActionHandler("pause", () => ytRef.current?.pauseVideo());
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("previoustrack", prev);
  }, [current, next, prev]);

  // ---------- Positioning: over the stage on watch pages, docked as a mini player elsewhere ----------
  const onWatchPage = pathname.startsWith("/watch/");
  // The full-screen reels feed has its own video; the episode player stays paused out of sight there
  const onReels = pathname.startsWith("/reels");
  const mode: "stage" | "mini" | "hidden" = !current || onReels ? "hidden" : stage && onWatchPage ? "stage" : "mini";

  useEffect(() => {
    if (onReels) ytRef.current?.pauseVideo();
  }, [onReels]);

  useLayoutEffect(() => {
    if (mode !== "stage" || !stage) return;
    const measure = () => {
      const r = stage.getBoundingClientRect();
      setRect({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [mode, stage]);

  const registerStage = useCallback((el: HTMLElement | null) => setStage(el), []);

  const value = useMemo<PlayerCtx>(
    () => ({ current, queue, index, playing, progress, play, toggle, pause, next, prev, seek, close, listId, registerStage }),
    [current, queue, index, playing, progress, play, toggle, pause, next, prev, seek, close, listId, registerStage]
  );

  const showDemoPoster = current && isDemoId(current.videoId);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        className="player-box"
        data-mode={mode}
        style={mode === "stage" && rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : undefined}
        aria-hidden={mode === "hidden"}
      >
        <div ref={hostRef} className="player-host" hidden={!!showDemoPoster} />
        {showDemoPoster && (
          <div className="relative h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.thumbnail} alt="" className="h-full w-full object-cover" />
            {mode === "stage" && (
              <div className="absolute inset-0 grid place-items-center bg-ink/55 p-6 text-center">
                <p className="max-w-sm text-sm text-ivory/90">
                  This is a sample episode. Add your shows from the admin page and they'll stream right here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {mode === "mini" && <MiniBar />}
    </Ctx.Provider>
  );
}
