import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { ads } from "@/db/schema";

function authenticate(request: NextRequest): boolean {
  const apiKey = process.env.PACKETADS_API_KEY;
  if (!apiKey) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7) === apiKey;
  }
  const xKey = request.headers.get("x-api-key");
  return xKey === apiKey;
}

/**
 * PATCH /api/packetads/[id]/posted
 *
 * Updates the `lastPostedAt` timestamp of an ad to the current time.
 * Call this after the bot successfully posts the message to Discord.
 *
 * Authentication: Bearer <PACKETADS_API_KEY> or X-Api-Key header.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!authenticate(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const adId = Number(id);

  if (!Number.isInteger(adId) || adId <= 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const [updated] = await db
    .update(ads)
    .set({ lastPostedAt: new Date(), updatedAt: new Date() })
    .where(eq(ads.id, adId))
    .returning({ id: ads.id });

  if (!updated) {
    return Response.json({ error: "Ad not found" }, { status: 404 });
  }

  return Response.json({ ok: true, id: updated.id });
}
