import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { matches } from "@/db/schema";

function authenticate(request: NextRequest): boolean {
  const apiKey = process.env.PACKETADS_API_KEY;
  if (!apiKey) return false;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7) === apiKey;
  return request.headers.get("x-api-key") === apiKey;
}

/**
 * PATCH /api/bot/match/[matchId]/message
 * Body: { messageId: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
): Promise<Response> {
  if (!authenticate(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matchId: matchIdStr } = await params;
  const matchId = Number(matchIdStr);
  if (!Number.isInteger(matchId) || matchId <= 0) {
    return Response.json({ error: "matchId inválido" }, { status: 400 });
  }

  let messageId: string;
  try {
    const body = await request.json();
    messageId = String(body.messageId ?? "").trim();
    if (!messageId)
      return Response.json({ error: "messageId obrigatório" }, { status: 400 });
  } catch {
    return Response.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  await db
    .update(matches)
    .set({ messageId, updatedAt: new Date() })
    .where(eq(matches.id, matchId));

  return Response.json({ ok: true });
}
