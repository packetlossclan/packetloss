import { and, eq, isNull, lte, or, gt } from "drizzle-orm";
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
 * GET /api/bot/advertisement
 *
 * Returns all active ads within their validity window.
 * Alias of GET /api/packetads used by the Discord bot.
 *
 * Authentication: Bearer <PACKETADS_API_KEY> or X-Api-Key header.
 */
export async function GET(request: NextRequest): Promise<Response> {
  if (!authenticate(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const activeAds = await db
    .select()
    .from(ads)
    .where(
      and(
        eq(ads.enabled, true),
        or(isNull(ads.startsAt), lte(ads.startsAt, now)),
        or(isNull(ads.expiresAt), gt(ads.expiresAt, now)),
      ),
    );

  return Response.json(
    activeAds.map((ad) => ({
      id: ad.id,
      title: ad.title,
      message: ad.message,
      scheduleType: ad.scheduleType,
      scheduleInterval: ad.scheduleInterval,
      scheduleTime: ad.scheduleTime,
      scheduleDates: (() => {
        try {
          return ad.scheduleDates ? JSON.parse(ad.scheduleDates) : null;
        } catch {
          return null;
        }
      })(),
      channelId: ad.channelId ?? null,
      lastPostedAt: ad.lastPostedAt ? ad.lastPostedAt.toISOString() : null,
      startsAt: ad.startsAt ? ad.startsAt.toISOString() : null,
      expiresAt: ad.expiresAt ? ad.expiresAt.toISOString() : null,
    })),
  );
}
