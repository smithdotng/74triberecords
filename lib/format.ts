export function formatDuration(totalSeconds: number) {
  if (!totalSeconds) return "";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatLongDuration(totalSeconds: number) {
  if (!totalSeconds) return "";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  if (h) return m ? `${h} hr ${m} min` : `${h} hr`;
  return `${m} min`;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/** Accepts a full YouTube playlist URL or a bare ID and returns the ID */
export function parsePlaylistId(input: string) {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    return url.searchParams.get("list") ?? trimmed;
  } catch {
    return trimmed;
  }
}

/** Accepts a YouTube watch/share URL or a bare ID and returns the video ID */
export function parseVideoId(input: string) {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
    return url.searchParams.get("v") ?? trimmed;
  } catch {
    return trimmed;
  }
}

export function ytThumb(videoId: string, quality: "maxresdefault" | "hqdefault" | "mqdefault" = "hqdefault") {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}
