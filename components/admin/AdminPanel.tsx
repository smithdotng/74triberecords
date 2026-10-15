"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { ShowDTO } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

export function AdminPanel({ initialShows, youtubeReady }: { initialShows: ShowDTO[]; youtubeReady: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [shows, setShows] = useState(initialShows);
  const [editing, setEditing] = useState<ShowDTO | "new" | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const reload = async () => {
    const res = await fetch("/api/admin/shows");
    if (res.ok) setShows((await res.json()).shows);
    router.refresh();
  };

  const sync = async (show: ShowDTO) => {
    setSyncing(show.id);
    const res = await fetch(`/api/admin/shows/${show.id}/sync`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setSyncing(null);
    if (!res.ok) return toast(data.error ?? "Sync failed.", "error");
    toast(`${show.title}: ${data.episodes} episodes synced`);
    reload();
  };

  const syncAll = async () => {
    setSyncing("all");
    const res = await fetch("/api/admin/sync-all", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setSyncing(null);
    if (!res.ok) return toast(data.error ?? "Sync failed.", "error");
    const failed = (data.results as { error?: string }[]).filter((r) => r.error).length;
    toast(failed ? `Synced with ${failed} error${failed > 1 ? "s" : ""} — check the playlist IDs` : "Every show is up to date", failed ? "error" : "default");
    reload();
  };

  const remove = async (show: ShowDTO) => {
    if (!confirm(`Delete “${show.title}” and its ${show.episodeCount} episodes from the site? This doesn't touch YouTube.`)) return;
    const res = await fetch(`/api/admin/shows/${show.id}`, { method: "DELETE" });
    if (!res.ok) return toast("Couldn't delete the show.", "error");
    toast(`Deleted ${show.title}`);
    reload();
  };

  return (
    <div className="px-5 pt-10 lg:px-10 lg:pt-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="display text-5xl sm:text-7xl">Studio admin</h1>
          <p className="mt-4 max-w-xl text-lg text-sage">
            Each show is a YouTube playlist. Add the playlist once and new uploads appear on the site automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {youtubeReady && shows.length > 0 && (
            <button className="btn btn-ghost" onClick={syncAll} disabled={syncing === "all"}>
              <Icon name="refresh" size={17} className={syncing === "all" ? "animate-spin" : ""} />
              {syncing === "all" ? "Syncing…" : "Sync all shows"}
            </button>
          )}
          <button className="btn btn-brass" onClick={() => setEditing("new")}>
            <Icon name="plus" size={17} />
            Add a show
          </button>
        </div>
      </div>

      {!youtubeReady && (
        <p className="mt-8 max-w-3xl rounded-md border border-brass/40 bg-brass/10 px-5 py-4 text-sm text-brass-soft">
          Add <code>YOUTUBE_API_KEY</code> to your environment to import whole playlists automatically. Until then, add episodes one at a time below.
        </p>
      )}

      <section className="mt-12" aria-labelledby="shows-h">
        <h2 id="shows-h" className="display mb-5 text-3xl">
          Shows
        </h2>
        {shows.length === 0 ? (
          <p className="border-y hairline py-10 text-sage">No shows yet. Add your first one to put it on the home page.</p>
        ) : (
          <ul className="divide-y divide-seam border-y hairline">
            {shows.map((s) => (
              <li key={s.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="h-10 w-1 shrink-0 rounded-full" style={{ background: s.accent }} />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-ivory">
                      <Link href={`/shows/${s.slug}`} className="hover:text-brass-soft">
                        {s.title}
                      </Link>
                      {s.featured && <span className="rounded-full bg-brass/15 px-2 py-0.5 text-xs text-brass-soft">Featured</span>}
                      {!s.published && <span className="rounded-full bg-panel px-2 py-0.5 text-xs text-sage">Hidden</span>}
                    </p>
                    <p className="mt-1 text-sm text-moss">
                      {s.episodeCount} episodes{s.lastSyncedAt ? `, synced ${formatDate(s.lastSyncedAt)}` : ", not synced yet"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1 pl-5 sm:pl-0">
                  {youtubeReady && (
                    <button className="btn btn-quiet h-10" onClick={() => sync(s)} disabled={syncing === s.id}>
                      <Icon name="refresh" size={16} className={syncing === s.id ? "animate-spin" : ""} />
                      Sync
                    </button>
                  )}
                  <button className="btn btn-quiet h-10" onClick={() => setEditing(s)}>
                    <Icon name="edit" size={16} />
                    Edit
                  </button>
                  <button className="btn btn-quiet h-10 hover:text-ember" onClick={() => remove(s)}>
                    <Icon name="trash" size={16} />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {shows.length > 0 && <AddEpisode shows={shows} onAdded={reload} />}

      {editing && (
        <ShowForm
          show={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

function AddEpisode({ shows, onAdded }: { shows: ShowDTO[]; onAdded: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setBusy(true);
    const res = await fetch("/api/admin/episodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showId: form.get("showId"), url: form.get("url") }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast(data.error ?? "Couldn't add that episode.", "error");
    toast("Episode added");
    formEl.reset();
    onAdded();
  };

  return (
    <section className="mt-16 max-w-3xl" aria-labelledby="add-ep">
      <h2 id="add-ep" className="display text-3xl">
        Add a single episode
      </h2>
      <p className="mt-2 text-sage">For a video that isn’t in the show’s playlist, or to publish one before the next sync.</p>
      <form onSubmit={submit} className="mt-6 grid gap-3 sm:grid-cols-[12rem_1fr_auto]">
        <label className="sr-only" htmlFor="ep-show">
          Show
        </label>
        <select id="ep-show" name="showId" className="field" required>
          {shows.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="ep-url">
          YouTube link
        </label>
        <input id="ep-url" name="url" required className="field" placeholder="https://www.youtube.com/watch?v=…" />
        <button className="btn btn-brass h-12" disabled={busy}>
          {busy ? "Adding…" : "Add episode"}
        </button>
      </form>
    </section>
  );
}

function ShowForm({ show, onClose, onSaved }: { show: ShowDTO | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accent, setAccent] = useState(show?.accent ?? "#C9A45C");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      title: f.get("title"),
      slug: f.get("slug"),
      tagline: f.get("tagline"),
      description: f.get("description"),
      hosts: f.get("hosts"),
      youtubePlaylistId: f.get("youtubePlaylistId"),
      coverImage: f.get("coverImage"),
      accent,
      schedule: f.get("schedule"),
      order: f.get("order"),
      featured: f.get("featured") === "on",
      published: f.get("published") === "on",
    };
    setBusy(true);
    setError(null);
    const res = await fetch(show ? `/api/admin/shows/${show.id}` : "/api/admin/shows", {
      method: show ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error ?? "Couldn't save the show.");
    if (data.sync?.error) toast(`Saved, but the first sync failed: ${data.sync.error.slice(0, 120)}`, "error");
    else toast(show ? "Show updated" : data.sync?.episodes !== undefined ? `Show added with ${data.sync.episodes} episodes` : "Show added");
    onSaved();
  };

  return (
    <dialog
      ref={(el) => {
        ref.current = el;
        if (el && !el.open) el.showModal();
      }}
      onClose={onClose}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-xl bg-transparent p-0 text-ivory backdrop:bg-ink/70 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="flex h-full flex-col border-l hairline bg-room">
        <div className="flex items-center justify-between border-b hairline px-6 py-5">
          <h2 className="display text-3xl">{show ? `Edit ${show.title}` : "Add a show"}</h2>
          <button type="button" onClick={() => ref.current?.close()} className="grid size-9 place-items-center rounded-full text-sage hover:bg-panel" aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <Field label="Show title" name="title" defaultValue={show?.title} required />
          <Field
            label="YouTube playlist or channel"
            name="youtubePlaylistId"
            defaultValue={show?.youtubePlaylistId}
            required
            hint="A playlist link (…/playlist?list=PL…) imports that playlist. A channel link (youtube.com/@name) imports all its full-length uploads."
          />
          <Field label="Tagline" name="tagline" defaultValue={show?.tagline} hint="One line shown on show tiles." />
          <div>
            <label htmlFor="f-description" className="mb-2 block text-sm text-sage">
              About the show
            </label>
            <textarea id="f-description" name="description" defaultValue={show?.description} rows={5} className="field" />
          </div>
          <Field label="Hosts" name="hosts" defaultValue={show?.hosts.join(", ")} hint="Separate names with commas." />
          <Field label="Schedule" name="schedule" defaultValue={show?.schedule} placeholder="New episodes every Thursday" />
          <Field label="Cover image link" name="coverImage" defaultValue={show?.coverImage} hint="Portrait 4:5 artwork works best — a full https:// link, or a file in /public such as /shows/massa-mentality-cover.jpg. Leave empty to use the latest episode thumbnail." />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="f-accent" className="mb-2 block text-sm text-sage">
                Accent colour
              </label>
              <div className="flex items-center gap-3">
                <input id="f-accent" type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-12 w-14 cursor-pointer rounded-md border hairline bg-room" />
                <span className="text-sm text-moss uppercase tabular-nums">{accent}</span>
              </div>
            </div>
            <Field label="Order on site" name="order" type="number" defaultValue={String(show?.order ?? 0)} />
          </div>
          <Field label="Web address" name="slug" defaultValue={show?.slug} hint="Leave empty to create one from the title." prefix="/shows/" />
          <div className="space-y-3 pt-2">
            <Check name="published" label="Show on the site" defaultChecked={show?.published ?? true} />
            <Check name="featured" label="Feature on the home page" defaultChecked={show?.featured ?? false} />
          </div>
          {error && (
            <p role="alert" className="rounded-md border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t hairline px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button type="button" className="btn btn-quiet" onClick={() => ref.current?.close()}>
            Cancel
          </button>
          <button className="btn btn-brass" disabled={busy}>
            {busy ? "Saving…" : show ? "Save changes" : "Add show"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function Field({
  label,
  name,
  hint,
  prefix,
  ...rest
}: { label: string; name: string; hint?: string; prefix?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-sage">
        {label}
      </label>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-moss">{prefix}</span>}
        <input id={id} name={name} className="field" style={prefix ? { paddingLeft: `${prefix.length * 0.55 + 1.1}rem` } : undefined} aria-describedby={hint ? `${id}-hint` : undefined} {...rest} />
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-moss">
          {hint}
        </p>
      )}
    </div>
  );
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-ivory">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-5 accent-[#c9a45c]" />
      {label}
    </label>
  );
}
