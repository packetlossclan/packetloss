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

/** PATCH /api/bot/inscription/[id]/close — bot marks inscription as closed (buttons disabled) */
export async function PATCH(
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

  const [updated] = await db
    .update(inscriptions)
    .set({ closedAt: new Date(), updatedAt: new Date() })
    .where(eq(inscriptions.id, inscriptionId))
    .returning({ id: inscriptions.id });

  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
