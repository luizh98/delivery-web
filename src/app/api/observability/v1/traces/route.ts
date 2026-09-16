import { NextResponse, type NextRequest } from "next/server";

const tracesPath = "/api/default/v1/traces";

export async function POST(request: NextRequest) {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim();
  const authorization = process.env.OTEL_EXPORTER_OTLP_AUTHORIZATION?.trim();
  if (!endpoint || !authorization) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}${tracesPath}`, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": request.headers.get("content-type") ?? "application/x-protobuf",
      },
      body: await request.arrayBuffer(),
      cache: "no-store",
    });
    return new NextResponse(null, { status: response.ok ? 204 : response.status });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
