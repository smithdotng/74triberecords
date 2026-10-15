"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Toast = { id: number; message: string; tone: "default" | "error" };
const Ctx = createContext<(message: string, tone?: Toast["tone"]) => void>(() => {});

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: Toast["tone"] = "default") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 z-80 flex flex-col items-center gap-2 px-4"
        style={{ bottom: "calc(var(--tabbar-h) + var(--minibar-h) + env(safe-area-inset-bottom) + 16px)" }}
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`sheet-enter pointer-events-auto rounded-full border px-5 py-2.5 text-sm shadow-2xl shadow-black/40 backdrop-blur-xl ${
              t.tone === "error" ? "border-ember/40 bg-ink/90 text-ember" : "hairline bg-panel/95 text-ivory"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
