import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_TOKEN_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_MAX_AGE,
  CUSTOMER_TOKEN_COOKIE,
  backendBaseUrl,
} from "@/constants/api";
import { resolveTenantFromHeaders } from "@/utils/tenant";

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
  const adminRoute = path[0] === "admin" || (path[0] === "auth" && path[1] === "me");
  const publicCustomerAuthRoute = path[0] === "customer" && path[1] === "auth";
  const customerRoute = path[0] === "customer" && !publicCustomerAuthRoute;
  const token = publicCustomerAuthRoute
    ? undefined
    : request.cookies.get(
        adminRoute ? ADMIN_TOKEN_COOKIE : CUSTOMER_TOKEN_COOKIE,
      )?.value;
  const sessionToken = customerRoute
    ? request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
    : undefined;

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
  const body = hasBody ? await request.arrayBuffer() : undefined;
  let response: Response;
  let refreshedAccessToken: string | undefined;
  let refreshedAccessExpiresIn = 86400;
  let persistentSessionToken: string | undefined;
  try {
    response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    if (response.status === 401 && customerRoute && sessionToken) {
      const refreshResponse = await fetch(`${backendBaseUrl()}/api/customer/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Slug": resolveTenantFromHeaders(request.headers),
        },
        body: JSON.stringify({ sessionToken }),
        cache: "no-store",
      });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json() as {
          accessToken: string;
          expiresIn: number;
          sessionToken: string;
        };
        refreshedAccessToken = refreshData.accessToken;
        refreshedAccessExpiresIn = refreshData.expiresIn;
        persistentSessionToken = refreshData.sessionToken;
        headers.set("Authorization", `Bearer ${refreshedAccessToken}`);
        response = await fetch(targetUrl, {
          method: request.method,
          headers,
          body,
          cache: "no-store",
        });
      }
    }

    if (response.ok && customerRoute && token && !sessionToken) {
      const sessionResponse = await fetch(`${backendBaseUrl()}/api/customer/auth/session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Tenant-Slug": resolveTenantFromHeaders(request.headers),
        },
        cache: "no-store",
      });
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json() as { sessionToken: string };
        persistentSessionToken = sessionData.sessionToken;
      }
    }
  } catch {
    return NextResponse.json(
      {
        error: "BACKEND_UNAVAILABLE",
        message: "Backend temporarily unavailable. Try again shortly.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": "3",
        },
      },
    );
  }

  const responseHeaders = new Headers();
  const responseType = response.headers.get("content-type");
  if (responseType) {
    responseHeaders.set("Content-Type", responseType);
  }
  if (responseType?.startsWith("text/event-stream")) {
    responseHeaders.set("Cache-Control", "no-cache, no-transform");
    responseHeaders.set("X-Accel-Buffering", "no");
  }

  const nextResponse = new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
  if (persistentSessionToken) {
    if (refreshedAccessToken) {
      nextResponse.cookies.set({
        name: CUSTOMER_TOKEN_COOKIE,
        value: refreshedAccessToken,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: refreshedAccessExpiresIn,
      });
    }
    nextResponse.cookies.set({
      name: CUSTOMER_SESSION_COOKIE,
      value: persistentSessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: CUSTOMER_SESSION_MAX_AGE,
    });
  }
  return nextResponse;
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
