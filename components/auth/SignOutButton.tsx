"use client";

import { signOut } from "next-auth/react";
import { Icon } from "@/components/ui/Icon";

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-ghost mt-8 w-full">
      <Icon name="logout" size={17} />
      Sign out
    </button>
  );
}
