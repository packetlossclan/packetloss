import type { NextRequest } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<Response> {
  await clearSession();

  const homeUrl = new URL("/", request.url).toString();
  return Response.redirect(homeUrl, 303);
}
