const CHANNEL_URL = "https://www.youtube.com/@brainbrewsf";
const POSTS_URL = `${CHANNEL_URL}/posts`;
const VIDEOS_FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=UCDVo4AWAp_l4tfKmx-31mnQ";

type FeedItem = {
  id: string;
  type: "video" | "post";
  title: string;
  published: string;
  thumbnail: string | null;
  url: string;
};

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function xmlValue(entry: string, tag: string) {
  const match = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? decodeXml(match[1].trim()) : "";
}

function parseVideos(xml: string): FeedItem[] {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => {
    const entry = match[1];
    const id = xmlValue(entry, "yt:videoId");
    return {
      id,
      type: "video" as const,
      title: xmlValue(entry, "title") || "New video from The Brain Brew Ride",
      published: xmlValue(entry, "published"),
      thumbnail: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null,
      url: id ? `https://www.youtube.com/watch?v=${id}` : CHANNEL_URL,
    };
  }).filter((item) => item.id);
}

function textFrom(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const textValue = value as { simpleText?: string; runs?: Array<{ text?: string }> };
  if (textValue.simpleText) return textValue.simpleText;
  return textValue.runs?.map((run) => run.text ?? "").join("") ?? "";
}

function parsePosts(html: string): FeedItem[] {
  const marker = "var ytInitialData = ";
  const start = html.indexOf(marker);
  if (start < 0) return [];
  const jsonStart = start + marker.length;
  const jsonEnd = html.indexOf(";</script>", jsonStart);
  if (jsonEnd < 0) return [];

  let data: unknown;
  try {
    data = JSON.parse(html.slice(jsonStart, jsonEnd));
  } catch {
    return [];
  }

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
        const thumbnails = image?.thumbnails ?? [];
        const title = textFrom(renderer.contentText) || "New community update from The Brain Brew Ride";
        posts.push({
          id,
          type: "post",
          title,
          published: textFrom(renderer.publishedTimeText),
          thumbnail: thumbnails.at(-1)?.url ?? null,
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

export async function GET() {
  try {
    const [videosResult, postsResult] = await Promise.allSettled([
      fetch(VIDEOS_FEED_URL, { headers: { accept: "application/atom+xml" }, signal: AbortSignal.timeout(8000) }),
      fetch(POSTS_URL, { headers: { "user-agent": "Mozilla/5.0 (compatible; BrainBrewRide/1.0)" }, signal: AbortSignal.timeout(8000) }),
    ]);

    const videosResponse = videosResult.status === "fulfilled" ? videosResult.value : null;
    const postsResponse = postsResult.status === "fulfilled" ? postsResult.value : null;
    const videos = videosResponse?.ok ? parseVideos(await videosResponse.text()) : [];
    const posts = postsResponse?.ok ? parsePosts(await postsResponse.text()) : [];
    const items = [...posts, ...videos];

    return Response.json({ items }, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=900" },
    });
  } catch {
    return Response.json({ items: [] }, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    });
  }
}
