"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui/Icon";

export function SearchBox({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (q.trim() === initial) return;
    timer.current = window.setTimeout(() => {
      router.replace(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search", { scroll: false });
    }, 350);
    return () => window.clearTimeout(timer.current);
  }, [q, initial, router]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.replace(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
      className="relative"
    >
      <label htmlFor="q" className="sr-only">
        Search episodes
      </label>
      <Icon name="search" size={20} className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-moss" />
      <input
        id="q"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Episodes, guests, topics"
        autoComplete="off"
        className="field h-14 rounded-full pl-13 text-lg"
        autoFocus={!initial}
      />
    </form>
  );
}
