import assert from "node:assert/strict";
import test from "node:test";

import { parseInstagram } from "../app/api/social-feed/route.ts";

function instagramEmbed(media: unknown[]) {
  const contextJson = JSON.stringify({ context: { graphql_media: media } });
  return `<script type="application/json">${JSON.stringify({ contextJSON: contextJson })}</script>`;
}

test("parses Instagram posts wrapped in shortcode_media", () => {
  const items = parseInstagram(instagramEmbed([{
    shortcode_media: {
      id: "3988680479582125473",
      shortcode: "Ddao8NkBv2h",
      is_video: true,
      display_url: "https://scontent.example/new-post.jpg",
      taken_at_timestamp: 1_789_707_827,
      edge_media_to_caption: { edges: [{ node: { text: "The newest Brain Brew update" } }] },
    },
  }]));

  assert.equal(items.length, 1);
  const { published, ...item } = items[0];
  assert.ok(published);
  assert.deepEqual(item, {
    id: "Ddao8NkBv2h",
    platform: "instagram",
    kind: "video",
    title: "The newest Brain Brew update",
    publishedAt: "2026-09-18T05:03:47.000Z",
    thumbnail: "https://scontent.example/new-post.jpg",
    url: "https://www.instagram.com/reel/Ddao8NkBv2h/",
  });
});

test("continues to parse the older direct Instagram media shape", () => {
  const items = parseInstagram(instagramEmbed([{
    shortcode: "legacy-post",
    is_video: false,
    thumbnail_url: "https://scontent.example/legacy-post.jpg",
    caption: "An earlier Brain Brew update",
  }]));

  assert.equal(items.length, 1);
  assert.equal(items[0].id, "legacy-post");
  assert.equal(items[0].kind, "post");
  assert.equal(items[0].title, "An earlier Brain Brew update");
});
