export type InstagramItem = {
  id: string;
  platform: "instagram";
  kind: "post" | "video";
  title: string;
  published: string;
  publishedAt: string | null;
  thumbnail: string | null;
  url: string;
};

type Media = {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp?: string;
};
type Config = { token: string; userId: string; version: string };

// Fetch each cursor from the same trusted endpoint; never follow a token-bearing URL.
export async function fetchAllInstagramMedia(config: Config, request: typeof fetch = fetch): Promise<InstagramItem[]> {
  if (!/^\d+$/.test(config.userId) || !/^v\d+\.\d+$/.test(config.version)) throw new Error("Invalid Instagram configuration");
  const items = new Map<string, InstagramItem>();
  const seen = new Set<string>();
  let after: string | undefined;
  const signal = AbortSignal.timeout(25_000);
  do {
    const url = new URL(`https://graph.instagram.com/${config.version}/${config.userId}/media`);
    url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
    url.searchParams.set("limit", "100");
    if (after) url.searchParams.set("after", after);
    const response = await request(url, {
      headers: { authorization: `Bearer ${config.token}` }, cache: "no-store", signal,
    });
    if (!response.ok) throw new Error("Instagram request failed");
    const page = await response.json() as { data?: Media[]; error?: unknown; paging?: { next?: string; cursors?: { after?: string } } };
    if (page.error || !Array.isArray(page.data)) throw new Error("Invalid Instagram response");
    for (const media of page.data) {
      if (!media.id || !media.permalink) throw new Error("Incomplete Instagram media");
      const date = media.timestamp ? new Date(media.timestamp) : null;
      const publishedAt = date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
      items.set(media.id, {
        id: media.id, platform: "instagram", kind: media.media_type === "VIDEO" ? "video" : "post",
        title: media.caption || "New Instagram update from The Brain Brew Ride",
        published: publishedAt ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(publishedAt)) : "Instagram update",
        publishedAt,
        thumbnail: media.media_type === "VIDEO" ? media.thumbnail_url ?? null : media.media_url ?? null,
        url: media.permalink,
      });
    }
    if (!page.paging?.next) break;
    after = page.paging.cursors?.after;
    if (!after || seen.has(after)) throw new Error("Instagram pagination did not finish");
    seen.add(after);
  } while (true);
  return [...items.values()];
}

// Only complete snapshots enter the cache. A failed page cannot erase older posts.
let cache: { key: string; items: InstagramItem[]; updatedAt: number } | undefined;
let pending: { key: string; result: Promise<InstagramItem[]> } | undefined;
export async function getInstagramFeed() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  const version = process.env.INSTAGRAM_API_VERSION;
  if (!token || !userId || !version) return { items: [], status: "not_connected" as const };
  const key = `${userId}:${version}`;
  if (cache?.key === key && Date.now() - cache.updatedAt < 300_000) return { items: cache.items, status: "complete" as const };
  try {
    if (!pending || pending.key !== key) pending = { key, result: fetchAllInstagramMedia({ token, userId, version }) };
    const current = pending;
    const items = await current.result.finally(() => { if (pending === current) pending = undefined; });
    cache = { key, items, updatedAt: Date.now() };
    return { items, status: "complete" as const };
  } catch {
    return { items: cache?.key === key ? cache.items : [], status: cache?.key === key ? "stale" as const : "unavailable" as const };
  }
}
