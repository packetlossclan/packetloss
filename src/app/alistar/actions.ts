"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function submitApplication(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/discord");

  // Check for existing pending/approved application
  const existing = await db
    .select({ id: applications.id, status: applications.status })
    .from(applications)
    .where(eq(applications.userId, user.id))
    .limit(1);

  if (existing.length > 0) {
    const app = existing[0];
    if (app.status === "approved")
      redirect("/alistar/status?s=already_approved");
    if (app.status === "pending") redirect("/alistar/status?s=already_pending");
    // rejected: allow re-application — delete old one
    await db.delete(applications).where(eq(applications.id, app.id));
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const country = String(formData.get("country") ?? "Brasil").trim();
  const state = String(formData.get("state") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const favoriteRole = String(formData.get("favoriteRole") ?? "both") as
    | "crewmate"
    | "impostor"
    | "both";
  const amogusHours = Number(formData.get("amogusHours") ?? 0);
  const hoursPerWeek = Number(formData.get("hoursPerWeek") ?? 0);
  const otherGames = String(formData.get("otherGames") ?? "").trim() || null;
  const howFound = String(formData.get("howFound") ?? "").trim() || null;
  const extraInfo = String(formData.get("extraInfo") ?? "").trim() || null;

  if (!fullName || !birthDate || !state || !city || !reason) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  await db.insert(applications).values({
    userId: user.id,
    fullName,
    birthDate,
    country,
    state,
    city,
    reason,
    favoriteRole,
    amogusHours,
    hoursPerWeek,
    otherGames,
    howFound,
    extraInfo,
  });

  redirect("/alistar/status?s=submitted");
}
