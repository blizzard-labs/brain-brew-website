import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_MATCH_AMOUNT = 1000;
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export const MATCH_CHARITIES = ["alzheimers", "michaelJFox"] as const;
export type MatchCharity = (typeof MATCH_CHARITIES)[number];
type MatchedGift = { amount: number; charity?: MatchCharity; createdAt: string };

export function parseMatchCharity(value: unknown): MatchCharity {
  if (!MATCH_CHARITIES.includes(value as MatchCharity)) throw new Error("Enter which charity your employer matched");
  return value as MatchCharity;
}

// Anyone can submit, so each entry is capped and kept with a timestamp; remove a
// bad entry by editing the JSON file and restarting the app.
export function parseMatchAmount(value: unknown): number {
  const amount = typeof value === "string" ? Number(value.replace(/[$,\s]/g, "")) : value;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 1 || amount > MAX_MATCH_AMOUNT) {
    throw new Error(`Enter an amount between $1 and $${MAX_MATCH_AMOUNT.toLocaleString("en-US")}`);
  }
  return Math.round(amount * 100) / 100;
}

export type MatchedTotals = Record<MatchCharity, number>;

export function sumMatchedGifts(gifts: MatchedGift[]): MatchedTotals {
  const totals: MatchedTotals = { alzheimers: 0, michaelJFox: 0 };
  for (const gift of gifts) if (MATCH_CHARITIES.includes(gift.charity as MatchCharity)) totals[gift.charity as MatchCharity] += gift.amount;
  for (const charity of MATCH_CHARITIES) totals[charity] = Math.round(totals[charity] * 100) / 100;
  return totals;
}

export function createMatchedGiftStore(file: string) {
  let gifts: MatchedGift[] | undefined;
  let queue: Promise<unknown> = Promise.resolve();
  const recent = new Map<string, number[]>();

  const load = async () => {
    if (gifts) return gifts;
    try {
      const data = JSON.parse(await readFile(file, "utf8"));
      gifts = Array.isArray(data) ? data.filter(gift => typeof gift?.amount === "number" && Number.isFinite(gift.amount)) : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      gifts = [];
    }
    return gifts;
  };

  const save = async (next: MatchedGift[]) => {
    await mkdir(path.dirname(file), { recursive: true });
    const temp = `${file}.${process.pid}.tmp`;
    await writeFile(temp, JSON.stringify(next, null, 2));
    await rename(temp, file);
  };

  return {
    async totals() {
      return sumMatchedGifts(await load());
    },
    async add(amount: number, charity: MatchCharity, client: string, now = Date.now()) {
      const times = (recent.get(client) ?? []).filter(time => now - time < RATE_WINDOW_MS);
      if (times.length >= RATE_LIMIT) throw new RangeError("Too many submissions. Please try again later.");
      recent.set(client, [...times, now]);
      const run = queue.then(async () => {
        const next = [...await load(), { amount, charity, createdAt: new Date(now).toISOString() }];
        await save(next);
        gifts = next;
        return sumMatchedGifts(next);
      });
      queue = run.catch(() => undefined);
      return run;
    },
  };
}

export const matchedGifts = createMatchedGiftStore(
  process.env.MATCHED_GIFTS_FILE ?? path.join(process.cwd(), "data", "matched-gifts.json"),
);
