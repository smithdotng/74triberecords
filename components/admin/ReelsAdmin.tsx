"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReelDTO } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { ReelCover } from "@/components/reels/ReelCover";

type ShowOption = { slug: string; title: string };

export function ReelsAdmin({ initialReels, shows, instagramReady }: { initialReels: ReelDTO[]; shows: ShowOption[]; instagramReady: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [reels, setReels] = useState(initialReels);
  const [busy, setBusy] = useState<string | null>(null);

  const reload = async () => {
    const res = await fetch("/api/admin/reels");
    if (res.ok) setReels((await res.json()).reels);
    router.refresh();
  };

  const sync = async () => {
    setBusy("sync");
    const res = await fetch("/api/admin/reels/sync", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast(data.error ?? "Couldn't import from Instagram.", "error");
    toast(`${data.reels} reels imported from Instagram`);
    reload();
  };

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const f = new FormData(formEl);
    setBusy("add");
    const res = await fetch("/api/admin/reels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: f.get("url"), caption: f.get("caption"), coverImage: f.get("coverImage"), showSlug: f.get("showSlug") }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast(data.error ?? "Couldn't add that reel.", "error");
    toast("Reel added");
    formEl.reset();
    reload();
  };

  const patch = async (r: ReelDTO, body: Partial<Pick<ReelDTO, "hidden" | "showSlug">>, message: string) => {
    setBusy(r.id);
    const res = await fetch(`/api/admin/reels/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(null);
    if (!res.ok) return toast("Couldn't update the reel.", "error");
    toast(message);
    reload();
  };

  const remove = async (r: ReelDTO) => {
    if (!confirm(r.source === "instagram" ? "Hide this reel from the site? It stays on Instagram." : "Remove this reel from the site?")) return;
    setBusy(r.id);
    const res = await fetch(`/api/admin/reels/${r.id}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) return toast("Couldn't remove the reel.", "error");
    toast(r.source === "instagram" ? "Reel hidden" : "Reel removed");
    reload();
  };

  return (
    <section className="mt-20 px-5 lg:px-10" aria-labelledby="reels-admin">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 id="reels-admin" className="display text-4xl">
            Instagram reels
          </h2>
          <p className="mt-2 max-w-xl text-sage">
            {instagramReady
              ? "Reels from your Instagram account import automatically and play right on the site. You can also add any reel by its link."
              : "Paste a reel link to show it on the site. To import every reel automatically, add INSTAGRAM_ACCESS_TOKEN (see the README)."}
          </p>
        </div>
        {instagramReady && (
          <button className="btn btn-ghost" onClick={sync} disabled={busy === "sync"}>
            <Icon name="refresh" size={17} className={busy === "sync" ? "animate-spin" : ""} />
            {busy === "sync" ? "Importing…" : "Import from Instagram"}
          </button>
        )}
      </div>

      <form onSubmit={add} className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="reel-url" className="mb-2 block text-sm text-sage">
            Reel link
          </label>
          <input id="reel-url" name="url" required className="field" placeholder="https://www.instagram.com/reel/…" />
        </div>
        <div>
          <label htmlFor="reel-show" className="mb-2 block text-sm text-sage">
            From the show <span className="text-moss">(optional)</span>
          </label>
          <select id="reel-show" name="showSlug" className="field" defaultValue="">
            <option value="">Not linked to a show</option>
            {shows.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="reel-cover" className="mb-2 block text-sm text-sage">
            Cover image link <span className="text-moss">(optional)</span>
          </label>
          <input id="reel-cover" name="coverImage" className="field" placeholder="https://…" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="reel-caption" className="mb-2 block text-sm text-sage">
            Caption for the reel tile <span className="text-moss">(optional)</span>
          </label>
          <input id="reel-caption" name="caption" maxLength={300} className="field" />
        </div>
        <div>
          <button className="btn btn-brass" disabled={busy === "add"}>
            {busy === "add" ? "Adding…" : "Add reel"}
          </button>
        </div>
      </form>

      {reels.length > 0 ? (
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-7">
          {reels.map((r) => (
            <li key={r.id} className={r.hidden ? "opacity-50" : ""}>
              <div className="relative aspect-9/16 overflow-hidden rounded-md bg-room">
                <ReelCover reel={r} />
                <span className="absolute top-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-[0.7rem] text-ivory">
                  {r.hidden ? "Hidden" : r.source === "instagram" ? "Imported" : "Added by link"}
                </span>
              </div>
              <label className="sr-only" htmlFor={`rs-${r.id}`}>
                Show for this reel
              </label>
              <select
                id={`rs-${r.id}`}
                value={r.showSlug}
                disabled={busy === r.id}
                onChange={(e) => patch(r, { showSlug: e.target.value }, "Reel updated")}
                className="field mt-2 h-9 px-2 text-sm"
              >
                <option value="">No show</option>
                {shows.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title}
                  </option>
                ))}
              </select>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-moss">{formatDate(r.publishedAt)}</span>
                {r.hidden ? (
                  <button onClick={() => patch(r, { hidden: false }, "Reel visible again")} className="btn btn-quiet h-8 px-2 text-xs" disabled={busy === r.id}>
                    <Icon name="eye" size={14} />
                    Show
                  </button>
                ) : (
                  <button onClick={() => remove(r)} className="btn btn-quiet h-8 px-2 text-xs hover:text-ember" disabled={busy === r.id}>
                    <Icon name="trash" size={14} />
                    {r.source === "instagram" ? "Hide" : "Remove"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 max-w-4xl border-y hairline py-8 text-sage">No reels yet. Add one above and it appears on the home page and in the Reels feed.</p>
      )}
    </section>
  );
}
