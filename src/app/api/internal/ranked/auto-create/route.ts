import { and, gte, lt, max } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { inscriptions } from "@/db/schema";
const DEFAULT_CHANNEL_ID = "1497735342005158040";
const INITIAL_OFFSET = 33;
const MATCHES_PER_SEASON = 28;

function authenticate(request: NextRequest): boolean {
  const token = process.env.INTERNAL_API_TOKEN;
  if (!token) return false;
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7) === token;
  return false;
}

/**
 * POST /api/internal/ranked/auto-create
 *
 * Chamado às 20:29 BRT pelo packetloss-ranked.timer.
 * Se não houver inscrição criada para o período de 20:00–23:59 BRT de hoje,
 * cria uma com startsAt = 20:30 BRT (23:30 UTC).
 */
export async function POST(request: NextRequest): Promise<Response> {
  if (!authenticate(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // BRT = UTC-3 (fixo, sem horário de verão desde 2019)
  const now = new Date();
  const brtNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const y = brtNow.getUTCFullYear();
  const mo = brtNow.getUTCMonth();
  const d = brtNow.getUTCDate();

  // Janela de verificação: 20:00 BRT (23:00 UTC) → meia-noite BRT (03:00 UTC dia +1)
  const windowStart = new Date(Date.UTC(y, mo, d, 23, 0));
  const windowEnd = new Date(Date.UTC(y, mo, d + 1, 3, 0));

  const existing = await db
    .select({ id: inscriptions.id })
    .from(inscriptions)
    .where(
      and(
        gte(inscriptions.startsAt, windowStart),
        lt(inscriptions.startsAt, windowEnd),
      ),
    )
    .get();

  if (existing) {
    return Response.json({
      created: false,
      reason: "already_exists",
      id: existing.id,
    });
  }

  // startsAt: 20:30 BRT = 23:30 UTC
  const startsAt = new Date(Date.UTC(y, mo, d, 23, 30));

  const row = await db
    .select({ last: max(inscriptions.rankedNumber) })
    .from(inscriptions)
    .get();
  const n = (row?.last ?? INITIAL_OFFSET) + 1;

  const [created] = await db
    .insert(inscriptions)
    .values({
      rankedNumber: n,
      season: Math.ceil(n / MATCHES_PER_SEASON),
      channelId: DEFAULT_CHANNEL_ID,
      startsAt,
      enabled: true,
    })
    .returning();

  return Response.json({
    created: true,
    id: created.id,
    rankedNumber: created.rankedNumber,
    season: created.season,
  });
}
