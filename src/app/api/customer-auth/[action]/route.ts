import { NextResponse, type NextRequest } from "next/server";
import {
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_MAX_AGE,
  CUSTOMER_TOKEN_COOKIE,
  backendBaseUrl,
} from "@/constants/api";
import { resolveTenantFromHeaders } from "@/utils/tenant";

type RouteParams = {
  params: Promise<{ action: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const { action } = await context.params;
  const secure = process.env.NODE_ENV === "production";

  if (action === "logout") {
    const sessionToken = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
    if (sessionToken) {
      try {
        await fetch(`${backendBaseUrl()}/api/customer/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Slug": resolveTenantFromHeaders(request.headers),
          },
          body: JSON.stringify({ sessionToken }),
          cache: "no-store",
        });
      } catch {
        // Local cookie cleanup still logs the browser out if the backend is unavailable.
      }
    }
    const response = NextResponse.json({ ok: true });
    clearCustomerCookies(response, secure);
    return response;
  }

  if (action !== "login" && action !== "register" && action !== "refresh") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const body = action === "refresh"
    ? JSON.stringify({
        sessionToken: request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value ?? "",
      })
    : await request.text();

  const backendResponse = await fetch(
    `${backendBaseUrl()}/api/customer/auth/${action}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Slug": resolveTenantFromHeaders(request.headers),
      },
      body,
      cache: "no-store",
    },
  );
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
    expiresIn: number;
    sessionToken: string;
  };
  const response = NextResponse.json({ ok: true });
  setCustomerCookies(response, data, secure);
  return response;
}

function setCustomerCookies(
  response: NextResponse,
  data: { accessToken: string; expiresIn: number; sessionToken: string },
  secure: boolean,
) {
  response.cookies.set({
    name: CUSTOMER_TOKEN_COOKIE,
    value: data.accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: data.expiresIn,
  });
  response.cookies.set({
    name: CUSTOMER_SESSION_COOKIE,
    value: data.sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: CUSTOMER_SESSION_MAX_AGE,
  });
}

function clearCustomerCookies(response: NextResponse, secure: boolean) {
  for (const name of [CUSTOMER_TOKEN_COOKIE, CUSTOMER_SESSION_COOKIE]) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
    });
  }
}
