import { getDonationProgress } from "@/lib/donation-progress";

export async function GET() {
  return Response.json(await getDonationProgress(), { headers: { "Cache-Control": "no-store" } });
}
