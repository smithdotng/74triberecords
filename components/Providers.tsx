"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";
import { PlayerProvider } from "./player/PlayerProvider";
import { ToastProvider } from "./ui/Toast";
import { ServiceWorker } from "./ServiceWorker";

export function Providers({ children, session }: { children: ReactNode; session: Session | null }) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <ToastProvider>
        <PlayerProvider>{children}</PlayerProvider>
      </ToastProvider>
      <ServiceWorker />
    </SessionProvider>
  );
}
