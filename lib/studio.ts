/**
 * The studio's spaces and booking rules. Edit this file to change what's offered on
 * the About and Book pages — names, descriptions, capacities, photos and hours.
 */

export type SpaceSlug = "lounge-set" | "coffee-table-set" | "news-set" | "full-set" | "recording-studio" | "meeting-room";

export type Space = {
  slug: SpaceSlug;
  name: string;
  /** One line used on cards and in the booking form */
  summary: string;
  description: string;
  /** Maximum people on set / in the room. Leave undefined when not fixed. */
  capacity?: number;
  /** What a session in this space is best for */
  goodFor: string[];
  /** Optional photo (put files in /public/studio/ and reference them as "/studio/name.jpg") */
  image?: string;
  /** Which part of the photo to keep in view when it's cropped (CSS object-position) */
  imageFocus?: string;
  /** Spaces booked as recording/filming sessions vs. supporting rooms */
  kind: "set" | "room";
};

export const SPACES: Space[] = [
  {
    slug: "lounge-set",
    name: "Lounge set",
    summary: "Relaxed sofa set for group conversations of up to five.",
    description:
      "Our signature conversation set. Deep seating arranged for natural eye-lines, so a host and up to four guests can talk the way they would at home — while every angle stays camera-ready.",
    capacity: 5,
    goodFor: ["Panel discussions", "Group podcasts", "Roundtables"],
    image: "/studio/lounge-set.jpg",
    imageFocus: "50% 38%",
    kind: "set",
  },
  {
    slug: "coffee-table-set",
    name: "Coffee table set",
    summary: "An intimate one-on-one setting around a low table.",
    description:
      "Two chairs, a low table and a warm backdrop. Built for long-form interviews where the conversation needs room to breathe and the guest needs to feel at ease.",
    goodFor: ["Interviews", "One-on-one podcasts", "Fireside chats"],
    kind: "set",
  },
  {
    slug: "news-set",
    name: "News set",
    summary: "A broadcast desk for bulletins, explainers and analysis.",
    description:
      "A presenter's desk with a clean broadcast backdrop for news-style formats — daily updates, market briefings, political analysis and straight-to-camera explainers.",
    goodFor: ["News bulletins", "Commentary", "Explainers"],
    kind: "set",
  },
  {
    slug: "full-set",
    name: "Full set",
    summary: "The whole floor for productions that need every angle.",
    description:
      "Take over the whole main floor for larger productions — multi-segment shows, launches and specials that move between the lounge, coffee table and news setups.",
    goodFor: ["Multi-segment shows", "Launches & specials", "Live streams"],
    kind: "set",
  },
  {
    slug: "recording-studio",
    name: "Recording studio",
    summary: "A world-class, acoustically treated room for audio.",
    description:
      "A world-class recording room for audio-first work — podcasts, voice-overs, audiobooks and music — with a treated live room and engineer-ready control setup.",
    goodFor: ["Audio podcasts", "Voice-over", "Music & audiobooks"],
    kind: "room",
  },
  {
    slug: "meeting-room",
    name: "Meeting room",
    summary: "A private room for planning, pre-interviews and reviews.",
    description:
      "Quiet, private rooms for pre-production meetings, guest briefings and playback reviews — next door to the sets so the day runs smoothly.",
    goodFor: ["Pre-production", "Guest briefings", "Playback reviews"],
    kind: "room",
  },
];

export const spaceBySlug = (slug: string) => SPACES.find((s) => s.slug === slug);

export const BOOKING_RULES = {
  /** Studio hours (24h, studio local time): earliest start and latest finish */
  openHour: 8,
  closeHour: 22,
  minHours: 1,
  maxHours: 10,
  /** How far ahead a session can be requested */
  maxDaysAhead: 180,
  timeZone: "Africa/Lagos",
};

/** Contact details shown on the About and Book pages. Fill these in. */
export const STUDIO_CONTACT = {
  email: process.env.NEXT_PUBLIC_STUDIO_EMAIL ?? "",
  phone: process.env.NEXT_PUBLIC_STUDIO_PHONE ?? "",
  address: process.env.NEXT_PUBLIC_STUDIO_ADDRESS ?? "",
};

export function hourLabel(h: number) {
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:00 ${h < 12 || h === 24 ? "am" : "pm"}`;
}

/** Today's date in the studio's time zone, as YYYY-MM-DD */
export function studioToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BOOKING_RULES.timeZone }).format(new Date());
}

/**
 * The full set takes over the main floor, so it can't run at the same time as the
 * individual floor sets (and they can't run while it's booked).
 */
const FLOOR_SETS: SpaceSlug[] = ["lounge-set", "coffee-table-set", "news-set"];
export function conflictingSpaces(slug: SpaceSlug): SpaceSlug[] {
  if (slug === "full-set") return ["full-set", ...FLOOR_SETS];
  if (FLOOR_SETS.includes(slug)) return [slug, "full-set"];
  return [slug];
}

