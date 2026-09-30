import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveTenantFromHost } from "@/utils/tenant";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/links") {
    const host = request.headers.get("host") ?? "";
    const hostname = host.split(":")[0]?.toLowerCase() ?? "";
    const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "flyfoods.com.br")
      .trim().toLowerCase();
    const terracoHost = hostname === "terraco-canecao.localhost"
      || hostname === `terraco-canecao.${rootDomain}`
      || (hostname === rootDomain
        && process.env.LANDING_ROOT_HOST_TENANT_SLUG === "terraco-canecao"
        && resolveTenantFromHost(host) === "terraco-canecao");
    if (terracoHost) {
      const destination = new URL("/landing-pages/terraco-canecao/index.html", request.url);
      destination.search = request.nextUrl.search;
      return NextResponse.rewrite(destination);
    }
  }

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
