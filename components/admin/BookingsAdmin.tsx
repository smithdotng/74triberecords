"use client";

import { useMemo, useState } from "react";
import type { BookingDTO } from "@/lib/bookings";
import { hourLabel } from "@/lib/studio";
import { useToast } from "@/components/ui/Toast";

const STATUS_STYLE: Record<BookingDTO["status"], string> = {
  pending: "bg-brass/15 text-brass-soft",
  confirmed: "bg-[#9cc5a1]/15 text-[#b5d9b9]",
  declined: "bg-ember/12 text-ember",
  cancelled: "bg-panel text-moss",
};
const STATUS_LABEL: Record<BookingDTO["status"], string> = {
  pending: "Awaiting reply",
  confirmed: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
};

function prettyDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));
}

export function BookingsAdmin({ initial, today, mailReady }: { initial: BookingDTO[]; today: string; mailReady: boolean }) {
  const toast = useToast();
  const [bookings, setBookings] = useState(initial);
  const [filter, setFilter] = useState<"upcoming" | "pending" | "past">("upcoming");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const pendingCount = bookings.filter((b) => b.status === "pending" && b.date >= today).length;
  const shown = useMemo(() => {
    if (filter === "pending") return bookings.filter((b) => b.status === "pending" && b.date >= today);
    if (filter === "past") return bookings.filter((b) => b.date < today).reverse();
    return bookings.filter((b) => b.date >= today);
  }, [bookings, filter, today]);

  const update = async (b: BookingDTO, status: BookingDTO["status"], adminNote?: string) => {
    setBusy(b.id);
    const res = await fetch(`/api/admin/bookings/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast(data.error ?? "Couldn't update the booking.", "error");
    setBookings((list) => list.map((x) => (x.id === b.id ? data.booking : x)));
    toast(`${b.reference} ${STATUS_LABEL[status].toLowerCase()}${mailReady && (status === "confirmed" || status === "declined") ? " — guest emailed" : ""}`);
  };

  return (
    <section id="bookings" className="mt-20 scroll-mt-20 px-5 lg:px-10" aria-labelledby="bookings-h">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 id="bookings-h" className="display text-4xl">
            Bookings
          </h2>
          <p className="mt-2 max-w-xl text-sage">
            {pendingCount ? `${pendingCount} request${pendingCount === 1 ? "" : "s"} waiting for a reply.` : "No requests waiting."}{" "}
            {!mailReady && "Guests aren’t emailed automatically until SMTP is set up — reply to them directly."}
          </p>
        </div>
        <div className="flex rounded-full border hairline p-1 text-sm" role="group" aria-label="Filter bookings">
          {(
            [
              ["upcoming", "Upcoming"],
              ["pending", "Awaiting reply"],
              ["past", "Past 30 days"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              aria-pressed={filter === k}
              className={`rounded-full px-3.5 py-1.5 transition-colors ${filter === k ? "bg-panel text-ivory" : "text-sage hover:text-ivory"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-8 max-w-4xl border-y hairline py-8 text-sage">Nothing here. New requests from the Book page appear in this list.</p>
      ) : (
        <ul className="mt-8 max-w-5xl divide-y divide-seam border-y hairline">
          {shown.map((b) => (
            <li key={b.id} className="py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => setOpen(open === b.id ? null : b.id)}
                  aria-expanded={open === b.id}
                  className="grid min-w-0 flex-1 grid-cols-[5.5rem_1fr] gap-x-4 text-left sm:grid-cols-[6.5rem_1fr]"
                >
                  <span className="tabular-nums">
                    <span className="block text-ivory">{prettyDate(b.date)}</span>
                    <span className="block text-sm text-moss">
                      {hourLabel(b.startHour)}–{hourLabel(b.startHour + b.hours)}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ivory">{b.spaceName}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-sage">
                      {b.name}
                      {b.company ? `, ${b.company}` : ""} · {b.guests} on set · {b.reference}
                    </span>
                  </span>
                </button>
                <div className="flex shrink-0 gap-1 pl-[6.5rem] sm:pl-0">
                  {b.status !== "confirmed" && b.status !== "cancelled" && (
                    <button className="btn btn-ghost h-9 px-3 text-sm" disabled={busy === b.id} onClick={() => update(b, "confirmed")}>
                      Confirm
                    </button>
                  )}
                  {b.status === "pending" && (
                    <button className="btn btn-quiet h-9 px-3 text-sm hover:text-ember" disabled={busy === b.id} onClick={() => update(b, "declined")}>
                      Decline
                    </button>
                  )}
                  {b.status === "confirmed" && (
                    <button className="btn btn-quiet h-9 px-3 text-sm hover:text-ember" disabled={busy === b.id} onClick={() => update(b, "cancelled")}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              {open === b.id && (
                <div className="sheet-enter mt-4 grid gap-4 rounded-md bg-room/60 p-4 text-sm sm:ml-[6.5rem] sm:grid-cols-2">
                  <p>
                    <span className="block text-moss">Email</span>
                    <a href={`mailto:${b.email}?subject=${encodeURIComponent(`Your booking ${b.reference}`)}`} className="text-brass-soft hover:underline">
                      {b.email}
                    </a>
                  </p>
                  <p>
                    <span className="block text-moss">Phone</span>
                    <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="text-brass-soft hover:underline">
                      {b.phone}
                    </a>
                  </p>
                  {b.production && (
                    <p className="sm:col-span-2">
                      <span className="block text-moss">Recording</span>
                      <span className="text-ivory">{b.production}</span>
                    </p>
                  )}
                  {b.notes && (
                    <p className="whitespace-pre-line sm:col-span-2">
                      <span className="block text-moss">Notes</span>
                      <span className="text-ivory">{b.notes}</span>
                    </p>
                  )}
                  <form
                    className="flex gap-2 sm:col-span-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const note = String(new FormData(e.currentTarget).get("note") ?? "");
                      update(b, b.status, note);
                    }}
                  >
                    <label htmlFor={`note-${b.id}`} className="sr-only">
                      Note to the guest
                    </label>
                    <input
                      id={`note-${b.id}`}
                      name="note"
                      defaultValue={b.adminNote}
                      placeholder="Note to include when you confirm or decline (e.g. price, call time)"
                      className="field h-10"
                    />
                    <button className="btn btn-quiet h-10 shrink-0 px-3 text-sm">Save note</button>
                  </form>
                  <p className="text-xs text-moss sm:col-span-2">Requested {new Date(b.createdAt).toLocaleString("en-GB")}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
