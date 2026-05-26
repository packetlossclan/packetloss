import type { NextRequest } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<Response> {
  await clearSession();

  const proto =
    request.headers.get("x-forwarded-proto") ??
    new URL(request.url).protocol.replace(":", "");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    new URL(request.url).host;
  const homeUrl = `${proto}://${host}/`;
  return Response.redirect(homeUrl, 303);
}
