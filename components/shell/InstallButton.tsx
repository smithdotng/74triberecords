"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useInstall, type Platform } from "@/lib/install";

type Variant = "sidebar" | "header" | "row" | "brass";

/**
 * "Install the app" — opens the browser's own install dialog where there is one (Chrome,
 * Edge, Samsung Internet), otherwise a short how-to for that device (iPhone, iPad, Safari).
 * Hidden when the site is already running as the installed app.
 */
export function InstallButton({ variant = "sidebar", className = "", label = "Install the app" }: { variant?: Variant; className?: string; label?: string }) {
  const { available, install, platform } = useInstall();
  const [open, setOpen] = useState(false);

  if (!available) return null;

  const onClick = async () => {
    const prompted = await install();
    if (!prompted) setOpen(true);
  };

  const styles: Record<Variant, string> = {
    sidebar: "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[0.9rem] text-brass-soft hover:bg-room",
    row: "flex w-full items-center gap-4 py-4 text-ivory hover:text-brass-soft",
    header: "grid size-9 place-items-center rounded-full border border-seam text-brass-soft hover:border-brass/60",
    brass: "btn btn-brass",
  };

  return (
    <>
      <button type="button" onClick={onClick} className={`${styles[variant]} ${className}`} aria-label={variant === "header" || label !== "Install the app" ? "Install the app" : undefined}>
        <Icon name="download" size={variant === "header" ? 17 : 18} />
        {variant !== "header" && label}
      </button>
      {open && <InstallHelp platform={platform} onClose={() => setOpen(false)} />}
    </>
  );
}

const STEPS: Record<Platform, { title: string; steps: React.ReactNode[] }> = {
  ios: {
    title: "Add 74 Tribe to your Home Screen",
    steps: [
      <>
        Tap the <b className="text-ivory">Share</b> button <ShareGlyph /> in the browser bar.
      </>,
      <>
        Scroll down and tap <b className="text-ivory">Add to Home Screen</b>.
      </>,
      <>
        Tap <b className="text-ivory">Add</b>. 74 Tribe opens full screen, like any other app.
      </>,
    ],
  },
  "mac-safari": {
    title: "Add 74 Tribe to your Dock",
    steps: [
      <>
        In the menu bar, choose <b className="text-ivory">File</b> then <b className="text-ivory">Add to Dock</b>.
      </>,
      <>
        Click <b className="text-ivory">Add</b>. 74 Tribe opens in its own window from the Dock.
      </>,
    ],
  },
  android: {
    title: "Install 74 Tribe",
    steps: [
      <>
        Open your browser’s menu <b className="text-ivory">⋮</b>.
      </>,
      <>
        Tap <b className="text-ivory">Install app</b> or <b className="text-ivory">Add to Home screen</b>.
      </>,
      <>Confirm. 74 Tribe appears with your other apps.</>,
    ],
  },
  desktop: {
    title: "Install 74 Tribe",
    steps: [
      <>
        Click the install icon at the right of the address bar, or open the browser menu and choose{" "}
        <b className="text-ivory">Install 74 Tribe Studios</b>.
      </>,
      <>Confirm. 74 Tribe opens in its own window and gets a place in your apps.</>,
    ],
  },
  unsupported: {
    title: "Install 74 Tribe",
    steps: [
      <>This browser can’t install web apps.</>,
      <>
        Open this page in <b className="text-ivory">Chrome</b>, <b className="text-ivory">Edge</b> or{" "}
        <b className="text-ivory">Safari</b> and choose <b className="text-ivory">Install the app</b> again.
      </>,
    ],
  },
};

function ShareGlyph() {
  return <Icon name="share" size={16} className="inline -translate-y-0.5 text-brass-soft" />;
}

function InstallHelp({ platform, onClose }: { platform: Platform; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    // no close() in cleanup: React's dev double-mount would fire onClose and dismiss the sheet at once
    if (ref.current && !ref.current.open) ref.current.showModal();
  }, []);
  const { title, steps } = STEPS[platform];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="install-title"
      className="install-sheet m-auto w-[min(26rem,calc(100vw-2rem))] rounded-xl border hairline bg-room p-0 text-ivory shadow-2xl backdrop:bg-ink/75 backdrop:backdrop-blur-sm max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none"
    >
      <div className="p-6 sm:p-7" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="" width={44} height={44} className="rounded-[10px]" />
            <h2 id="install-title" className="display text-2xl leading-tight">
              {title}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 p-2 text-sage hover:text-ivory">
            <Icon name="close" size={18} />
          </button>
        </div>
        <ol className="mt-6 space-y-4">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-4 leading-relaxed text-sage">
              <span className="display w-5 shrink-0 text-xl text-brass">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 border-t hairline pt-5 text-sm text-moss">
          Sign in once in the app and your playlists and progress come with you.
        </p>
      </div>
    </dialog>
  );
}
