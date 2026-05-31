import { and, desc, eq, gt, isNotNull, isNull, lte, or } from "drizzle-orm";
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
 * With ?channelId=xxx: returns the most recently closed inscription for that channel.
 * Without query: returns two lists (toPost / toClose) for the scheduler.
 */
export async function GET(request: NextRequest): Promise<Response> {
  if (!authenticate(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channelId = request.nextUrl.searchParams.get("channelId");
  if (channelId) {
    const insc = await db
      .select()
      .from(inscriptions)
      .where(
        and(
          eq(inscriptions.channelId, channelId),
          isNotNull(inscriptions.closedAt),
        ),
      )
      .orderBy(desc(inscriptions.closedAt))
      .get();

    if (!insc) {
      return Response.json(
        { error: "Nenhuma inscrição encerrada neste canal" },
        { status: 404 },
      );
    }

    return Response.json({
      ...insc,
      participants: parseParticipants(insc.participants),
    });
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
