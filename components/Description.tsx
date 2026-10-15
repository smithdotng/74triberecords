"use client";

import { useState } from "react";

/** Episode notes, linkified, collapsed to a few lines until the viewer asks for more. */
export function Description({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 420 || text.split("\n").length > 6;
  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  return (
    <div className="mt-8 max-w-3xl rounded-md border hairline bg-room/50 p-5 sm:p-6">
      <p className={`prose-studio text-[0.95rem] ${!open && long ? "line-clamp-5" : ""}`}>
        {parts.map((p, i) =>
          /^https?:\/\//.test(p) ? (
            <a key={i} href={p} target="_blank" rel="noreferrer" className="text-brass-soft underline decoration-brass/40 underline-offset-2 hover:decoration-brass">
              {p.replace(/^https?:\/\/(www\.)?/, "").slice(0, 60)}
            </a>
          ) : (
            p
          )
        )}
      </p>
      {long && (
        <button onClick={() => setOpen((o) => !o)} className="mt-3 text-sm font-medium text-ivory hover:text-brass-soft" aria-expanded={open}>
          {open ? "Show less" : "Show full notes"}
        </button>
      )}
    </div>
  );
}
