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
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

const DEFAULT_MOCK_COUNT = 30;

/**
 * POST /api/bot/inscription/[id]/mock — fill the participant list with mock
 * users. Only available outside production, for testing the draft flow.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not available in production" }, { status: 403 });
  }

  if (!authenticate(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const inscriptionId = Number(id);
  if (!Number.isInteger(inscriptionId) || inscriptionId <= 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const [inscription] = await db
    .select()
    .from(inscriptions)
    .where(eq(inscriptions.id, inscriptionId));

  if (!inscription)
    return Response.json({ error: "Not found" }, { status: 404 });

  const participants = parseParticipants(inscription.participants);
  const target = inscription.maxParticipants ?? DEFAULT_MOCK_COUNT;

  let n = 1;
  while (participants.length < target) {
    const discordId = `mock-${n}`;
    if (!participants.some((p) => p.discordId === discordId)) {
      participants.push({
        discordId,
        displayName: `Mock Jogador ${String(n).padStart(2, "0")}`,
        joinedAt: new Date().toISOString(),
      });
    }
    n++;
  }

  await db
    .update(inscriptions)
    .set({ participants: JSON.stringify(participants), updatedAt: new Date() })
    .where(eq(inscriptions.id, inscriptionId));

  return Response.json({ ok: true, participants });
}
