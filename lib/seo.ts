import type { Metadata } from "next";

export const SITE_NAME = "74 Tribe Studios";
export const SITE_DESCRIPTION =
  "Watch every show from 74 Tribe Studios, catch the latest reels, and book our sets and recording studio for your own podcast or show.";
export const DEFAULT_OG_IMAGE = { url: "/og-default.png", width: 1200, height: 630, alt: "74 Tribe Studios" };

/** Public address of the site — used to make share links and images absolute. */
export function siteUrl() {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "";
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || vercel || "http://localhost:3000").replace(/\/$/, "");
}

type OgImage = { url: string; width?: number; height?: number; alt?: string };

type PageMetaInput = {
  /** Page title without the site name (it's appended automatically) */
  title?: string;
  description?: string;
  /** Path of the page, e.g. "/shows/the-diary-of-a-ceo" — becomes the canonical and og:url */
  path: string;
  image?: OgImage | string | null;
  type?: "website" | "video.episode" | "video.other" | "profile";
  /** Private pages (library, account, admin) should not be indexed or previewed */
  noindex?: boolean;
};

/**
 * Builds complete Open Graph + Twitter metadata for a page.
 * Next.js replaces (not merges) a parent's openGraph object when a page sets its own,
 * so every page goes through this helper to keep the full set of tags.
 */
export function pageMeta({ title, description = SITE_DESCRIPTION, path, image, type = "website", noindex }: PageMetaInput): Metadata {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const img: OgImage = !image ? DEFAULT_OG_IMAGE : typeof image === "string" ? { url: image, alt: title ?? SITE_NAME } : image;
  const desc = description.replace(/\s+/g, " ").trim().slice(0, 200);

  return {
    title: title ? { absolute: fullTitle } : { absolute: SITE_NAME },
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "en_NG",
      title: fullTitle,
      description: desc,
      url: path,
      images: [img],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [img.url],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** First paragraph of a YouTube/Instagram description, without links or hashtags, for meta descriptions. */
export function cleanDescription(text: string, fallback = SITE_DESCRIPTION) {
  const first = text
    .split(/\n\s*\n/)[0]
    .replace(/https?:\/\/\S+/g, "")
    .replace(/#[\w]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return first.length > 20 ? first : fallback;
}
