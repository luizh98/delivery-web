import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_TOKEN_COOKIE, backendBaseUrl } from "@/lib/api/constants";
import { resolveTenantFromHeaders } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const backendResponse = await fetch(`${backendBaseUrl()}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Tenant-Slug": resolveTenantFromHeaders(request.headers),
    },
    cache: "no-store",
  });

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") ?? "application/json",
    },
  });
}
