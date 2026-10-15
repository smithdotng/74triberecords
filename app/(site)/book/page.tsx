import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { getSession } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { STUDIO_CONTACT, studioToday } from "@/lib/studio";
import { BookingForm } from "@/components/studio/BookingForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMeta({
  title: "Book a session",
  description: "Request a session on our lounge, coffee table, news or full set, or in the recording studio. Pick a time and we'll confirm by email.",
  path: "/book",
});

export default async function BookPage({ searchParams }: { searchParams: Promise<{ space?: string }> }) {
  const { space } = await searchParams;
  const session = await getSession().catch(() => null);

  return (
    <div className="px-5 pt-12 lg:px-10 lg:pt-20">
      <header className="max-w-3xl">
        <h1 className="display text-5xl sm:text-7xl">Book a session</h1>
        <p className="mt-5 text-lg leading-relaxed text-sage">
          Choose a set or room, pick a time, and tell us a little about your show. We’ll confirm by email.{" "}
          <Link href="/about#spaces" className="text-brass-soft hover:underline">
            Compare the spaces
          </Link>
        </p>
        {(STUDIO_CONTACT.phone || STUDIO_CONTACT.email) && (
          <p className="mt-3 text-sm text-moss">
            Prefer to talk it through?{" "}
            {STUDIO_CONTACT.phone && (
              <a href={`tel:${STUDIO_CONTACT.phone.replace(/\s/g, "")}`} className="text-sage hover:text-ivory">
                {STUDIO_CONTACT.phone}
              </a>
            )}
            {STUDIO_CONTACT.phone && STUDIO_CONTACT.email && " or "}
            {STUDIO_CONTACT.email && (
              <a href={`mailto:${STUDIO_CONTACT.email}`} className="text-sage hover:text-ivory">
                {STUDIO_CONTACT.email}
              </a>
            )}
          </p>
        )}
      </header>
      <div className="mt-12">
        <BookingForm
          initialSpace={space}
          today={studioToday()}
          prefill={{ name: session?.user?.name ?? undefined, email: session?.user?.email ?? undefined }}
          available={isDbConfigured()}
        />
      </div>
    </div>
  );
}
