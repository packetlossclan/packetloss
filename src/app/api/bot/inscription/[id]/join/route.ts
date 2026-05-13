import { eq } from "drizzle-orm";
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

type Participant = { discordId: string; displayName: string; joinedAt: string };

function parseParticipants(raw: string): Participant[] {
  try { return JSON.parse(raw); } catch { return []; }
}

/** POST /api/bot/inscription/[id]/join — add a Discord user to the participant list */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!authenticate(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const inscriptionId = Number(id);
  if (!Number.isInteger(inscriptionId) || inscriptionId <= 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const discordId = typeof body?.discordId === "string" ? body.discordId.trim() : null;
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : null;
  if (!discordId || !displayName) {
    return Response.json({ error: "discordId and displayName are required" }, { status: 400 });
  }

  const [inscription] = await db
    .select()
    .from(inscriptions)
    .where(eq(inscriptions.id, inscriptionId));

  if (!inscription) return Response.json({ error: "Not found" }, { status: 404 });

  const participants = parseParticipants(inscription.participants);

  if (participants.some((p) => p.discordId === discordId)) {
    return Response.json({ error: "already_joined", participants }, { status: 409 });
  }

  if (inscription.maxParticipants && participants.length >= inscription.maxParticipants) {
    return Response.json({ error: "full", participants }, { status: 409 });
  }

  participants.push({ discordId, displayName, joinedAt: new Date().toISOString() });

  await db
    .update(inscriptions)
    .set({ participants: JSON.stringify(participants), updatedAt: new Date() })
    .where(eq(inscriptions.id, inscriptionId));

  return Response.json({ ok: true, participants });
}
