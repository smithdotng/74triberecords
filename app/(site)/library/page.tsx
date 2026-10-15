import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getUserPlaylists } from "@/lib/data";
import { isDemo } from "@/lib/demo";
import { NewPlaylistButton } from "@/components/library/NewPlaylistButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your library" };

export default async function LibraryPage() {
  if (isDemo()) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <h1 className="display text-5xl">Your library</h1>
        <p className="mt-5 text-lg text-sage">Playlists are saved to your account, so they need the database. Connect MONGODB_URI to switch them on.</p>
      </div>
    );
  }
  const user = await requireUser();
  if (!user) redirect("/signin?callbackUrl=/library");
  const playlists = (await getUserPlaylists(user.id)) ?? [];

  return (
    <div className="px-5 pt-10 lg:px-10 lg:pt-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="display text-5xl sm:text-7xl">Your library</h1>
          <p className="mt-4 text-lg text-sage">
            {playlists.length
              ? `${playlists.length} playlist${playlists.length === 1 ? "" : "s"}, saved to your account on every device.`
              : "Gather episodes into playlists to watch in order, or keep for later."}
          </p>
        </div>
        <NewPlaylistButton />
      </div>

      {playlists.length === 0 ? (
        <div className="mt-14 max-w-xl border-t hairline pt-10">
          <h2 className="display text-3xl">Start your first playlist</h2>
          <p className="mt-3 text-sage">
            Press the <span className="text-ivory">+</span> beside any episode to save it, or create an empty playlist now and fill it as you browse.
          </p>
          <Link href="/shows" className="btn btn-ghost mt-6">
            Browse shows
          </Link>
        </div>
      ) : (
        <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {playlists.map((p) => (
            <li key={p.id}>
              <Link href={`/library/${p.id}`} className="group block">
                <div className="relative aspect-video">
                  {/* Stacked sleeves suggest a collection */}
                  <span className="absolute inset-x-6 -top-3 h-full rounded-[3px] bg-panel/60" aria-hidden />
                  <span className="absolute inset-x-3 -top-1.5 h-full rounded-[3px] bg-panel" aria-hidden />
                  <span className="relative block h-full overflow-hidden rounded-[3px] bg-room">
                    {p.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    ) : (
                      <span className="weave block h-full opacity-25" />
                    )}
                    <span className="absolute right-2 bottom-2 rounded-sm bg-ink/85 px-2 py-0.5 text-xs text-ivory tabular-nums backdrop-blur">
                      {p.itemCount} {p.itemCount === 1 ? "episode" : "episodes"}
                    </span>
                  </span>
                </div>
                <p className="mt-4 text-lg font-medium text-ivory group-hover:text-brass-soft">{p.name}</p>
                {p.description && <p className="mt-1 line-clamp-2 text-sm text-sage">{p.description}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
