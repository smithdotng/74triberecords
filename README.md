# 74 Tribe Studios

The streaming home for 74 Tribe Studios' shows. Episodes live on YouTube and play on this site inside a persistent player; visitors can sign in, build playlists and pick up where they left off. Installable as a PWA on phones and desktops.

**Stack:** Next.js 16 (App Router, TypeScript) · MongoDB Atlas with Mongoose · NextAuth (email + password, optional Google) · Tailwind CSS 4 · YouTube Data API v3 + IFrame Player API

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill it in (see below)
npm run dev                    # http://localhost:3000
```

With no `MONGODB_URI` set, the site runs on a built-in **sample catalogue** so you can review the design. A banner at the top says so. Add the database to switch to real data.

### Environment

| Variable | Required | What it does |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | yes | Session encryption. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | yes | The site's public URL (`http://localhost:3000` locally) |
| `YOUTUBE_API_KEY` | recommended | Imports whole playlists. Google Cloud Console → enable *YouTube Data API v3* → create an API key |
| `ADMIN_EMAILS` | yes | Comma-separated emails that get Studio admin |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Shows "Continue with Google". Redirect URI: `<NEXTAUTH_URL>/api/auth/callback/google` |
| `CRON_SECRET` | optional | Protects the scheduled sync endpoint |
| `INSTAGRAM_ACCESS_TOKEN` | optional | Imports reels automatically from the studio's Instagram account (see below) |

## Adding the shows

Each show is one **YouTube playlist**.

1. Sign up on the site with an email listed in `ADMIN_EMAILS`.
2. Open **Studio admin** (sidebar on desktop, account page on mobile).
3. **Add a show** → paste a playlist link, or a channel link such as `https://www.youtube.com/@TheDiaryOfACEO`, plus the title, tagline, hosts, cover art and an accent colour. A channel link imports that channel's uploads, skipping Shorts and clips under 3 minutes (the newest 500 videos).
4. With `YOUTUBE_API_KEY` set, every public, embeddable video in the playlist is imported straight away. Without a key, use **Add a single episode** to publish videos one by one.

Alternatively, edit `scripts/shows.json` and run `npm run seed`, then press **Sync all shows** in admin. It ships with *The Diary Of A CEO* (the channel's uploads playlist, `UUGq-a57w-aPwyi3pW7XLiHw`).

**Keeping episodes fresh:** a show re-syncs in the background whenever its page is visited and the last sync is more than 6 hours old. On Vercel, `vercel.json` also schedules `/api/cron/sync` every 6 hours (set `CRON_SECRET`; Vercel sends it automatically). On other hosts, call `GET /api/cron/sync` with `Authorization: Bearer <CRON_SECRET>` from any scheduler.

Grant admin to an existing account from the command line: `npm run make-admin -- someone@example.com`

## Instagram reels

Reels appear in three places: a **Reels** row on the home page, a full-screen swipeable **Reels** feed (`/reels`, in the main navigation), and a "Clips from…" row on each show page for reels linked to that show.

There are two ways to add them, both in **Studio admin → Instagram reels**:

1. **By link (no setup).** Paste a reel link such as `https://www.instagram.com/reel/…`. Optionally pick the show it's from, add a cover image link and a caption for the tile. These play through Instagram's own embedded player. The reel must be public.
2. **Automatic import.** Connect the studio's Instagram account and every reel is imported with its cover, caption and video file, so it plays natively in the feed (autoplay, sound toggle, swipe). Reels re-import every 6 hours with the show sync, which also renews the video links.

### Connecting Instagram

You need an Instagram **professional account** (Business or Creator).

1. Go to [developers.facebook.com](https://developers.facebook.com/apps), create an app, and add the **Instagram** product, choosing *API setup with Instagram login*.
2. Under *Generate access tokens*, add the studio's Instagram account and generate a token (permission: `instagram_business_basic`).
3. Put it in `.env.local` (and your host's environment) as `INSTAGRAM_ACCESS_TOKEN`, then restart.
4. In Studio admin, press **Import from Instagram**.

Long-lived tokens last 60 days; the app refreshes the token weekly and stores the refreshed one in the database, so you shouldn't need to touch it again. If Instagram ever rejects it, generate a new one and replace the variable.

Reels that use licensed music don't come with a video file from the API; those automatically fall back to Instagram's embedded player. Hiding an imported reel in admin keeps it off the site even after future imports.

## Studio: About and Bookings

- **About** (`/about`) presents the facility and each space: the lounge set (up to 5 people), coffee table set, news set, full set, the recording studio, meeting rooms and lounges. Names, descriptions, capacities and photos live in `lib/studio.ts`. Until photos are added, each space shows a floor-plan drawing; to use a photo, put it in `public/studio/` and set `image: "/studio/your-photo.jpg"` on that space.
- **Book a session** (`/book`) lets anyone request a space, date, start time and length. Times already held are crossed out, and the server refuses overlapping requests. The full set occupies the whole floor, so it can't overlap the lounge, coffee table or news sets.
- New requests appear in **Studio admin → Bookings**, where the team confirms, declines or cancels them and can add a note (price, call time). Signed-in guests see their bookings on their account page.
- Studio hours, maximum session length and how far ahead people can book are in `BOOKING_RULES` in `lib/studio.ts`.
- Add `NEXT_PUBLIC_STUDIO_EMAIL`, `NEXT_PUBLIC_STUDIO_PHONE` and `NEXT_PUBLIC_STUDIO_ADDRESS` to show contact details on both pages.
- **Emails (optional):** with `SMTP_HOST`, `SMTP_USER` and `SMTP_PASS` set (Hostinger works: `smtp.hostinger.com`, port 465), guests get a confirmation of their request and of the team's decision, and the team gets each new request at `BOOKINGS_EMAIL` (or the first `ADMIN_EMAILS` address).

## Features

- **Persistent player** — start an episode and keep browsing; it docks as a mini player with play/pause, next/previous and progress, then expands back onto the watch page without restarting. Lock-screen and headset controls via the Media Session API.
- **Up next & autoplay** — the queue follows the show (or the playlist you came from) and advances automatically.
- **Playlists** — create, rename, describe, reorder, remove, shuffle and delete. Saved per account, available on every device.
- **Continue watching** — progress is remembered per device and resumes from where you stopped.
- **Search** across episode titles and notes, and show names and hosts.
- **Instagram reels** — a vertical, swipe-through feed with autoplay and a sound toggle; reels can link back to their show.
- **PWA** — installable, offline page, cached app shell and thumbnails, home-screen shortcuts, safe-area aware layout.
- Privacy-enhanced embeds (`youtube-nocookie.com`).

## Project layout

```
app/
  (site)/            pages with the main shell: home, shows, watch, search, library, account, admin
  (auth)/            sign in / sign up
  api/               playlists, registration, admin (shows, sync, single episodes), cron sync, NextAuth
  manifest.ts        PWA manifest
components/
  player/            PlayerProvider (persistent YouTube player), Stage, MiniBar, PlayButton
  library/, admin/, shell/, ui/
lib/                 db, auth, data access, YouTube sync, demo catalogue
models/              User, Show, Episode, Playlist
public/sw.js         service worker
scripts/             seed + make-admin, image generator for icons and sample art
```

## Design notes

"Studio after dark": deep malachite surfaces, brass fittings, ivory type. Headlines are set in Bodoni Moda with optical sizing; interface text in Hanken Grotesk. The one decorative signature is the woven-strip motif, taken from aso-oke strip cloth — it appears under the home hero and on empty and auth screens. Each show gets its own accent colour, used for its marker in the navigation and its page tint.

To change the palette, edit the `@theme` block at the top of `app/globals.css`. App icons are generated by `scripts/assets/make_images.py`.

## Deploying

Works on Vercel out of the box: import the repo, add the environment variables, deploy. In MongoDB Atlas, allow connections from your host (Network Access → `0.0.0.0/0` for Vercel). Remember to set `NEXTAUTH_URL` to the production domain and add it to the Google OAuth client if you use Google sign-in.

The `public/demo/` images and `lib/demo.ts` only power the sample catalogue and can be deleted once real shows are live.
