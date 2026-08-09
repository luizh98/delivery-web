import { NextResponse, type NextRequest } from "next/server";
import { CUSTOMER_TOKEN_COOKIE, backendBaseUrl } from "@/constants/api";
import { resolveTenantFromHeaders } from "@/utils/tenant";

type RouteParams = {
  params: Promise<{ action: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const { action } = await context.params;
  if (action === "logout") {
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: CUSTOMER_TOKEN_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  if (action !== "login" && action !== "register") {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const backendResponse = await fetch(
    `${backendBaseUrl()}/api/customer/auth/${action}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Slug": resolveTenantFromHeaders(request.headers),
      },
      body: await request.text(),
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
  };
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: CUSTOMER_TOKEN_COOKIE,
    value: data.accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: data.expiresIn,
  });
  return response;
}
