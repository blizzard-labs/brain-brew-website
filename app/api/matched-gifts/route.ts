import { matchedGifts, parseMatchAmount, parseMatchCharity, type MatchCharity } from "@/lib/matched-gifts";

export async function POST(request: Request) {
  let amount: number;
  let charity: MatchCharity;
  try {
    const body = await request.json();
    if (body?.website) return Response.json({ ok: true });
    amount = parseMatchAmount(body?.amount);
    charity = parseMatchCharity(body?.charity);
  } catch (error) {
    return Response.json({ error: error instanceof Error && error.message.startsWith("Enter") ? error.message : "Invalid request" }, { status: 400 });
  }
  const client = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  try {
    await matchedGifts.add(amount, charity, client);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof RangeError) return Response.json({ error: error.message }, { status: 429 });
    return Response.json({ error: "Could not save your match. Please try again." }, { status: 500 });
  }
}
