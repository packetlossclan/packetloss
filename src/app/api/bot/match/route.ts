import { and, desc, eq, isNotNull } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { inscriptions, matches } from "@/db/schema";

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
 * POST /api/bot/match
 * Body: { inscriptionId: number }
 *
 * Distributes inscription participants into lobbies of 10.
 * Excess players go to the suplentes list.
 */
export async function POST(request: NextRequest): Promise<Response> {
  if (!authenticate(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let inscriptionId: number;
  try {
    const body = await request.json();
    inscriptionId = Number(body.inscriptionId);
    if (!Number.isInteger(inscriptionId) || inscriptionId <= 0) {
      return Response.json(
        { error: "inscriptionId inválido" },
        { status: 400 },
      );
    }
  } catch {
    return Response.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const inscription = await db
    .select()
    .from(inscriptions)
    .where(eq(inscriptions.id, inscriptionId))
    .get();

  if (!inscription) {
    return Response.json(
      { error: "Inscrição não encontrada" },
      { status: 404 },
    );
  }

  const existing = await db
    .select()
    .from(matches)
    .where(
      and(
        eq(matches.inscriptionId, inscriptionId),
        eq(matches.status, "draft"),
      ),
    )
    .get();

  if (existing) {
    return Response.json({
      ...existing,
      lobbies: parseJson(existing.lobbies, []),
      suplentes: parseJson(existing.suplentes, []),
    });
  }

  const allPlayers = parseJson<
    { discordId: string; displayName: string; joinedAt: string }[]
  >(inscription.participants, []);

  const lobbySize = 10;
  const numLobbies = Math.floor(allPlayers.length / lobbySize);
  const lobbyList = Array.from({ length: numLobbies }, (_, i) => ({
    number: i + 1,
    players: allPlayers.slice(i * lobbySize, (i + 1) * lobbySize),
  }));
  const suplentes = allPlayers.slice(numLobbies * lobbySize);

  const [match] = await db
    .insert(matches)
    .values({
      inscriptionId,
      lobbies: JSON.stringify(lobbyList),
      suplentes: JSON.stringify(suplentes),
      channelId: inscription.channelId,
      status: "draft",
    })
    .returning();

  return Response.json({
    ...match,
    lobbies: lobbyList,
    suplentes,
  });
}

/**
 * GET /api/bot/match?channelId=xxx
 *
 * Returns the most recent active draft match for the given channel.
 */
export async function GET(request: NextRequest): Promise<Response> {
  if (!authenticate(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channelId = request.nextUrl.searchParams.get("channelId");
  if (!channelId) {
    return Response.json({ error: "channelId obrigatório" }, { status: 400 });
  }

  const match = await db
    .select()
    .from(matches)
    .where(
      and(
        eq(matches.channelId, channelId),
        eq(matches.status, "draft"),
        isNotNull(matches.inscriptionId),
      ),
    )
    .orderBy(desc(matches.createdAt))
    .get();

  if (!match) {
    return Response.json(
      { error: "Nenhuma partida ativa encontrada" },
      { status: 404 },
    );
  }

  return Response.json({
    ...match,
    lobbies: parseJson(match.lobbies, []),
    suplentes: parseJson(match.suplentes, []),
  });
}
