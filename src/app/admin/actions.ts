"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { ads, users } from "@/db/schema";
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

export async function createAd(formData: FormData) {
  await requireAdmin();

  const actor = await getCurrentUser();

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const intervalHours = Number(formData.get("intervalHours") ?? 24);
  const startsAtRaw = formData.get("startsAt");
  const expiresAtRaw = formData.get("expiresAt");

  if (!title || !message) throw new Error("Title and message are required");
  if (intervalHours < 1) throw new Error("Interval must be at least 1 hour");

  await db.insert(ads).values({
    title,
    message,
    intervalHours,
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
  const intervalHours = Number(formData.get("intervalHours") ?? 24);
  const startsAtRaw = formData.get("startsAt");
  const expiresAtRaw = formData.get("expiresAt");

  if (!title || !message) throw new Error("Title and message are required");
  if (intervalHours < 1) throw new Error("Interval must be at least 1 hour");

  await db
    .update(ads)
    .set({
      title,
      message,
      intervalHours,
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
