"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { ads, users, applications, inscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

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

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Título é obrigatório");

  const description = String(formData.get("description") ?? "").trim() || null;
  const channelId = String(formData.get("channelId") ?? "").trim() || null;
  const maxParticipantsRaw = formData.get("maxParticipants");
  const maxParticipants = maxParticipantsRaw
    ? Number(maxParticipantsRaw)
    : null;
<<<<<<< HEAD

  // Parse startsAt as Brasília time (BRT = UTC-3)
=======
>>>>>>> d32099fa56b88e91dd80ea4b775c6d61492cd9cd
  const startsAtRaw = formData.get("startsAt");
  const startsAt = startsAtRaw
    ? new Date(String(startsAtRaw) + ":00-03:00")
    : null;

  // Compute expiresAt from duration dropdown (hours after startsAt)
  const durationHoursRaw = formData.get("durationHours");
  const durationHours = durationHoursRaw ? Number(durationHoursRaw) : null;
  let expiresAt: Date | null = null;
  if (startsAt && durationHours && durationHours > 0) {
    expiresAt = new Date(startsAt.getTime() + durationHours * 60 * 60 * 1000);
  }

  const announcementHoursBeforeRaw = formData.get("announcementHoursBefore");
  const announcementHoursBefore = announcementHoursBeforeRaw
    ? Math.max(1, Number(announcementHoursBeforeRaw))
    : 2;

  await db.insert(inscriptions).values({
    title,
    description,
    channelId,
    maxParticipants:
      maxParticipants && maxParticipants > 0 ? maxParticipants : null,
<<<<<<< HEAD
    startsAt,
    expiresAt,
    announcementHoursBefore,
=======
    startsAt: startsAtRaw ? new Date(String(startsAtRaw)) : null,
    expiresAt: expiresAtRaw ? new Date(String(expiresAtRaw)) : null,
>>>>>>> d32099fa56b88e91dd80ea4b775c6d61492cd9cd
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
