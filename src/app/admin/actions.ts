"use server";

import { and, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  ads,
  users,
  applications,
  inscriptions,
  matches,
  lobbyResults,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { MATCHES_PER_SEASON, INITIAL_OFFSET } from "@/lib/ranked";

async function nextRankedNumber(): Promise<number> {
  const row = await db
    .select({ last: max(inscriptions.rankedNumber) })
    .from(inscriptions)
    .get();
  return (row?.last ?? INITIAL_OFFSET) + 1;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new Error("Forbidden");
  }
  return user;
}

async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") {
    throw new Error("Forbidden");
  }
  return user;
}

// ─── User role management (super_admin only) ─────────────────────────────────

export async function updateUserRole(
  targetUserId: number,
  newRole: "user" | "admin" | "super_admin",
) {
  const actor = await requireSuperAdmin();
  if (actor.id === targetUserId) throw new Error("Cannot change your own role");

  await db
    .update(users)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(users.id, targetUserId));

  revalidatePath("/admin");
}

// ─── Ads CRUD ─────────────────────────────────────────────────────────────────

type ScheduleType =
  | "minutes"
  | "hours"
  | "days"
  | "once"
  | "daily_time"
  | "specific_dates";

const INTERVAL_TYPES: ScheduleType[] = ["minutes", "hours", "days"];

function parseScheduleFields(formData: FormData) {
  const scheduleType = (formData.get("scheduleType") ??
    "hours") as ScheduleType;
  const scheduleIntervalRaw = formData.get("scheduleInterval");
  const scheduleInterval = scheduleIntervalRaw
    ? Number(scheduleIntervalRaw)
    : null;
  const scheduleTimeRaw = formData.get("scheduleTime");
  const scheduleTime = scheduleTimeRaw ? String(scheduleTimeRaw).trim() : null;
  const scheduleDatesRaw = formData.get("scheduleDates");
  const scheduleDates = scheduleDatesRaw ? String(scheduleDatesRaw) : null;

  if (INTERVAL_TYPES.includes(scheduleType)) {
    if (!scheduleInterval || scheduleInterval < 1)
      throw new Error("Intervalo deve ser pelo menos 1");
  }
  if (scheduleType === "once" && !scheduleTime)
    throw new Error("Data e hora são obrigatórias para agendamento único");
  if (scheduleType === "daily_time" && !scheduleTime)
    throw new Error("Horário é obrigatório para agendamento diário");
  if (scheduleType === "specific_dates") {
    try {
      const parsed = JSON.parse(scheduleDates ?? "[]");
      if (!Array.isArray(parsed) || parsed.length === 0)
        throw new Error("Adicione pelo menos uma data");
    } catch (e) {
      if (e instanceof Error && e.message.includes("Adicione")) throw e;
      throw new Error("Datas inválidas");
    }
  }

  return { scheduleType, scheduleInterval, scheduleTime, scheduleDates };
}

export async function createAd(formData: FormData) {
  await requireAdmin();

  const actor = await getCurrentUser();

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const startsAtRaw = formData.get("startsAt");
  const expiresAtRaw = formData.get("expiresAt");

  if (!title || !message) throw new Error("Título e mensagem são obrigatórios");

  const { scheduleType, scheduleInterval, scheduleTime, scheduleDates } =
    parseScheduleFields(formData);

  const channelIdRaw = formData.get("channelId");
  const channelId = channelIdRaw ? String(channelIdRaw).trim() || null : null;

  await db.insert(ads).values({
    title,
    message,
    scheduleType,
    scheduleInterval,
    scheduleTime,
    scheduleDates,
    channelId,
    startsAt: startsAtRaw ? new Date(String(startsAtRaw)) : null,
    expiresAt: expiresAtRaw ? new Date(String(expiresAtRaw)) : null,
    createdBy: actor?.id ?? null,
  });

  revalidatePath("/admin");
}

export async function updateAd(id: number, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const startsAtRaw = formData.get("startsAt");
  const expiresAtRaw = formData.get("expiresAt");

  if (!title || !message) throw new Error("Título e mensagem são obrigatórios");

  const { scheduleType, scheduleInterval, scheduleTime, scheduleDates } =
    parseScheduleFields(formData);

  const channelIdRaw = formData.get("channelId");
  const channelId = channelIdRaw ? String(channelIdRaw).trim() || null : null;

  await db
    .update(ads)
    .set({
      title,
      message,
      scheduleType,
      scheduleInterval,
      scheduleTime,
      scheduleDates,
      channelId,
      startsAt: startsAtRaw ? new Date(String(startsAtRaw)) : null,
      expiresAt: expiresAtRaw ? new Date(String(expiresAtRaw)) : null,
      updatedAt: new Date(),
    })
    .where(eq(ads.id, id));

  revalidatePath("/admin");
}

export async function toggleAd(id: number, enabled: boolean) {
  await requireAdmin();

  await db
    .update(ads)
    .set({ enabled, updatedAt: new Date() })
    .where(eq(ads.id, id));

  revalidatePath("/admin");
}

export async function deleteAd(id: number) {
  await requireAdmin();
  await db.delete(ads).where(eq(ads.id, id));
  revalidatePath("/admin");
}

// ─── Application management ───────────────────────────────────────────────────

export async function reviewApplication(
  appId: number,
  status: "approved" | "rejected",
  reviewNote: string,
) {
  const actor = await requireAdmin();

  await db
    .update(applications)
    .set({
      status,
      reviewedBy: actor.id,
      reviewNote: reviewNote || null,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, appId));

  revalidatePath("/admin");
}

export async function deleteApplication(appId: number) {
  await requireAdmin();
  await db.delete(applications).where(eq(applications.id, appId));
  revalidatePath("/admin");
}

// ─── Inscription management ───────────────────────────────────────────────────

export async function createInscription(formData: FormData) {
  const actor = await requireAdmin();

  const description = String(formData.get("description") ?? "").trim() || null;
  const channelId = String(formData.get("channelId") ?? "").trim() || null;
  const maxParticipantsRaw = formData.get("maxParticipants");
  const maxParticipants = maxParticipantsRaw
    ? Number(maxParticipantsRaw)
    : null;

  // Parse startsAt as Brasília time (BRT = UTC-3)
  const startsAtRaw = formData.get("startsAt");
  const startsAt = startsAtRaw
    ? new Date(`${String(startsAtRaw)}:00-03:00`)
    : null;

  const n = await nextRankedNumber();

  await db.insert(inscriptions).values({
    rankedNumber: n,
    season: Math.ceil(n / MATCHES_PER_SEASON),
    description,
    channelId,
    maxParticipants:
      maxParticipants && maxParticipants > 0 ? maxParticipants : null,
    startsAt,
    createdBy: actor.id,
  });

  revalidatePath("/admin");
  revalidatePath("/rankeada");
}

export async function toggleInscription(id: number, enabled: boolean) {
  await requireAdmin();
  await db
    .update(inscriptions)
    .set({ enabled, updatedAt: new Date() })
    .where(eq(inscriptions.id, id));
  revalidatePath("/admin");
  revalidatePath("/rankeada");
}

export async function resetInscription(id: number) {
  await requireAdmin();
  await db
    .update(inscriptions)
    .set({
      messageId: null,
      participants: "[]",
      closedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(inscriptions.id, id));
  revalidatePath("/admin");
  revalidatePath("/rankeada");
}

export async function deleteInscription(id: number) {
  await requireAdmin();
  await db.delete(inscriptions).where(eq(inscriptions.id, id));
  revalidatePath("/admin");
  revalidatePath("/rankeada");
}

export async function togglePlayed(id: number, played: boolean) {
  await requireAdmin();
  await db
    .update(inscriptions)
    .set({ played, updatedAt: new Date() })
    .where(eq(inscriptions.id, id));
  revalidatePath("/admin");
  revalidatePath("/rankeada");
}

// ─── Match / Draft management ─────────────────────────────────────────────────

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function startDraft(inscriptionId: number) {
  const actor = await requireAdmin();

  const inscription = await db
    .select()
    .from(inscriptions)
    .where(eq(inscriptions.id, inscriptionId))
    .get();

  if (!inscription) throw new Error("Inscrição não encontrada");

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

  if (existing) throw new Error("Draft já iniciado para esta inscrição");

  type Participant = {
    discordId: string;
    displayName: string;
    joinedAt: string;
  };
  const allPlayers = parseJson<Participant[]>(inscription.participants, []);

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
      createdBy: actor.id,
    })
    .returning();

  revalidatePath("/admin");
  revalidatePath(`/admin/partidas/${match.id}`);
  return match.id;
}

export async function submitLobbyScores(
  matchId: number,
  lobbyNumber: number,
  formData: FormData,
) {
  const actor = await requireAdmin();

  const match = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId))
    .get();

  if (!match) throw new Error("Partida não encontrada");

  const lobbies = parseJson<
    { number: number; players: { discordId: string; displayName: string }[] }[]
  >(match.lobbies, []);
  const lobby = lobbies.find((l) => l.number === lobbyNumber);
  if (!lobby) throw new Error("Lobby não encontrado");

  const scores = lobby.players.map((p) => ({
    discordId: p.discordId,
    displayName: p.displayName,
    role: String(formData.get(`role_${p.discordId}`) ?? "crewmate"),
    outcome: String(formData.get(`outcome_${p.discordId}`) ?? "loss"),
    points: Number(formData.get(`points_${p.discordId}`) ?? 0),
  }));

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

  if (existing) {
    await db
      .update(lobbyResults)
      .set({
        scores: JSON.stringify(scores),
        status: "submitted",
        submittedBy: actor.id,
        updatedAt: new Date(),
      })
      .where(eq(lobbyResults.id, existing.id));
  } else {
    await db.insert(lobbyResults).values({
      matchId,
      lobbyNumber,
      scores: JSON.stringify(scores),
      status: "submitted",
      submittedBy: actor.id,
    });
  }

  revalidatePath(`/admin/partidas/${matchId}`);
  revalidatePath("/admin");
}
