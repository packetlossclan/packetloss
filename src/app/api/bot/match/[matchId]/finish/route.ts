import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { lobbyResults, matches } from "@/db/schema";

function authenticate(request: NextRequest): boolean {
  const apiKey = process.env.PACKETADS_API_KEY;
  if (!apiKey) return false;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7) === apiKey;
  return request.headers.get("x-api-key") === apiKey;
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * POST /api/bot/match/[matchId]/finish
 * Body: { lobbyNumber: number }
 *
 * Marks a lobby as finished and returns the score form URL.
 */
export async function POST(
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

  let lobbyNumber: number;
  try {
    const body = await request.json();
    lobbyNumber = Number(body.lobbyNumber);
    if (!Number.isInteger(lobbyNumber) || lobbyNumber <= 0) {
      return Response.json({ error: "lobbyNumber inválido" }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const match = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId))
    .get();

  if (!match) {
    return Response.json({ error: "Partida não encontrada" }, { status: 404 });
  }

  const lobbies = parseJson<{ number: number; players: unknown[] }[]>(
    match.lobbies,
    [],
  );
  const lobby = lobbies.find((l) => l.number === lobbyNumber);
  if (!lobby) {
    return Response.json({ error: "Lobby não encontrado" }, { status: 404 });
  }

  const existing = await db
    .select()
    .from(lobbyResults)
    .where(
      and(
        eq(lobbyResults.matchId, matchId),
        eq(lobbyResults.lobbyNumber, lobbyNumber),
      ),
    )
    .get();

  let result = existing;
  if (!result) {
    [result] = await db
      .insert(lobbyResults)
      .values({ matchId, lobbyNumber })
      .returning();
  }

  const siteUrl =
    process.env.SITE_URL ??
    process.env.PACKETLOSS_API_URL ??
    "https://packetloss.com.br";
  const scoreUrl = `${siteUrl}/admin/partidas/${matchId}`;

  return Response.json({ lobbyResultId: result.id, scoreUrl });
}
