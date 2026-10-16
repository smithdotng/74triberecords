"use client";

/**
 * Tracks whether the site can be installed as an app, and how.
 *
 * Chrome, Edge, Samsung Internet and other Chromium browsers fire `beforeinstallprompt`,
 * which we keep so the "Install app" button can open the browser's own install dialog.
 * Safari (iPhone, iPad and Mac) never fires it, so there the button shows short
 * instructions instead. The listener is registered when this module is first imported
 * (from the root Providers), because the event can fire before any button mounts.
 */
import { useSyncExternalStore } from "react";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type Platform = "ios" | "android" | "mac-safari" | "desktop" | "unsupported";

type State = { prompt: BeforeInstallPromptEvent | null; installed: boolean; platform: Platform; ready: boolean };

let state: State = { prompt: null, installed: false, platform: "desktop", ready: false };
const listeners = new Set<() => void>();
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  const safari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox/.test(ua);
  if (/Macintosh/.test(ua) && safari) return "mac-safari";
  if (/Firefox/.test(ua)) return "unsupported"; // desktop Firefox can't install web apps
  return "desktop";
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

if (typeof window !== "undefined") {
  state = { prompt: null, installed: isStandalone(), platform: detectPlatform(), ready: true };
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    set({ prompt: e as BeforeInstallPromptEvent });
  });
  window.addEventListener("appinstalled", () => set({ prompt: null, installed: true }));
  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", (m) => m.matches && set({ installed: true }));
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const SERVER: State = { prompt: null, installed: false, platform: "desktop", ready: false };

export function useInstall() {
  const s = useSyncExternalStore(subscribe, () => state, () => SERVER);
  return {
    ...s,
    /** Show an install control at all (hidden once running as the installed app). */
    available: s.ready && !s.installed,
    /** Opens the browser's install dialog. Returns false when there isn't one, so callers show instructions. */
    async install() {
      const p = state.prompt;
      if (!p) return false;
      await p.prompt();
      const { outcome } = await p.userChoice;
      set({ prompt: null, installed: outcome === "accepted" || state.installed });
      return true;
    },
  };
}
