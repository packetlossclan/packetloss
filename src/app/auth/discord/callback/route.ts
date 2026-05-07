import { count, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { buildDiscordAvatarUrl, createSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  exchangeCodeForAccessToken,
  fetchDiscordUser,
  getDiscordStateCookieName,
} from "@/lib/discord";

function getOrigin(request: NextRequest): string {
  if (process.env.DISCORD_REDIRECT_URI) {
    return new URL(process.env.DISCORD_REDIRECT_URI).origin;
  }

  return new URL(request.url).origin;
}

function getRedirectUri(request: NextRequest): string {
  return `${getOrigin(request)}/auth/discord/callback`;
}

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const homeUrl = `${getOrigin(request)}/`;

  if (error || !code || !state) {
    return Response.redirect(homeUrl);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(getDiscordStateCookieName())?.value;
  cookieStore.delete(getDiscordStateCookieName());

  if (!storedState || storedState !== state) {
    return new Response("Invalid state", { status: 400 });
  }

  const redirectUri = getRedirectUri(request);
  const accessToken = await exchangeCodeForAccessToken(code, redirectUri);
  const discordUser = await fetchDiscordUser(accessToken);

  const avatarUrl = buildDiscordAvatarUrl(discordUser.id, discordUser.avatar);
  const email = discordUser.email ?? null;
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const isSuperAdminEmail = !!superAdminEmail && email === superAdminEmail;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.discordId, discordUser.id))
    .limit(1);

  let userId: number;

  if (existing) {
    await db
      .update(users)
      .set({
        username: discordUser.username,
        avatarUrl,
        email,
        ...(isSuperAdminEmail ? { role: "super_admin" as const } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));

    userId = existing.id;
  } else {
    const [{ total }] = await db.select({ total: count() }).from(users);

    const role = isSuperAdminEmail || total === 0 ? "super_admin" : "user";

    const [inserted] = await db
      .insert(users)
      .values({
        discordId: discordUser.id,
        username: discordUser.username,
        avatarUrl,
        email,
        role,
      })
      .returning({ id: users.id });

    userId = inserted.id;
  }

  await createSession(userId);

  return Response.redirect(homeUrl);
}
