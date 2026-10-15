import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { SPACES, STUDIO_CONTACT } from "@/lib/studio";
import { SetPlan } from "@/components/studio/SetPlan";

export const metadata: Metadata = pageMeta({
  title: "About the studio",
  description:
    "A premium recording and streaming facility for shows and podcast hosts — lounge, coffee table, news and full sets, a world-class recording studio, meeting rooms and lounges.",
  path: "/about",
});

const STEPS = [
  { title: "Request a session", body: "Choose a space, a date and how long you need. It takes two minutes." },
  { title: "We confirm", body: "The studio team checks the details and confirms your booking by email." },
  { title: "Record", body: "Arrive, settle into the lounge, and step onto a set that's ready when you are." },
  { title: "Reach your audience", body: "Stream live or publish afterwards — and your show can live right here on 74 Tribe." },
];

export default function AboutPage() {
  const sets = SPACES.filter((s) => s.kind === "set");
  const rooms = SPACES.filter((s) => s.kind === "room");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pt-14 pb-16 lg:px-10 lg:pt-24 lg:pb-24">
        <div className="max-w-4xl">
          <h1 className="hero-line display text-[2.9rem] text-balance sm:text-7xl lg:text-[5.75rem]">
            A home for the conversations your audience is waiting for.
          </h1>
          <p className="hero-line mt-7 max-w-2xl text-lg leading-relaxed text-sage sm:text-xl" style={{ animationDelay: "0.15s" }}>
            74 Tribe Studios is a premium facility built for shows and podcast hosts — a place to record, film and stream
            with everything already in place, so you can focus on the conversation and reach the people who want to hear it.
          </p>
          <div className="hero-line mt-9 flex flex-wrap gap-3" style={{ animationDelay: "0.3s" }}>
            <Link href="/book" className="btn btn-brass">
              Book a session
            </Link>
            <a href="#spaces" className="btn btn-ghost">
              See the spaces
            </a>
          </div>
        </div>
        <div className="hero-weave weave mt-16 h-2" aria-hidden />
      </section>

      {/* What's in the building */}
      <section className="px-5 lg:px-10" aria-labelledby="facility">
        <div className="grid gap-10 border-y hairline py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-14">
          <h2 id="facility" className="display text-4xl">
            Under one roof
          </h2>
          <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {[
              ["Four filming sets", "Lounge, coffee table, news, and the full set for bigger productions."],
              ["A world-class recording studio", "An acoustically treated room for audio-first shows and voice work."],
              ["Meeting rooms", "Private space for planning, guest briefings and playback."],
              ["Lounges", "Somewhere comfortable for hosts and guests before and between takes."],
            ].map(([t, d]) => (
              <div key={t}>
                <dt className="text-lg font-medium text-ivory">{t}</dt>
                <dd className="mt-1.5 leading-relaxed text-sage">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Spaces */}
      <section id="spaces" className="scroll-mt-24 px-5 pt-20 lg:px-10" aria-labelledby="sets-heading">
        <h2 id="sets-heading" className="display text-5xl sm:text-6xl">
          The sets
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-sage">Each set is lit, mic’d and framed for camera. Pick the one that suits your format.</p>
        <div className="mt-12 space-y-16 lg:space-y-24">
          {sets.map((s, i) => (
            <SpaceRow key={s.slug} space={s} flip={i % 2 === 1} />
          ))}
        </div>

        <h2 className="display mt-24 text-5xl sm:text-6xl">Rooms</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {rooms.map((s) => (
            <article key={s.slug} className="rounded-lg border hairline bg-room/50 p-6 lg:p-8">
              <div className="overflow-hidden rounded-md bg-ink text-brass/80">
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt={`The ${s.name.toLowerCase()} at 74 Tribe Studios`} className="aspect-[400/260] w-full object-cover" style={{ objectPosition: s.imageFocus }} />
                ) : (
                  <SetPlan slug={s.slug} className="w-full" />
                )}
              </div>
              <h3 className="display mt-6 text-3xl">{s.name}</h3>
              <p className="mt-3 leading-relaxed text-sage">{s.description}</p>
              <p className="mt-4 text-sm text-moss">Good for {s.goodFor.join(", ").toLowerCase()}</p>
              <Link href={`/book?space=${s.slug}`} className="mt-6 inline-block text-sm font-medium text-brass-soft hover:underline">
                Book the {s.name.toLowerCase()}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Process — a real sequence, so numbered */}
      <section className="mt-24 px-5 lg:px-10" aria-labelledby="how">
        <div className="rounded-xl border hairline bg-room/40 px-6 py-12 lg:px-12">
          <h2 id="how" className="display text-4xl sm:text-5xl">
            How a booking works
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="display text-5xl text-brass" aria-hidden>
                  {i + 1}
                </span>
                <h3 className="mt-3 text-lg font-medium text-ivory">{s.title}</h3>
                <p className="mt-1.5 leading-relaxed text-sage">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing */}
      <section className="px-5 pt-24 lg:px-10">
        <div className="max-w-3xl">
          <h2 className="display text-5xl text-balance sm:text-6xl">Ready when you are.</h2>
          <p className="mt-5 text-lg text-sage">Tell us about your show and when you’d like to record. We’ll take it from there.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/book" className="btn btn-brass">
              Book a session
            </Link>
            {STUDIO_CONTACT.email && (
              <a href={`mailto:${STUDIO_CONTACT.email}`} className="text-brass-soft hover:underline">
                {STUDIO_CONTACT.email}
              </a>
            )}
            {STUDIO_CONTACT.phone && (
              <a href={`tel:${STUDIO_CONTACT.phone.replace(/\s/g, "")}`} className="text-brass-soft hover:underline">
                {STUDIO_CONTACT.phone}
              </a>
            )}
          </div>
          {STUDIO_CONTACT.address && <p className="mt-6 text-sage">{STUDIO_CONTACT.address}</p>}
        </div>
      </section>
    </div>
  );
}

function SpaceRow({ space, flip }: { space: (typeof SPACES)[number]; flip: boolean }) {
  return (
    <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div className={`overflow-hidden rounded-lg border hairline bg-room/60 text-brass/85 ${space.image ? "lg:aspect-[4/3]" : ""} ${flip ? "lg:order-2" : ""}`}>
        {space.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={space.image} alt={`The ${space.name.toLowerCase()} at 74 Tribe Studios`} className="aspect-[4/3] w-full object-cover" style={{ objectPosition: space.imageFocus }} />
        ) : (
          <SetPlan slug={space.slug} className="w-full" />
        )}
      </div>
      <div className="max-w-xl">
        <h3 className="display text-4xl sm:text-5xl">{space.name}</h3>
        <p className="mt-4 text-lg leading-relaxed text-sage">{space.description}</p>
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 text-sm">
          {space.capacity && (
            <div>
              <dt className="text-moss">Seats</dt>
              <dd className="text-ivory">Up to {space.capacity} people</dd>
            </div>
          )}
          <div>
            <dt className="text-moss">Good for</dt>
            <dd className="text-ivory">{space.goodFor.join(", ")}</dd>
          </div>
        </dl>
        <Link href={`/book?space=${space.slug}`} className="btn btn-ghost mt-7">
          Book the {space.name.toLowerCase()}
        </Link>
      </div>
    </article>
  );
}
