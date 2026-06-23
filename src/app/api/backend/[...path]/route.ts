import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_TOKEN_COOKIE, backendBaseUrl } from "@/lib/api/constants";
import { resolveTenantFromHeaders } from "@/lib/tenant";

type RouteParams = {
  params: Promise<{
    path: string[];
  }>;
};

async function forward(request: NextRequest, context: RouteParams) {
  const { path } = await context.params;
  const requestUrl = new URL(request.url);
  const targetUrl = new URL(`/api/${path.join("/")}`, backendBaseUrl());
  targetUrl.search = requestUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;

  headers.set("X-Tenant-Slug", resolveTenantFromHeaders(request.headers));
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  if (accept) {
    headers.set("Accept", accept);
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const responseType = response.headers.get("content-type");
  if (responseType) {
    responseHeaders.set("Content-Type", responseType);
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export function GET(request: NextRequest, context: RouteParams) {
  return forward(request, context);
}

export function POST(request: NextRequest, context: RouteParams) {
  return forward(request, context);
}

export function PUT(request: NextRequest, context: RouteParams) {
  return forward(request, context);
}

export function PATCH(request: NextRequest, context: RouteParams) {
  return forward(request, context);
}

export function DELETE(request: NextRequest, context: RouteParams) {
  return forward(request, context);
}
