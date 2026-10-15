"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "./Logo";
import { NAV } from "./nav";
import { UserMenu } from "./UserMenu";
import { InstallButton } from "./InstallButton";

export function Sidebar({ shows }: { shows: { slug: string; title: string; accent: string }[] }) {
  const pathname = usePathname();
  const { data } = useSession();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-(--sidebar-w) flex-col border-r hairline bg-ink lg:flex">
      <div className="px-6 pt-7 pb-8">
        <Logo />
      </div>

      <nav aria-label="Main" className="px-3">
        <ul className="space-y-0.5">
          {NAV.map((n) => {
            const active = n.match(pathname);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3.5 rounded-md px-3 py-2.5 text-[0.95rem] transition-colors ${
                    active ? "bg-room text-ivory" : "text-sage hover:text-ivory"
                  }`}
                >
                  <Icon name={n.icon} size={19} className={active ? "text-brass" : ""} />
                  {n.label}
                </Link>
              </li>
            );
          })}
          {data?.user?.role === "admin" && (
            <li>
              <Link
                href="/admin"
                aria-current={pathname.startsWith("/admin") ? "page" : undefined}
                className={`flex items-center gap-3.5 rounded-md px-3 py-2.5 text-[0.95rem] transition-colors ${
                  pathname.startsWith("/admin") ? "bg-room text-ivory" : "text-sage hover:text-ivory"
                }`}
              >
                <Icon name="shield" size={19} />
                Studio admin
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="mt-9 px-3">
        <p className="mb-2 px-3 text-[0.8125rem] text-moss">The studio</p>
        <ul className="space-y-0.5">
          {(
            [
              ["/about", "About the studio", "studio"],
              ["/book", "Book a session", "calendar"],
            ] as const
          ).map(([href, label, icon]) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3.5 rounded-md px-3 py-2.5 text-[0.95rem] transition-colors ${
                    active ? "bg-room text-ivory" : "text-sage hover:text-ivory"
                  }`}
                >
                  <Icon name={icon} size={19} className={active ? "text-brass" : ""} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {shows.length > 0 && (
        <div className="mt-9 min-h-0 flex-1 overflow-y-auto px-3">
          <p className="mb-2 px-3 text-[0.8125rem] text-moss">Our shows</p>
          <ul className="space-y-0.5">
            {shows.map((s) => {
              const active = pathname === `/shows/${s.slug}`;
              return (
                <li key={s.slug}>
                  <Link
                    href={`/shows/${s.slug}`}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-[0.9rem] transition-colors ${
                      active ? "text-ivory" : "text-sage hover:text-ivory"
                    }`}
                  >
                    <span className="h-3.5 w-[3px] rounded-full" style={{ background: s.accent }} />
                    <span className="truncate">{s.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-auto space-y-2 border-t hairline p-3">
        <InstallButton />
        <UserMenu />
      </div>
    </aside>
  );
}
