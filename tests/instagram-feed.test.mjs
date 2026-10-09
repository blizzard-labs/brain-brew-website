import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchAllInstagramMedia } from '../lib/instagram-feed.ts';
const config = { token: 'test-secret', userId: '123', version: 'v22.0' };
const media = id => ({ id, media_type: 'IMAGE', media_url: `https://example.com/${id}.jpg`, permalink: `https://www.instagram.com/p/${id}/`, timestamp: '2026-10-08T12:00:00Z' });

test('includes older pages and reels, deduplicates IDs, keeps credentials on trusted host', async () => {
  const calls = [];
  const request = async (url, options) => {
    calls.push(url);
    assert.equal(url.origin, 'https://graph.instagram.com');
    assert.equal(options.headers.authorization, 'Bearer test-secret');
    assert.equal(url.searchParams.has('access_token'), false);
    if (calls.length === 1) return Response.json({ data: [media('1'), media('2')], paging: { next: 'https://untrusted.example/?access_token=bad', cursors: { after: 'older' } } });
    assert.equal(url.searchParams.get('after'), 'older');
    return Response.json({ data: [media('2'), { ...media('3'), media_type: 'VIDEO', thumbnail_url: 'https://example.com/reel.jpg' }] });
  };
  const items = await fetchAllInstagramMedia(config, request);
  assert.deepEqual(items.map(item => item.id), ['1', '2', '3']);
  assert.equal(items[2].kind, 'video');
  assert.equal(items[2].thumbnail, 'https://example.com/reel.jpg');
});

test('rejects a partial refresh if a later page fails', async () => {
  let count = 0;
  await assert.rejects(fetchAllInstagramMedia(config, async () => ++count === 1
    ? Response.json({ data: [media('1')], paging: { next: 'next', cursors: { after: 'older' } } })
    : new Response('', { status: 429 })), /request failed/);
});

test('rejects repeating pagination instead of reporting completeness', async () => {
  await assert.rejects(fetchAllInstagramMedia(config, async () => Response.json({ data: [media('1')], paging: { next: 'next', cursors: { after: 'same' } } })), /pagination/);
});

test('empty account is a successful complete result', async () => {
  assert.deepEqual(await fetchAllInstagramMedia(config, async () => Response.json({ data: [] })), []);
});
