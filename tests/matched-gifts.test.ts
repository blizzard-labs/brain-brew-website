import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createMatchedGiftStore, parseMatchAmount, parseMatchCharity } from "../lib/matched-gifts.ts";

test("accepts matched amounts between $1 and $1,000", () => {
  assert.equal(parseMatchAmount("250"), 250);
  assert.equal(parseMatchAmount("$1,000.00"), 1000);
  assert.equal(parseMatchAmount(12.345), 12.35);
  for (const value of ["0", "-5", "1000.01", "abc", "", null, Infinity]) assert.throws(() => parseMatchAmount(value));
});

test("accepts only the two fundraiser charities", () => {
  assert.equal(parseMatchCharity("alzheimers"), "alzheimers");
  assert.equal(parseMatchCharity("michaelJFox"), "michaelJFox");
  for (const value of ["", "other", undefined, 1]) assert.throws(() => parseMatchCharity(value));
});

test("persists matches and totals them across store instances", async () => {
  const file = path.join(await mkdtemp(path.join(tmpdir(), "matched-gifts-")), "nested", "matches.json");
  const store = createMatchedGiftStore(file);
  assert.deepEqual(await store.totals(), { alzheimers: 0, michaelJFox: 0 });
  await Promise.all([store.add(100, "alzheimers", "a"), store.add(50.5, "michaelJFox", "b")]);
  assert.deepEqual(await store.totals(), { alzheimers: 100, michaelJFox: 50.5 });
  assert.deepEqual(JSON.parse(await readFile(file, "utf8")).map((gift: { charity: string }) => gift.charity), ["alzheimers", "michaelJFox"]);
  assert.deepEqual(await createMatchedGiftStore(file).totals(), { alzheimers: 100, michaelJFox: 50.5 });
});

test("limits each visitor to three matches per hour", async () => {
  const file = path.join(await mkdtemp(path.join(tmpdir(), "matched-gifts-")), "matches.json");
  const store = createMatchedGiftStore(file);
  const start = Date.now();
  for (let i = 0; i < 3; i++) await store.add(10, "alzheimers", "visitor", start);
  await assert.rejects(store.add(10, "alzheimers", "visitor", start + 1000), RangeError);
  await store.add(10, "michaelJFox", "other", start);
  await store.add(10, "alzheimers", "visitor", start + 60 * 60 * 1000);
  assert.deepEqual(await store.totals(), { alzheimers: 40, michaelJFox: 10 });
});

test("ignores malformed entries in the stored file", async () => {
  const file = path.join(await mkdtemp(path.join(tmpdir(), "matched-gifts-")), "matches.json");
  await writeFile(file, JSON.stringify([{ amount: 20, charity: "alzheimers" }, { amount: "oops", charity: "alzheimers" }, { amount: 5, charity: "other" }, { amount: 5, charity: "toString" }, { amount: 5 }, null]));
  assert.deepEqual(await createMatchedGiftStore(file).totals(), { alzheimers: 20, michaelJFox: 0 });
});
