import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_TOKEN_COOKIE, backendBaseUrl } from "@/constants/api";
import { resolveTenantFromHeaders } from "@/utils/tenant";

export async function POST(request: NextRequest) {
  const tenantSlug = resolveTenantFromHeaders(request.headers);
  const body = await request.text();

  const backendResponse = await fetch(`${backendBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Slug": tenantSlug,
    },
    body,
    cache: "no-store",
  });

  const responseBody = await backendResponse.text();
  if (!backendResponse.ok) {
    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: {
        "Content-Type": backendResponse.headers.get("content-type") ?? "application/json",
      },
    });
  }

  const data = JSON.parse(responseBody) as {
    accessToken: string;
    expiresInSeconds: number;
  };

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_TOKEN_COOKIE,
    value: data.accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: data.expiresInSeconds,
  });

  return response;
}
