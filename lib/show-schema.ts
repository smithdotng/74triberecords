import { z } from "zod";
import { slugify } from "./format";

export const showInputSchema = z
  .object({
    title: z.string().trim().min(2, "Enter the show title.").max(100),
    slug: z.string().trim().max(80).optional().default(""),
    tagline: z.string().trim().max(160).optional().default(""),
    description: z.string().trim().max(4000).optional().default(""),
    hosts: z
      .union([z.array(z.string()), z.string()])
      .optional()
      .transform((v) =>
        (Array.isArray(v) ? v : (v ?? "").split(","))
          .map((h) => h.trim())
          .filter(Boolean)
      ),
    youtubePlaylistId: z
      .string()
      .trim()
      .min(2, "Paste a YouTube playlist or channel link."),
    coverImage: z
      .union([z.url("Cover image must be a full https:// link or a path like /shows/cover.jpg."), z.string().regex(/^\/[\w./-]+$/), z.literal("")])
      .optional()
      .default(""),
    accent: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Accent must be a hex colour like #C9A45C.")
      .optional()
      .default("#C9A45C"),
    schedule: z.string().trim().max(80).optional().default(""),
    order: z.coerce.number().int().min(0).max(999).optional().default(0),
    featured: z.boolean().optional().default(false),
    published: z.boolean().optional().default(true),
  })
  .transform((v) => ({ ...v, slug: slugify(v.slug || v.title) }));

export type ShowInput = z.infer<typeof showInputSchema>;
