import type { Metadata } from "next";
import { getShows, searchEpisodes } from "@/lib/data";
import { EpisodeList } from "@/components/EpisodeList";
import { SearchBox } from "@/components/SearchBox";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const [results, shows] = await Promise.all([q ? searchEpisodes(q) : Promise.resolve([]), getShows()]);
  const matchingShows = q ? (shows ?? []).filter((s) => `${s.title} ${s.tagline} ${s.hosts.join(" ")}`.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <div className="px-5 pt-10 lg:px-10 lg:pt-20">
      <h1 className="display text-5xl sm:text-7xl">Search</h1>
      <div className="mt-8 max-w-2xl">
        <SearchBox initial={q} />
      </div>

      {!q && (
        <div className="mt-12">
          <p className="text-sage">Search every episode by title or topic, or jump straight to a show.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {(shows ?? []).map((s) => (
              <li key={s.slug}>
                <Link href={`/shows/${s.slug}`} className="inline-flex items-center gap-2.5 rounded-full border hairline px-4 py-2 text-sm text-ivory hover:border-brass">
                  <span className="size-2 rounded-full" style={{ background: s.accent }} />
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {q && (
        <div className="mt-12 max-w-5xl">
          {matchingShows.length > 0 && (
            <div className="mb-10">
              <h2 className="mb-4 text-sm text-moss">Shows</h2>
              <ul className="flex flex-wrap gap-2">
                {matchingShows.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/shows/${s.slug}`} className="inline-flex items-center gap-2.5 rounded-full border hairline px-4 py-2 text-ivory hover:border-brass">
                      <span className="size-2 rounded-full" style={{ background: s.accent }} />
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <h2 className="mb-4 text-sm text-moss">
            {results?.length ? `${results.length} episode${results.length === 1 ? "" : "s"} matching “${q}”` : `No episodes match “${q}”. Try a guest’s name or a single topic word.`}
          </h2>
          {results && results.length > 0 && <EpisodeList episodes={results} />}
        </div>
      )}
    </div>
  );
}
