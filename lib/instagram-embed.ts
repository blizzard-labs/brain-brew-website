import type { InstagramItem } from "./instagram-feed.ts";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function parseInstagram(html: string): InstagramItem[] {
  const match = html.match(/"contextJSON":"((?:\\.|[^"\\])*)"/);
  if (!match) return [];

  let media: Array<Record<string, unknown>> = [];
  try {
    const contextJson = JSON.parse(`"${match[1]}"`);
    const payload = JSON.parse(contextJson) as { context?: { graphql_media?: Array<Record<string, unknown>> } };
    media = payload.context?.graphql_media ?? [];
  } catch { return []; }

  return media.map((entry) => {
    // Instagram's embed payload currently wraps each post in
    // `shortcode_media`. Older responses exposed the post fields directly,
    // so accept both shapes to keep the public feed resilient to rollouts.
    const item = asRecord(entry.shortcode_media) ?? entry;
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
