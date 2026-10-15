import type { EpisodeDTO } from "@/lib/types";

/** Per-device watch progress, kept in localStorage so "Continue watching" works signed in or not. */
export type HistoryEntry = { episode: EpisodeDTO; seconds: number; duration: number; updatedAt: number };

const KEY = "t74:history";
const MAX = 30;

export function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveProgress(episode: EpisodeDTO, seconds: number, duration: number) {
  try {
    const list = readHistory().filter((h) => h.episode.videoId !== episode.videoId);
    list.unshift({ episode, seconds: Math.floor(seconds), duration: Math.floor(duration), updatedAt: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new Event("t74:history"));
  } catch {
    /* storage unavailable — progress just isn't remembered */
  }
}

export function removeFromHistory(videoId: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(readHistory().filter((h) => h.episode.videoId !== videoId)));
    window.dispatchEvent(new Event("t74:history"));
  } catch {}
}

export function resumePoint(videoId: string) {
  const h = readHistory().find((e) => e.episode.videoId === videoId);
  if (!h) return 0;
  if (h.seconds < 30 || (h.duration && h.seconds > h.duration - 30)) return 0;
  return h.seconds;
}
