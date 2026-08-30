const YOUTUBE_CHANNEL = "https://www.youtube.com/@brainbrewsf";
const YOUTUBE_POSTS = `${YOUTUBE_CHANNEL}/posts`;
const YOUTUBE_VIDEOS = "https://www.youtube.com/feeds/videos.xml?channel_id=UCDVo4AWAp_l4tfKmx-31mnQ";
const INSTAGRAM_PROFILE = "https://www.instagram.com/brainbrewsf/embed";

type Platform = "instagram" | "youtube";

type FeedItem = {
  id: string;
  platform: Platform;
  kind: "post" | "video";
  title: string;
  published: string;
  publishedAt: string | null;
  thumbnail: string | null;
  url: string;
};

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

export async function GET() {
  const request = (url: string, accept: string) => fetch(url, { headers: { accept, "user-agent": "Mozilla/5.0 (compatible; BrainBrewRide/1.0)" }, signal: AbortSignal.timeout(8000) });

  try {
    const [videosResult, postsResult, instagramResult] = await Promise.allSettled([
      request(YOUTUBE_VIDEOS, "application/atom+xml"),
      request(YOUTUBE_POSTS, "text/html"),
      request(INSTAGRAM_PROFILE, "text/html"),
    ]);

    const videosResponse = videosResult.status === "fulfilled" ? videosResult.value : null;
    const postsResponse = postsResult.status === "fulfilled" ? postsResult.value : null;
    const instagramResponse = instagramResult.status === "fulfilled" ? instagramResult.value : null;
    const videos = videosResponse?.ok ? parseVideos(await videosResponse.text()) : [];
    const posts = postsResponse?.ok ? parseYouTubePosts(await postsResponse.text()) : [];
    const instagram = instagramResponse?.ok ? parseInstagram(await instagramResponse.text()) : [];
    const items = [...posts, ...videos, ...instagram].sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0));

    return Response.json({ items }, { headers: { "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=900" } });
  } catch {
    return Response.json({ items: [] }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } });
  }
}
