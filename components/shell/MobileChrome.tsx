"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "./Logo";
import { NAV } from "./nav";
import { Avatar } from "./UserMenu";

export function MobileHeader() {
  const { data } = useSession();
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b hairline bg-ink/85 px-5 backdrop-blur-xl lg:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(60px + env(safe-area-inset-top))" }}
    >
      <Logo />
      {data?.user ? (
        <Link href="/account" aria-label="Your account">
          <Avatar name={data.user.name} image={data.user.image} size={32} />
        </Link>
      ) : (
        <Link href="/signin" className="text-sm font-medium text-brass-soft">
          Sign in
        </Link>
      )}
    </header>
  );
}

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 border-t hairline bg-ink/92 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid h-(--tabbar-h) grid-cols-5">
        {NAV.map((n) => {
          const active = n.match(pathname);
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[0.7rem] ${active ? "text-ivory" : "text-moss"}`}
              >
                <Icon name={n.icon} size={21} className={active ? "text-brass" : ""} />
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
