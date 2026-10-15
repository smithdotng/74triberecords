import type { EpisodeDTO, ReelDTO, ShowDTO } from "./types";

/**
 * Sample catalogue shown only when MONGODB_URI is not set, so the design can be previewed
 * before the database is connected. Replace with real shows from the admin page.
 */
export const isDemo = () => !process.env.MONGODB_URI;

const base = {
  coverImage: "",
  schedule: "",
  published: true,
  featured: false,
  lastSyncedAt: null,
  youtubePlaylistId: "demo",
};

export const demoShows: ShowDTO[] = [
  {
    ...base,
    id: "d1",
    slug: "the-tribe-table",
    title: "The Tribe Table",
    tagline: "Long conversations about culture, community and the people shaping both.",
    description:
      "Every week a new guest pulls up a chair. We talk about where they come from, what they're building and what they've had to unlearn along the way.",
    hosts: ["Host name"],
    accent: "#C9A45C",
    schedule: "New episodes every Thursday",
    order: 1,
    featured: true,
    episodeCount: 6,
    coverImage: "/demo/the-tribe-table-cover.jpg",
  },
  {
    ...base,
    id: "d2",
    slug: "seventy-four",
    title: "Seventy-Four",
    tagline: "Founders, makers and operators on the work behind the work.",
    description: "Unhurried interviews with the people building companies, institutions and movements across the continent.",
    hosts: ["Host name"],
    accent: "#D08A6E",
    schedule: "Fortnightly on Mondays",
    order: 2,
    episodeCount: 6,
    coverImage: "/demo/seventy-four-cover.jpg",
  },
  {
    ...base,
    id: "d3",
    slug: "after-hours",
    title: "After Hours",
    tagline: "Music, film and the arts — recorded late, played loud.",
    description: "Artists in the studio after the lights go down: new work, old influences and live sessions.",
    hosts: ["Host name"],
    accent: "#8FB3C9",
    schedule: "Fridays",
    order: 3,
    episodeCount: 6,
    coverImage: "/demo/after-hours-cover.jpg",
  },
  {
    ...base,
    id: "d4",
    slug: "kinship",
    title: "Kinship",
    tagline: "Faith, family and the relationships that hold us together.",
    description: "Honest conversations about marriage, parenting, friendship and faith — the questions we usually keep to ourselves.",
    hosts: ["Host name"],
    accent: "#B9A3D6",
    schedule: "Sundays",
    order: 4,
    episodeCount: 6,
    coverImage: "/demo/kinship-cover.jpg",
  },
  {
    ...base,
    id: "d5",
    slug: "the-ledger",
    title: "The Ledger",
    tagline: "Money, markets and making it — explained without the jargon.",
    description: "Personal finance, business and the economy, with guests who have done it rather than just studied it.",
    hosts: ["Host name"],
    accent: "#9CC5A1",
    schedule: "Wednesdays",
    order: 5,
    episodeCount: 6,
    coverImage: "/demo/the-ledger-cover.jpg",
  },
];

const titles: Record<string, string[]> = {
  "the-tribe-table": [
    "Home is a verb",
    "What our grandparents knew",
    "The cost of being first",
    "Leaving and coming back",
    "Language, loss and the mother tongue",
    "Building a table big enough",
  ],
  "seventy-four": [
    "Starting with nothing but a market stall",
    "Hiring your first ten people",
    "When the funding round falls through",
    "Selling to government without losing your mind",
    "The quiet years before the overnight success",
    "Handing over the company you started",
  ],
  "after-hours": [
    "A live session in the dark",
    "Scoring a film on a laptop",
    "Highlife, remixed",
    "The gallery is a street corner",
    "Writing songs in three languages",
    "One take only",
  ],
  kinship: [
    "The first year of marriage",
    "Parenting teenagers in a phone age",
    "Friendships that survive distance",
    "Faith when nothing makes sense",
    "Talking to our fathers",
    "Forgiveness is not forgetting",
  ],
  "the-ledger": [
    "Your first budget, honestly",
    "Saving in a high-inflation economy",
    "Is real estate still the safe bet?",
    "Pricing your work",
    "Debt: the good, the bad and the ugly",
    "Retiring early, the African way",
  ],
};

const durations = [3720, 2890, 4410, 3150, 5230, 2640];

export const demoEpisodes: EpisodeDTO[] = demoShows.flatMap((show, si) =>
  titles[show.slug].map((title, i) => ({
    videoId: `demo-${show.slug}-${i + 1}`,
    showSlug: show.slug,
    showTitle: show.title,
    title,
    description: `${show.tagline} In this episode: ${title.toLowerCase()}. This is sample text — real descriptions come from YouTube when you connect your playlists.`,
    thumbnail: `/demo/${show.slug}-${(i % 3) + 1}.jpg`,
    publishedAt: new Date(Date.UTC(2026, 9, 12 - i * 7 - si)).toISOString(),
    durationSeconds: durations[(i + si) % durations.length],
  }))
);

const reelCaptions = [
  "The moment the room went quiet. Full conversation on The Tribe Table.",
  "Three rules for your first hire — from this week's Seventy-Four.",
  "One take, no edits. After Hours live session.",
  "What our fathers never said out loud. Kinship, Sunday.",
  "Saving when prices won't sit still. The Ledger breaks it down.",
  "Behind the scenes at 74 Tribe Studios.",
];
const reelShows = ["the-tribe-table", "seventy-four", "after-hours", "kinship", "the-ledger", ""];

export const demoReels: ReelDTO[] = reelCaptions.map((caption, i) => ({
  id: `demo-reel-${i + 1}`,
  shortcode: `demo-reel-${i + 1}`,
  permalink: "https://www.instagram.com/",
  caption,
  thumbnail: `/demo/reel-${i + 1}.jpg`,
  videoUrl: "",
  showSlug: reelShows[i],
  showTitle: demoShows.find((s) => s.slug === reelShows[i])?.title,
  source: "demo",
  publishedAt: new Date(Date.UTC(2026, 9, 13 - i * 2)).toISOString(),
}));
