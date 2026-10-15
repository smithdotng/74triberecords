import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/shell/UserMenu";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { InstallButton } from "@/components/shell/InstallButton";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await requireUser();
  if (!user) redirect("/signin?callbackUrl=/account");

  return (
    <div className="mx-auto max-w-lg px-5 pt-12">
      <div className="flex items-center gap-4">
        <Avatar name={user.name} image={user.image} size={64} />
        <div className="min-w-0">
          <h1 className="display truncate text-4xl">{user.name}</h1>
          <p className="truncate text-sage">{user.email}</p>
        </div>
      </div>
      <ul className="mt-10 divide-y divide-seam border-y hairline">
        <li>
          <Link href="/library" className="flex items-center gap-4 py-4 text-ivory hover:text-brass-soft">
            <Icon name="library" />
            Your playlists
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
