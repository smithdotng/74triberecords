import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getUserPlaylist } from "@/lib/data";
import { PlaylistView } from "@/components/library/PlaylistView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await requireUser();
  const p = user ? await getUserPlaylist(user.id, (await params).id) : null;
  return { title: p?.name ?? "Playlist" };
}

export default async function PlaylistPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();
  if (!user) redirect(`/signin?callbackUrl=/library/${id}`);
  const playlist = await getUserPlaylist(user.id, id);
  if (!playlist) notFound();
  return <PlaylistView playlist={playlist} />;
}
