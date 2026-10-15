"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Shows "Install app" only when the browser offers PWA installation. */
export function InstallButton({ className = "" }: { className?: string }) {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setEvt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!evt) return null;

  return (
    <button
      onClick={async () => {
        await evt.prompt();
        await evt.userChoice;
        setEvt(null);
      }}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[0.9rem] text-brass-soft hover:bg-room ${className}`}
    >
      <Icon name="download" size={18} />
      Install the app
    </button>
  );
}
