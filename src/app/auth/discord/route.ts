import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import {
  buildDiscordAuthorizeUrl,
  getDiscordStateCookieName,
} from "@/lib/discord";

function getRedirectUri(request: NextRequest): string {
  if (process.env.DISCORD_REDIRECT_URI) {
    return process.env.DISCORD_REDIRECT_URI;
  }

  const url = new URL(request.url);
  return `${url.origin}/auth/discord/callback`;
}

export async function GET(request: NextRequest): Promise<Response> {
  const state = randomBytes(16).toString("hex");
  const redirectUri = getRedirectUri(request);
  const authorizeUrl = buildDiscordAuthorizeUrl(state, redirectUri);

  const cookieStore = await cookies();
  cookieStore.set(getDiscordStateCookieName(), state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return Response.redirect(authorizeUrl);
}
