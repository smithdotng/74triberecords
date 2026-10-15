"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import type { EpisodeDTO, PlaylistDTO } from "@/lib/types";
import { Icon } from "./ui/Icon";
import { useToast } from "./ui/Toast";

export function AddToPlaylist({
  episode,
  variant = "icon",
}: {
  episode: EpisodeDTO;
  variant?: "icon" | "button";
}) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const onClick = () => {
    if (status !== "authenticated") {
      router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={onClick}
          className="grid size-10 shrink-0 place-items-center rounded-full text-sage transition-colors hover:bg-panel hover:text-ivory"
          aria-label={`Save “${episode.title}” to a playlist`}
          title="Save to playlist"
        >
          <Icon name="plus" size={19} />
        </button>
      ) : (
        <button onClick={onClick} className="btn btn-ghost">
          <Icon name="plus" size={17} />
          Save
        </button>
      )}
      {open && <PlaylistSheet episode={episode} onClose={() => setOpen(false)} />}
    </>
  );
}

function PlaylistSheet({ episode, onClose }: { episode: EpisodeDTO; onClose: () => void }) {
  const toast = useToast();
  const [lists, setLists] = useState<PlaylistDTO[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    d?.showModal();
    fetch("/api/playlists")
      .then((r) => r.json())
      .then((d) => setLists(d.playlists ?? []))
      .catch(() => setLists([]));
  }, []);

  const toggle = async (p: PlaylistDTO) => {
    const has = p.videoIds.includes(episode.videoId);
    setBusy(p.id);
    const res = await fetch(
      has ? `/api/playlists/${p.id}/items?videoId=${episode.videoId}` : `/api/playlists/${p.id}/items`,
      {
        method: has ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: has ? undefined : JSON.stringify({ videoId: episode.videoId }),
      }
    );
    setBusy(null);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Couldn't update the playlist." }));
      return toast(error, "error");
    }
    setLists((ls) =>
      (ls ?? []).map((l) =>
        l.id === p.id
          ? {
              ...l,
              videoIds: has ? l.videoIds.filter((v) => v !== episode.videoId) : [...l.videoIds, episode.videoId],
              itemCount: l.itemCount + (has ? -1 : 1),
            }
          : l
      )
    );
    toast(has ? `Removed from ${p.name}` : `Saved to ${p.name}`);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy("new");
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, videoId: episode.videoId }),
    });
    setBusy(null);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast(data.error ?? "Couldn't create the playlist.", "error");
    toast(`Saved to ${data.name}`);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      className="m-0 mt-auto w-full max-w-none bg-transparent p-0 text-ivory backdrop:bg-ink/70 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-md"
    >
      <div className="sheet-enter rounded-t-2xl border hairline bg-room p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="display text-2xl">Save to playlist</h2>
            <p className="mt-1 truncate text-sm text-sage">{episode.title}</p>
          </div>
          <button
            onClick={() => dialogRef.current?.close()}
            className="grid size-9 shrink-0 place-items-center rounded-full text-sage hover:bg-panel hover:text-ivory"
            aria-label="Close"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <ul className="-mx-2 max-h-72 overflow-y-auto">
          {lists === null && <li className="px-2 py-3 text-sm text-moss">Loading your playlists…</li>}
          {lists?.length === 0 && <li className="px-2 py-3 text-sm text-sage">You don’t have any playlists yet. Name your first one below.</li>}
          {lists?.map((p) => {
            const has = p.videoIds.includes(episode.videoId);
            return (
              <li key={p.id}>
                <button
                  onClick={() => toggle(p)}
                  disabled={busy === p.id}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left hover:bg-panel disabled:opacity-60"
                  aria-pressed={has}
                >
                  <span
                    className={`grid size-6 place-items-center rounded-full border transition-colors ${
                      has ? "border-brass bg-brass text-ink" : "hairline text-transparent"
                    }`}
                  >
                    <Icon name="check" size={14} strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="text-sm text-moss tabular-nums">{p.itemCount}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <form onSubmit={create} className="mt-4 flex gap-2 border-t hairline pt-5">
          <label htmlFor="new-playlist" className="sr-only">
            New playlist name
          </label>
          <input
            id="new-playlist"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New playlist name"
            maxLength={80}
            className="field h-11"
          />
          <button className="btn btn-brass h-11 shrink-0" disabled={!name.trim() || busy === "new"}>
            Create
          </button>
        </form>
      </div>
    </dialog>
  );
}
