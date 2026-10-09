export const DONATION_GOAL = 3000;
const SOURCES = {
  alzheimers: "https://act.alz.org/goto/brainbrew",
  michaelJFox: "https://give.michaeljfox.org/BrainBrew",
};

function validAmount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new Error("Invalid fundraising total");
  return Math.round(value * 100) / 100;
}

export function parseAlzheimersTotal(html: string): number {
  const value = html.match(/<span\b[^>]*class=["']amount-raised-value["'][^>]*>\s*\$([\d,]+(?:\.\d{1,2})?)\s*<\/span>/i)?.[1];
  if (value === undefined) throw new Error("Fundraising total missing");
  return validAmount(Number(value.replaceAll(",", "")));
}

// Read the page's embedded public data as JSON, never as executable JavaScript.
export function parseMichaelJFoxTotal(html: string): number {
  const marker = /\bvar SC\s*=\s*/.exec(html);
  if (!marker) throw new Error("Fundraising data missing");
  const start = marker.index + marker[0].length;
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i < html.length; i++) {
    const char = html[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) {
      const data = JSON.parse(html.slice(start, i + 1).replace(/\\x([\da-f]{2})/gi, "\\u00$1"));
      if (Number(data.team?.id) !== 846507 || data.team?.currency_code !== "USD") throw new Error("Unexpected fundraising team");
      return validAmount(data.team.total_raised);
    }
  }
  throw new Error("Incomplete fundraising data");
}

type Snapshot = { total: number; alzheimers: number; michaelJFox: number; updatedAt: string };
let snapshot: Snapshot | undefined;
let pending: Promise<Snapshot> | undefined;
const REFRESH_MS = 5 * 60 * 1000;

async function readTotals(): Promise<Snapshot> {
  const read = async (url: string) => {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(12000), headers: { accept: "text/html" } });
    if (!response.ok) throw new Error("Fundraiser unavailable");
    return response.text();
  };
  const [alzHtml, foxHtml] = await Promise.all([read(SOURCES.alzheimers), read(SOURCES.michaelJFox)]);
  const alzheimers = parseAlzheimersTotal(alzHtml);
  const michaelJFox = parseMichaelJFoxTotal(foxHtml);
  return { total: Math.round((alzheimers + michaelJFox) * 100) / 100, alzheimers, michaelJFox, updatedAt: new Date().toISOString() };
}

export async function getDonationProgress() {
  if (snapshot && Date.now() - Date.parse(snapshot.updatedAt) < REFRESH_MS) return { ...snapshot, goal: DONATION_GOAL, status: "current" };
  try {
    if (!pending) pending = readTotals().finally(() => { pending = undefined; });
    snapshot = await pending;
    return { ...snapshot, goal: DONATION_GOAL, status: "current" };
  } catch {
    return snapshot
      ? { ...snapshot, goal: DONATION_GOAL, status: "stale" }
      : { total: null, goal: DONATION_GOAL, status: "unavailable", updatedAt: null };
  }
}
