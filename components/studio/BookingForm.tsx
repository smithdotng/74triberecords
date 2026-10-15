"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BOOKING_RULES, SPACES, hourLabel, type SpaceSlug } from "@/lib/studio";

type Prefill = { name?: string; email?: string };

function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function prettyDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));
}

export function BookingForm({ initialSpace, today, prefill, available }: { initialSpace?: string; today: string; prefill: Prefill; available: boolean }) {
  const [space, setSpace] = useState<SpaceSlug>((SPACES.find((s) => s.slug === initialSpace)?.slug ?? SPACES[0].slug) as SpaceSlug);
  const [date, setDate] = useState(addDays(today, 1));
  const [startHour, setStartHour] = useState<number | null>(null);
  const [hours, setHours] = useState(2);
  const [guests, setGuests] = useState(2);
  const [taken, setTaken] = useState<Set<number>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const spaceInfo = SPACES.find((s) => s.slug === space)!;
  const maxGuests = spaceInfo.capacity ?? 30;

  useEffect(() => {
    if (guests > maxGuests) setGuests(maxGuests);
  }, [maxGuests, guests]);

  // Live availability for the chosen space and day
  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    fetch(`/api/bookings/availability?space=${space}&date=${date}`)
      .then((r) => (r.ok ? r.json() : { taken: [] }))
      .then((d: { taken: number[] }) => {
        if (!cancelled) setTaken(new Set(d.taken));
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoadingSlots(false));
    return () => {
      cancelled = true;
    };
  }, [space, date]);

  const startOptions = useMemo(() => {
    const out: number[] = [];
    for (let h = BOOKING_RULES.openHour; h < BOOKING_RULES.closeHour; h++) out.push(h);
    return out;
  }, []);

  const fits = (h: number, len: number) => {
    if (h + len > BOOKING_RULES.closeHour) return false;
    for (let x = h; x < h + len; x++) if (taken.has(x)) return false;
    return true;
  };

  // Drop a chosen start time that no longer fits after the space/date/length changes
  useEffect(() => {
    if (startHour !== null && !fits(startHour, hours)) setStartHour(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taken, hours]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (startHour === null) return setError("Choose a start time.");
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        space,
        date,
        startHour,
        hours,
        guests,
        production: f.get("production"),
        notes: f.get("notes"),
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone"),
        company: f.get("company"),
        website: f.get("website"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      if (res.status === 409) setTaken((t) => new Set([...t, ...Array.from({ length: hours }, (_, i) => startHour + i)]));
      return setError(data.error ?? "We couldn’t send your request. Try again.");
    }
    setDone(data.reference);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <div className="sheet-enter max-w-xl rounded-xl border hairline bg-room/60 p-8">
        <div className="weave mb-8 h-1.5 w-32" aria-hidden />
        <h2 className="display text-4xl">Request sent</h2>
        <p className="mt-4 text-lg text-sage">
          We’ve received your request for the <span className="text-ivory">{spaceInfo.name.toLowerCase()}</span> on{" "}
          <span className="text-ivory">{prettyDate(date)}</span>, {hourLabel(startHour!)} – {hourLabel(startHour! + hours)}. The studio team
          will confirm by email.
        </p>
        <p className="mt-6 text-sm text-moss">Your reference</p>
        <p className="display text-3xl tracking-wide text-brass-soft">{done}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-ghost">
            Back to the shows
          </Link>
          <button
            className="btn btn-quiet"
            onClick={() => {
              setDone(null);
              setStartHour(null);
            }}
          >
            Book another session
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-14">
      <div className="min-w-0 space-y-14">
        {/* 1. Space */}
        <fieldset>
          <legend className="display text-3xl">Choose a space</legend>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {SPACES.map((s) => {
              const active = s.slug === space;
              return (
                <label
                  key={s.slug}
                  className={`relative flex cursor-pointer flex-col rounded-lg border p-4 transition-colors ${
                    active ? "border-brass bg-brass/8" : "hairline bg-room/40 hover:border-sage/50"
                  }`}
                >
                  <input type="radio" name="space" value={s.slug} checked={active} onChange={() => setSpace(s.slug)} className="sr-only" />
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-medium text-ivory">{s.name}</span>
                    {s.capacity && <span className="shrink-0 text-xs text-moss">Up to {s.capacity}</span>}
                  </span>
                  <span className="mt-1 text-sm leading-relaxed text-sage">{s.summary}</span>
                  {active && <span className="absolute top-0 left-4 h-[3px] w-10 rounded-b bg-brass" aria-hidden />}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 2. When */}
        <fieldset>
          <legend className="display text-3xl">Pick a time</legend>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="b-date" className="mb-2 block text-sm text-sage">
                Date
              </label>
              <input
                id="b-date"
                type="date"
                required
                min={today}
                max={addDays(today, BOOKING_RULES.maxDaysAhead)}
                value={date}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="field [color-scheme:dark]"
              />
            </div>
            <div>
              <label htmlFor="b-hours" className="mb-2 block text-sm text-sage">
                Session length
              </label>
              <select id="b-hours" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="field">
                {Array.from({ length: BOOKING_RULES.maxHours - BOOKING_RULES.minHours + 1 }, (_, i) => i + BOOKING_RULES.minHours).map((h) => (
                  <option key={h} value={h}>
                    {h} {h === 1 ? "hour" : "hours"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="b-guests" className="mb-2 block text-sm text-sage">
                People on set
              </label>
              <select id="b-guests" value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="field">
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-7">
            <p id="start-label" className="mb-3 flex items-baseline justify-between text-sm text-sage">
              <span>Start time on {prettyDate(date)}</span>
              {loadingSlots && <span className="text-moss">Checking availability…</span>}
            </p>
            <div role="radiogroup" aria-labelledby="start-label" className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
              {startOptions.map((h) => {
                const ok = fits(h, hours);
                const isTaken = taken.has(h);
                const active = startHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={!ok}
                    onClick={() => setStartHour(h)}
                    title={isTaken ? "Already booked" : !ok ? "Not enough time before the next booking or closing" : undefined}
                    className={`h-11 rounded-md border text-sm tabular-nums transition-colors ${
                      active
                        ? "border-brass bg-brass text-ink"
                        : ok
                          ? "hairline bg-room/50 text-ivory hover:border-brass/70"
                          : isTaken
                            ? "border-transparent bg-transparent text-moss/50 line-through"
                            : "border-transparent bg-transparent text-moss/60"
                    }`}
                  >
                    {hourLabel(h)}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-moss">
              Studio hours {hourLabel(BOOKING_RULES.openHour)} – {hourLabel(BOOKING_RULES.closeHour)}, West Africa Time. Crossed-out times are already
              booked.
            </p>
          </div>
        </fieldset>

        {/* 3. About you */}
        <fieldset>
          <legend className="display text-3xl">About you and the show</legend>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Your name" required defaultValue={prefill.name} autoComplete="name" />
            <Field id="company" label="Company or show" autoComplete="organization" optional />
            <Field id="email" label="Email" type="email" required defaultValue={prefill.email} autoComplete="email" />
            <Field id="phone" label="Phone" type="tel" required autoComplete="tel" placeholder="+234 …" />
            <div className="sm:col-span-2">
              <Field id="production" label="What are you recording?" optional placeholder="e.g. Weekly podcast, 3 cameras, live on YouTube" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="b-notes" className="mb-2 block text-sm text-sage">
                Anything else we should know? <span className="text-moss">(optional)</span>
              </label>
              <textarea id="b-notes" name="notes" maxLength={1500} rows={4} className="field" />
            </div>
          </div>
          {/* Honeypot for bots */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="xl:sticky xl:top-8 xl:self-start">
        <div className="overflow-hidden rounded-xl border hairline bg-room/60">
          {spaceInfo.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={spaceInfo.slug}
              src={spaceInfo.image}
              alt={`The ${spaceInfo.name.toLowerCase()}`}
              className="sheet-enter aspect-[16/10] w-full object-cover"
              style={{ objectPosition: spaceInfo.imageFocus }}
            />
          )}
          <div className="p-6">
          <h2 className="display text-2xl">Your session</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Space" value={spaceInfo.name} />
            <Row label="Date" value={prettyDate(date)} />
            <Row label="Time" value={startHour === null ? "Choose a start time" : `${hourLabel(startHour)} – ${hourLabel(startHour + hours)}`} muted={startHour === null} />
            <Row label="Length" value={`${hours} ${hours === 1 ? "hour" : "hours"}`} />
            <Row label="People" value={String(guests)} />
          </dl>
          {error && (
            <p role="alert" className="mt-5 rounded-md border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
              {error}
            </p>
          )}
          <button className="btn btn-brass mt-6 w-full" disabled={busy || !available}>
            {busy ? "Sending request…" : "Request booking"}
          </button>
          <p className="mt-3 text-xs leading-relaxed text-moss">
            {available
              ? "This is a request — nothing is charged now. We’ll confirm availability and pricing by email."
              : "Online booking isn’t connected yet. Contact the studio directly to book."}
          </p>
          </div>
        </div>
      </aside>
    </form>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-moss">{label}</dt>
      <dd className={`text-right ${muted ? "text-moss" : "text-ivory"}`}>{value}</dd>
    </div>
  );
}

function Field({
  id,
  label,
  optional,
  ...rest
}: { id: string; label: string; optional?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={`b-${id}`} className="mb-2 block text-sm text-sage">
        {label} {optional && <span className="text-moss">(optional)</span>}
      </label>
      <input id={`b-${id}`} name={id} className="field" maxLength={120} {...rest} />
    </div>
  );
}
