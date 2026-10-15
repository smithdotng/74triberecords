"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";

export function NewPlaylistButton() {
  const router = useRouter();
  const toast = useToast();
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast(data.error ?? "Couldn't create the playlist.", "error");
    ref.current?.close();
    toast(`Created ${data.name}`);
    router.push(`/library/${data.id}`);
  };

  return (
    <>
      <button className="btn btn-brass" onClick={() => ref.current?.showModal()}>
        <Icon name="plus" size={17} />
        New playlist
      </button>
      <dialog
        ref={ref}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-0 mt-auto w-full max-w-none bg-transparent p-0 text-ivory backdrop:bg-ink/70 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-md"
      >
        <form onSubmit={submit} className="sheet-enter rounded-t-2xl border hairline bg-room p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-xl">
          <h2 className="display text-3xl">New playlist</h2>
          <label className="mt-6 block text-sm text-sage" htmlFor="pl-name">
            Name
          </label>
          <input id="pl-name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="field mt-2" placeholder="Sunday listening" />
          <label className="mt-4 block text-sm text-sage" htmlFor="pl-desc">
            Description <span className="text-moss">(optional)</span>
          </label>
          <textarea id="pl-desc" maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} className="field mt-2" rows={3} />
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn btn-quiet" onClick={() => ref.current?.close()}>
              Cancel
            </button>
            <button className="btn btn-brass" disabled={busy || !name.trim()}>
              Create playlist
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
