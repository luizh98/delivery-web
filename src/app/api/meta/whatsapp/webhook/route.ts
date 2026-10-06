import { backendBaseUrl } from "@/constants/api";

async function forward(request: Request) {
  const target = new URL("/api/meta/whatsapp/webhook", backendBaseUrl());
  let body: ArrayBuffer | undefined;
  if (request.method === "GET") {
    const source = new URL(request.url);
    for (const key of ["hub.mode", "hub.verify_token", "hub.challenge"]) {
      const value = source.searchParams.get(key);
      if (value) target.searchParams.set(key, value);
    }
  } else {
    const reader = request.body?.getReader();
    if (!reader) return new Response("Invalid payload", { status: 400 });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 1024 * 1024) { await reader.cancel(); return new Response("Payload too large", { status: 413 }); }
      chunks.push(chunk.value);
    }
    const joined = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength; }
    body = joined.buffer;
  }
  try {
    const response = await fetch(target, {
      method: request.method,
      headers: { "Content-Type": "application/json", "X-Hub-Signature-256": request.headers.get("x-hub-signature-256") ?? "" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    return new Response(response.body, { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "text/plain", "Cache-Control": "no-store" } });
  } catch {
    return new Response("Webhook temporarily unavailable", { status: 503 });
  }
}

export const GET = forward;
export const POST = forward;
