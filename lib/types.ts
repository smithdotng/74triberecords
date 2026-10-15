export type EpisodeDTO = {
  videoId: string;
  showSlug: string;
  showTitle?: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string | null;
  durationSeconds: number;
};

export type ShowDTO = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  hosts: string[];
  youtubePlaylistId: string;
  coverImage: string;
  accent: string;
  schedule: string;
  order: number;
  featured: boolean;
  published: boolean;
  episodeCount: number;
  lastSyncedAt: string | null;
};

export type PlaylistDTO = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  videoIds: string[];
  cover: string | null;
  updatedAt: string;
};

export type ReelDTO = {
  id: string;
  shortcode: string;
  permalink: string;
  caption: string;
  thumbnail: string;
  videoUrl: string;
  showSlug: string;
  showTitle?: string;
  source: "instagram" | "manual" | "demo";
  publishedAt: string | null;
  hidden?: boolean;
};
