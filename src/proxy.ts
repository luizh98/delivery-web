import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveTenantFromHost } from "@/utils/tenant";

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  const tenantSlug =
    request.headers.get("x-tenant-slug") ??
    resolveTenantFromHost(request.headers.get("host"));

  headers.set("x-tenant-slug", tenantSlug);

  return NextResponse.next({
    request: {
      headers,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
