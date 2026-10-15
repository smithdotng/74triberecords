"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { EpisodeDTO } from "@/lib/types";
import { formatLongDuration } from "@/lib/format";
import { EpisodeList } from "@/components/EpisodeList";
import { PlayButton } from "@/components/player/PlayButton";
import { usePlayer } from "@/components/player/PlayerProvider";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";

type Playlist = { id: string; name: string; description: string; episodes: EpisodeDTO[] };

export function PlaylistView({ playlist }: { playlist: Playlist }) {
  const router = useRouter();
  const toast = useToast();
  const [episodes, setEpisodes] = useState(playlist.episodes);
  const [meta, setMeta] = useState({ name: playlist.name, description: playlist.description });
  const [editing, setEditing] = useState(false);
  const confirmRef = useRef<HTMLDialogElement>(null);

  const total = episodes.reduce((t, e) => t + e.durationSeconds, 0);
  const cover = episodes[0]?.thumbnail;

  const saveOrder = async (next: EpisodeDTO[], prev: EpisodeDTO[]) => {
    setEpisodes(next);
    const res = await fetch(`/api/playlists/${playlist.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((e) => e.videoId) }),
    });
    if (!res.ok) {
      setEpisodes(prev);
      toast("Couldn't save the new order. Try again.", "error");
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= episodes.length) return;
    const next = [...episodes];
    [next[i], next[j]] = [next[j], next[i]];
    saveOrder(next, episodes);
  };

  const remove = async (ep: EpisodeDTO) => {
    const prev = episodes;
    setEpisodes(episodes.filter((e) => e.videoId !== ep.videoId));
    const res = await fetch(`/api/playlists/${playlist.id}/items?videoId=${ep.videoId}`, { method: "DELETE" });
    if (!res.ok) {
      setEpisodes(prev);
      return toast("Couldn't remove that episode. Try again.", "error");
    }
    toast(`Removed from ${meta.name}`);
  };

  const saveMeta = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = { name: String(form.get("name") ?? "").trim(), description: String(form.get("description") ?? "").trim() };
    const res = await fetch(`/api/playlists/${playlist.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast(data.error ?? "Couldn't save changes.", "error");
    setMeta(next);
    setEditing(false);
    toast("Playlist updated");
    router.refresh();
  };

  const destroy = async () => {
    const res = await fetch(`/api/playlists/${playlist.id}`, { method: "DELETE" });
    if (!res.ok) return toast("Couldn't delete the playlist.", "error");
    toast(`Deleted ${meta.name}`);
    router.push("/library");
    router.refresh();
  };

  const shuffled = () => [...episodes].sort(() => Math.random() - 0.5);

  return (
    <div>
      <section className="relative overflow-hidden px-5 pt-8 pb-10 lg:px-10 lg:pt-16">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-20 blur-3xl" />
        )}
        <Link href="/library" className="inline-flex items-center gap-2 text-sm text-sage hover:text-ivory">
          <Icon name="arrowLeft" size={16} />
          Your library
        </Link>

        {editing ? (
          <form onSubmit={saveMeta} className="mt-6 max-w-xl space-y-3">
            <label htmlFor="pl-name" className="sr-only">
              Playlist name
            </label>
            <input id="pl-name" name="name" defaultValue={meta.name} required maxLength={80} className="field display h-16 text-3xl" />
            <label htmlFor="pl-desc" className="sr-only">
              Description
            </label>
            <textarea id="pl-desc" name="description" defaultValue={meta.description} maxLength={300} rows={2} className="field" placeholder="Add a description" />
            <div className="flex gap-2">
              <button className="btn btn-brass">Save changes</button>
              <button type="button" className="btn btn-quiet" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 max-w-3xl">
            <h1 className="display text-5xl text-balance sm:text-7xl">{meta.name}</h1>
            {meta.description && <p className="mt-4 text-lg text-sage">{meta.description}</p>}
            <p className="mt-4 text-sm text-moss">
              {episodes.length} {episodes.length === 1 ? "episode" : "episodes"}
              {total > 0 && `, ${formatLongDuration(total)}`}
            </p>
          </div>
        )}

        {!editing && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {episodes[0] && <PlayButton episode={episodes[0]} queue={episodes} listId={playlist.id} label="Play all" />}
            {episodes.length > 1 && (
              <ShuffleButton episodesFn={shuffled} listId={playlist.id} />
            )}
            <button className="btn btn-quiet" onClick={() => setEditing(true)}>
              <Icon name="edit" size={17} />
              Rename
            </button>
            <button className="btn btn-quiet" onClick={() => confirmRef.current?.showModal()}>
              <Icon name="trash" size={17} />
              Delete
            </button>
          </div>
        )}
      </section>

      <div className="px-5 lg:px-10">
        {episodes.length ? (
          <div className="max-w-5xl">
            <EpisodeList
              episodes={episodes}
              listId={playlist.id}
              actions={(ep, i) => (
                <>
                  <span className="hidden sm:contents">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="grid size-9 place-items-center rounded-full text-sage hover:bg-panel hover:text-ivory disabled:opacity-25"
                      aria-label={`Move “${ep.title}” up`}
                    >
                      <Icon name="up" size={17} />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === episodes.length - 1}
                      className="grid size-9 place-items-center rounded-full text-sage hover:bg-panel hover:text-ivory disabled:opacity-25"
                      aria-label={`Move “${ep.title}” down`}
                    >
                      <Icon name="down" size={17} />
                    </button>
                  </span>
                  <button
                    onClick={() => remove(ep)}
                    className="grid size-9 place-items-center rounded-full text-sage hover:bg-panel hover:text-ember"
                    aria-label={`Remove “${ep.title}” from this playlist`}
                  >
                    <Icon name="close" size={17} />
                  </button>
                </>
              )}
            />
          </div>
        ) : (
          <div className="max-w-xl border-t hairline pt-10">
            <h2 className="display text-3xl">Nothing here yet</h2>
            <p className="mt-3 text-sage">Press the + beside any episode and choose this playlist to add it.</p>
            <Link href="/shows" className="btn btn-ghost mt-6">
              Browse shows
            </Link>
          </div>
        )}
      </div>

      <dialog
        ref={confirmRef}
        onClick={(e) => e.target === confirmRef.current && confirmRef.current?.close()}
        className="m-auto w-[calc(100%-2.5rem)] max-w-sm bg-transparent p-0 text-ivory backdrop:bg-ink/70 backdrop:backdrop-blur-sm"
      >
        <div className="sheet-enter rounded-xl border hairline bg-room p-6">
          <h2 className="display text-2xl">Delete “{meta.name}”?</h2>
          <p className="mt-3 text-sm text-sage">The playlist will be removed from every device. The episodes stay available on their shows.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button className="btn btn-quiet" onClick={() => confirmRef.current?.close()}>
              Keep playlist
            </button>
            <button className="btn bg-ember text-ink hover:bg-ember/85" onClick={destroy}>
              Delete playlist
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

function ShuffleButton({ episodesFn, listId }: { episodesFn: () => EpisodeDTO[]; listId: string }) {
  const router = useRouter();
  const { play } = usePlayer();
  return (
    <button
      className="btn btn-ghost"
      onClick={() => {
        const q = episodesFn();
        play(q[0], q, { listId });
        router.push(`/watch/${q[0].videoId}?list=${listId}`);
      }}
    >
      Shuffle
    </button>
  );
}
