import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/shell/UserMenu";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { InstallButton } from "@/components/shell/InstallButton";
import { Icon } from "@/components/ui/Icon";
import { getUserBookings } from "@/lib/bookings";
import { isDbConfigured } from "@/lib/db";
import { hourLabel } from "@/lib/studio";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await requireUser();
  if (!user) redirect("/signin?callbackUrl=/account");
  const bookings = isDbConfigured() ? await getUserBookings(user.id, user.email).catch(() => []) : [];

  return (
    <div className="mx-auto max-w-lg px-5 pt-12">
      <div className="flex items-center gap-4">
        <Avatar name={user.name} image={user.image} size={64} />
        <div className="min-w-0">
          <h1 className="display truncate text-4xl">{user.name}</h1>
          <p className="truncate text-sage">{user.email}</p>
        </div>
      </div>
      <section className="mt-10" aria-labelledby="my-bookings">
        <div className="flex items-baseline justify-between">
          <h2 id="my-bookings" className="display text-2xl">
            Your studio bookings
          </h2>
          <Link href="/book" className="text-sm text-brass-soft hover:underline">
            Book a session
          </Link>
        </div>
        {bookings.length === 0 ? (
          <p className="mt-3 text-sm text-sage">No bookings yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {bookings.slice(0, 8).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 rounded-md bg-room/60 px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate text-ivory">{b.spaceName}</span>
                  <span className="block text-moss tabular-nums">
                    {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(b.date + "T00:00:00Z"))},{" "}
                    {hourLabel(b.startHour)}–{hourLabel(b.startHour + b.hours)}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={`block ${b.status === "confirmed" ? "text-[#b5d9b9]" : b.status === "pending" ? "text-brass-soft" : "text-moss"}`}>
                    {{ pending: "Awaiting confirmation", confirmed: "Confirmed", declined: "Declined", cancelled: "Cancelled" }[b.status]}
                  </span>
                  <span className="block text-xs text-moss">{b.reference}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <ul className="mt-10 divide-y divide-seam border-y hairline">
        <li>
          <Link href="/library" className="flex items-center gap-4 py-4 text-ivory hover:text-brass-soft">
            <Icon name="library" />
            Your playlists
          </Link>
        </li>
        <li>
          <Link href="/about" className="flex items-center gap-4 py-4 text-ivory hover:text-brass-soft">
            <Icon name="studio" />
            About the studio
          </Link>
        </li>
        {user.role === "admin" && (
          <li>
            <Link href="/admin" className="flex items-center gap-4 py-4 text-ivory hover:text-brass-soft">
              <Icon name="shield" />
              Studio admin
            </Link>
          </li>
        )}
        <li className="py-2">
          <InstallButton className="-mx-3" />
        </li>
      </ul>
      <SignOutButton />
    </div>
  );
}
