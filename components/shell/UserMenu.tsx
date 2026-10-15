"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Icon } from "@/components/ui/Icon";

export function Avatar({ name, image, size = 34 }: { name?: string | null; image?: string | null; size?: number }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
  ) : (
    <span
      className="display grid shrink-0 place-items-center rounded-full bg-panel text-brass-soft"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initials}
    </span>
  );
}

export function UserMenu() {
  const { data, status } = useSession();

  if (status === "loading") return <div className="h-12" />;

  if (!data?.user) {
    return (
      <div className="flex gap-2">
        <Link href="/signin" className="btn btn-ghost h-10 flex-1 px-3 text-sm">
          Sign in
        </Link>
        <Link href="/signup" className="btn btn-brass h-10 flex-1 px-3 text-sm">
          Join
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-1.5">
      <Avatar name={data.user.name} image={data.user.image} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ivory">{data.user.name}</p>
        <p className="truncate text-xs text-moss">{data.user.email}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="grid size-9 place-items-center rounded-full text-sage hover:bg-room hover:text-ivory"
        aria-label="Sign out"
        title="Sign out"
      >
        <Icon name="logout" size={17} />
      </button>
    </div>
  );
}
