import { and, eq, gt, isNotNull, isNull, lte, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { inscriptions } from "@/db/schema";

function authenticate(request: NextRequest): boolean {
  const apiKey = process.env.PACKETADS_API_KEY;
  if (!apiKey) return false;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7) === apiKey;
  return request.headers.get("x-api-key") === apiKey;
}

function parseParticipants(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * GET /api/bot/inscription
 *
 * Returns two lists:
 * - toPost: active inscriptions without a messageId (bot needs to post them)
 * - toClose: inscriptions with a messageId that have expired/disabled and no closedAt yet
 */
export async function GET(request: NextRequest): Promise<Response> {
  if (!authenticate(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const [toPost, toClose] = await Promise.all([
    db
      .select()
      .from(inscriptions)
      .where(
        and(
          eq(inscriptions.enabled, true),
          isNull(inscriptions.messageId),
          or(isNull(inscriptions.startsAt), lte(inscriptions.startsAt, now)),
          or(isNull(inscriptions.expiresAt), gt(inscriptions.expiresAt, now)),
        ),
      ),
    db
      .select()
      .from(inscriptions)
      .where(
        and(
          isNotNull(inscriptions.messageId),
          isNull(inscriptions.closedAt),
          or(
            eq(inscriptions.enabled, false),
            and(
              isNotNull(inscriptions.expiresAt),
              lte(inscriptions.expiresAt, now),
            ),
          ),
        ),
      ),
  ]);

  return Response.json({
    toPost: toPost.map((i) => ({
      ...i,
      participants: parseParticipants(i.participants),
    })),
    toClose: toClose.map((i) => ({
      ...i,
      participants: parseParticipants(i.participants),
    })),
  });
}
