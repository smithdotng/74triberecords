"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useInstall } from "@/lib/install";
import { InstallButton } from "./InstallButton";

const KEY = "t74-install-banner-dismissed";
const QUIET_DAYS = 21;

/** A slim "Get the app" strip under the header on phones and tablets. Dismissing it hides it for three weeks. */
export function InstallBanner() {
  const { available } = useInstall();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      const t = Number(localStorage.getItem(KEY) || 0);
      setHidden(Date.now() - t < QUIET_DAYS * 864e5);
    } catch {
      setHidden(false);
    }
  }, []);

  if (!available || hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {}
  };

  return (
    <div className="flex items-center gap-3 border-b hairline bg-room px-5 py-3 lg:hidden" role="region" aria-label="Get the app">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={36} height={36} className="shrink-0 rounded-lg" />
      <p className="min-w-0 flex-1 text-[0.8125rem] leading-snug text-sage">
        <span className="block font-medium text-ivory">Get the 74 Tribe app</span>
        One tap from your home screen.
      </p>
      <InstallButton variant="brass" label="Install" className="!gap-2 !px-4 !py-2 !text-sm" />
      <button type="button" onClick={dismiss} aria-label="Not now" className="-mr-2 p-2 text-moss hover:text-ivory">
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
