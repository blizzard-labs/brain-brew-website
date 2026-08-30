const YOUTUBE_CHANNEL = "https://www.youtube.com/@brainbrewsf";
const YOUTUBE_POSTS = `${YOUTUBE_CHANNEL}/posts`;
const YOUTUBE_VIDEOS = "https://www.youtube.com/feeds/videos.xml?channel_id=UCDVo4AWAp_l4tfKmx-31mnQ";
const INSTAGRAM_PROFILE = "https://www.instagram.com/brainbrewsf/embed";
const STRAVA_CLUB_ID = "2321462";
const STRAVA_CLUB = "https://www.strava.com/clubs/brainbrewsf";
const STRAVA_EVENTS = `https://www.strava.com/api/v3/clubs/${STRAVA_CLUB_ID}/group_events`;
const STRAVA_COVER = "https://dgalywyr863hv.cloudfront.net/pictures/clubs/2321462/57781553/1/large.jpg";

type Platform = "instagram" | "youtube" | "strava";

type FeedItem = {
  id: string;
  platform: Platform;
  kind: "post" | "video" | "event";
  title: string;
  published: string;
  publishedAt: string | null;
  thumbnail: string | null;
  url: string;
};

type JsonRecord = Record<string, unknown>;

let stravaTokenCache: { token: string; expiresAt: number } | null = null;

function decodeXml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#(?:39|x27);/g, "'");
}

function xmlValue(entry: string, tag: string) {
  const match = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? decodeXml(match[1].trim()) : "";
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : null;
}

function stringValue(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function cleanText(value: unknown) {
  return stringValue(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function photoUrl(value: unknown) {
  const photo = asRecord(value);
  const urls = asRecord(photo?.urls);
  if (!urls) return null;

  const candidates = Object.entries(urls)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].startsWith("https://"))
    .sort(([a], [b]) => (Number(b) || 0) - (Number(a) || 0));
  return candidates[0]?.[1] ?? null;
}

function parseVideos(xml: string): FeedItem[] {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => {
    const entry = match[1];
    const id = xmlValue(entry, "yt:videoId");
    const publishedAt = xmlValue(entry, "published");
    return {
      id,
      platform: "youtube" as const,
      kind: "video" as const,
      title: xmlValue(entry, "title") || "New video from The Brain Brew Ride",
      published: dateLabel(publishedAt),
      publishedAt,
      thumbnail: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null,
      url: id ? `https://www.youtube.com/watch?v=${id}` : YOUTUBE_CHANNEL,
    };
  }).filter((item) => item.id);
}

function textFrom(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const textValue = value as { simpleText?: string; runs?: Array<{ text?: string }> };
  return textValue.simpleText ?? textValue.runs?.map((run) => run.text ?? "").join("") ?? "";
}

function relativeDate(label: string) {
  const match = label.match(/(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const units: Record<string, number> = { minute: 60_000, hour: 3_600_000, day: 86_400_000, week: 604_800_000, month: 2_592_000_000, year: 31_536_000_000 };
  return new Date(Date.now() - amount * units[match[2].toLowerCase()]).toISOString();
}

function parseYouTubePosts(html: string): FeedItem[] {
  const marker = "var ytInitialData = ";
  const start = html.indexOf(marker);
  const jsonStart = start + marker.length;
  const jsonEnd = html.indexOf(";</script>", jsonStart);
  if (start < 0 || jsonEnd < 0) return [];

  let data: unknown;
  try { data = JSON.parse(html.slice(jsonStart, jsonEnd)); } catch { return []; }

  const posts: FeedItem[] = [];
  const seen = new Set<string>();

  function visit(value: unknown) {
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    const renderer = record.backstagePostRenderer as Record<string, unknown> | undefined;
    if (renderer) {
      const id = typeof renderer.postId === "string" ? renderer.postId : "";
      if (id && !seen.has(id)) {
        seen.add(id);
        const attachment = renderer.backstageAttachment as Record<string, unknown> | undefined;
        const imageRenderer = attachment?.backstageImageRenderer as Record<string, unknown> | undefined;
        const image = imageRenderer?.image as { thumbnails?: Array<{ url?: string }> } | undefined;
        const published = textFrom(renderer.publishedTimeText);
        posts.push({
          id,
          platform: "youtube",
          kind: "post",
          title: textFrom(renderer.contentText) || "New community update from The Brain Brew Ride",
          published,
          publishedAt: relativeDate(published),
          thumbnail: image?.thumbnails?.at(-1)?.url ?? null,
          url: `https://www.youtube.com/post/${id}`,
        });
      }
    }
    for (const child of Object.values(record)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child === "object") visit(child);
    }
  }

  visit(data);
  return posts;
}

function parseInstagram(html: string): FeedItem[] {
  const match = html.match(/"contextJSON":"((?:\\.|[^"\\])*)"/);
  if (!match) return [];

  let media: Array<Record<string, unknown>> = [];
  try {
    const contextJson = JSON.parse(`"${match[1]}"`);
    const payload = JSON.parse(contextJson) as { context?: { graphql_media?: Array<Record<string, unknown>> } };
    media = payload.context?.graphql_media ?? [];
  } catch { return []; }

  return media.map((item) => {
    const id = String(item.shortcode ?? item.code ?? item.id ?? "");
    const edges = (item.edge_media_to_caption as { edges?: Array<{ node?: { text?: string } }> } | undefined)?.edges;
    const title = edges?.[0]?.node?.text ?? String(item.caption ?? item.accessibility_caption ?? "New Instagram update from The Brain Brew Ride");
    const timestamp = Number(item.taken_at_timestamp ?? 0);
    const publishedAt = timestamp ? new Date(timestamp * 1000).toISOString() : null;
    const isVideo = Boolean(item.is_video);
    return {
      id,
      platform: "instagram" as const,
      kind: isVideo ? "video" as const : "post" as const,
      title,
      published: publishedAt ? dateLabel(publishedAt) : "Instagram update",
      publishedAt,
      thumbnail: String(item.display_url ?? item.thumbnail_src ?? item.thumbnail_url ?? "") || null,
      url: id ? `https://www.instagram.com/${isVideo ? "reel" : "p"}/${id}/` : "https://www.instagram.com/brainbrewsf",
    };
  }).filter((item) => item.id);
}

export function parseStravaPosts(html: string): FeedItem[] {
  const nextData = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (!nextData) return [];

  let entries: unknown[] = [];
  try {
    const data = asRecord(JSON.parse(nextData));
    const props = asRecord(data?.props);
    const pageProps = asRecord(props?.pageProps);
    if (Array.isArray(pageProps?.preFetchedEntries)) entries = pageProps.preFetchedEntries;
  } catch {
    return [];
  }

  return entries.flatMap((value): FeedItem[] => {
    const entry = asRecord(value);
    const post = asRecord(entry?.post);
    const id = stringValue(post?.entity_id ?? post?.id);
    if (!entry || !post || !id) return [];

    const cursorData = asRecord(entry.cursorData);
    const cursorTimestamp = Number(cursorData?.updated_at ?? 0);
    const publishedAt = stringValue(post.date ?? post.updated_at)
      || (cursorTimestamp ? new Date(cursorTimestamp * 1000).toISOString() : "");
    const title = cleanText(post.summary) || cleanText(entry.body) || cleanText(post.post)
      || "New post from The Brain Brew Ride";

    return [{
      id,
      platform: "strava",
      kind: "post",
      title,
      published: publishedAt ? `Club post · ${dateLabel(publishedAt)}` : "New Strava club post",
      publishedAt: publishedAt || null,
      thumbnail: photoUrl(post.primary_photo),
      url: `${STRAVA_CLUB}/posts/${id}`,
    }];
  });
}

function eventDateLabel(value: string, timeZone: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone,
      timeZoneName: "short",
    }).format(date);
  } catch {
    return dateLabel(value);
  }
}

export function parseStravaEvents(value: unknown): FeedItem[] {
  if (!Array.isArray(value)) return [];
  const now = Date.now();

  return value.flatMap((item): FeedItem[] => {
    const event = asRecord(item);
    if (!event || event.private === true) return [];

    const id = stringValue(event.id);
    const occurrences = Array.isArray(event.upcoming_occurrences)
      ? event.upcoming_occurrences.filter((date): date is string => typeof date === "string" && (Date.parse(date) || 0) >= now)
      : [];
    const publishedAt = occurrences.sort((a, b) => Date.parse(a) - Date.parse(b))[0];
    if (!id || !publishedAt) return [];

    const zone = stringValue(event.zone) || "America/Los_Angeles";
    const address = cleanText(event.address);
    const eventType = cleanText(event.activity_type);
    const details = [eventType, eventDateLabel(publishedAt, zone), address].filter(Boolean).join(" · ");

    return [{
      id: `event-${id}`,
      platform: "strava",
      kind: "event",
      title: cleanText(event.title) || "Upcoming Brain Brew club event",
      published: `Club event · ${details}`,
      publishedAt,
      thumbnail: STRAVA_COVER,
      url: `https://www.strava.com/clubs/${STRAVA_CLUB_ID}/group_events/${id}`,
    }];
  });
}

export function parseStravaEventsJson(json: string): FeedItem[] {
  try {
    const withSafeIds = json.replace(/("(?:id|club_id|route_id)"\s*:\s*)(\d{16,})/g, '$1"$2"');
    return parseStravaEvents(JSON.parse(withSafeIds));
  } catch {
    return [];
  }
}

async function getStravaAccessToken() {
  if (stravaTokenCache && stravaTokenCache.expiresAt > Date.now() + 300_000) return stravaTokenCache.token;

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  if (clientId && clientSecret && refreshToken) {
    try {
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const payload = await response.json() as { access_token?: string; expires_at?: number };
        if (payload.access_token) {
          stravaTokenCache = { token: payload.access_token, expiresAt: (payload.expires_at ?? Math.floor(Date.now() / 1000) + 3600) * 1000 };
          return payload.access_token;
        }
      }
    } catch {
      // A static token below can still keep events available during a refresh outage.
    }
  }

  return process.env.STRAVA_ACCESS_TOKEN ?? null;
}

async function requestStravaEvents() {
  const token = await getStravaAccessToken();
  if (!token) return null;
  return fetch(STRAVA_EVENTS, {
    headers: { accept: "application/json", authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000),
  });
}

export async function GET() {
  const request = (url: string, accept: string) => fetch(url, { headers: { accept, "user-agent": "Mozilla/5.0 (compatible; BrainBrewRide/1.0)" }, signal: AbortSignal.timeout(8000) });

  try {
    const [videosResult, postsResult, instagramResult, stravaPostsResult, stravaEventsResult] = await Promise.allSettled([
      request(YOUTUBE_VIDEOS, "application/atom+xml"),
      request(YOUTUBE_POSTS, "text/html"),
      request(INSTAGRAM_PROFILE, "text/html"),
      request(STRAVA_CLUB, "text/html"),
      requestStravaEvents(),
    ]);

    const videosResponse = videosResult.status === "fulfilled" ? videosResult.value : null;
    const postsResponse = postsResult.status === "fulfilled" ? postsResult.value : null;
    const instagramResponse = instagramResult.status === "fulfilled" ? instagramResult.value : null;
    const stravaPostsResponse = stravaPostsResult.status === "fulfilled" ? stravaPostsResult.value : null;
    const stravaEventsResponse = stravaEventsResult.status === "fulfilled" ? stravaEventsResult.value : null;
    const videos = videosResponse?.ok ? parseVideos(await videosResponse.text()) : [];
    const posts = postsResponse?.ok ? parseYouTubePosts(await postsResponse.text()) : [];
    const instagram = instagramResponse?.ok ? parseInstagram(await instagramResponse.text()) : [];
    const stravaPosts = stravaPostsResponse?.ok ? parseStravaPosts(await stravaPostsResponse.text()) : [];
    const stravaEvents = stravaEventsResponse?.ok ? parseStravaEventsJson(await stravaEventsResponse.text()) : [];
    const items = [...posts, ...videos, ...instagram, ...stravaPosts, ...stravaEvents]
      .sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0));

    return Response.json({ items }, { headers: { "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=900" } });
  } catch {
    return Response.json({ items: [] }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } });
  }
}
