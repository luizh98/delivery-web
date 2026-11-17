import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(url, dependencies, globals = {}) {
  const module = { exports: {} };
  runInNewContext(ts.transpileModule(readFileSync(url, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    module, exports: module.exports, process, Headers, URL, Response, AbortSignal,
    require: name => name in dependencies ? dependencies[name] : require(name), ...globals,
  });
  return module.exports;
}
const device = load(new URL("./tableDevice.ts", import.meta.url), {});
test("device tokens persist only valid 256-bit browser identifiers", () => {
  const token = device.tableDeviceToken();
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(device.tableDeviceToken(token), token);
  assert.notEqual(device.tableDeviceToken("forged"), "forged");
  assert.equal(device.tableDeviceCookieOptions.httpOnly, true);
  assert.equal(device.tableDeviceCookieOptions.sameSite, "lax");
  assert.equal(device.usesTableDevice(["admin", "tables"], "POST"), false);
  assert.equal(device.usesTableDevice(["public", "orders", "tracking", "x"], "GET"), false);
});

function proxy(existing, fails = false) {
  const calls = [];
  class NextResponse extends Response {
    cookies = { values: [], set(...args) { this.values.push(args); } };
    static json(value, options) { return new NextResponse(JSON.stringify(value), options); }
  }
  const route = load(new URL("../../app/api/backend/[...path]/route.ts", import.meta.url), {
    "next/server": { NextResponse }, "next/cache": { revalidateTag() {} },
    "@/services/api/tableDevice": device,
    "@/services/api/cache": { restaurantConfigCacheTag: () => "config" },
    "@/constants/api": { backendBaseUrl: () => "https://backend.test", ADMIN_TOKEN_COOKIE: "admin", CUSTOMER_TOKEN_COOKIE: "customer" },
    "@/utils/tenant": { resolveTenantFromHeaders: () => "shop" },
  }, { fetch: async (url, init) => { calls.push({ url, ...init }); if (fails) throw Error("offline"); return Response.json({ ok: true }); } });
  const request = new Request("https://shop.test/api/backend/public/tables/qr/join", { method: "POST", body: JSON.stringify({ code: "23456789AB", sessionId: "visit" }), headers: { "content-type": "application/json", "X-Table-Client-Token": "untrusted-header" } });
  request.cookies = { get: name => name === device.TABLE_DEVICE_COOKIE && existing ? { value: existing } : undefined };
  return { calls, run: () => route.POST(request, { params: Promise.resolve({ path: ["public", "tables", "qr", "join"] }) }) };
}
test("proxy trusts HttpOnly cookie instead of incoming client header and prevents caching", async () => {
  const token = device.tableDeviceToken(), p = proxy(token);
  const response = await p.run();
  assert.equal(p.calls[0].headers.get("X-Table-Client-Token"), token);
  assert.equal(p.calls[0].headers.get("X-Tenant-Slug"), "shop");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.cookies.values[0][1], token);
});
test("new identity survives a backend failure so a retried order retains its device", async () => {
  const p = proxy(undefined, true), response = await p.run();
  assert.equal(response.status, 503);
  assert.equal(response.cookies.values[0][1], p.calls[0].headers.get("X-Table-Client-Token"));
  assert.match(response.cookies.values[0][1], /^[A-Za-z0-9_-]{43}$/);
});
test("server table rendering forwards browser identity through tenant-aware uncached fetch", async () => {
  const token = device.tableDeviceToken(), calls = [];
  const server = load(new URL("./server.ts", import.meta.url), {
    "next/headers": { headers: async () => new Headers(), cookies: async () => ({ get: name => name === device.TABLE_DEVICE_COOKIE ? { value: token } : undefined }) },
    "next/cache": { unstable_cache: fn => fn }, "@/services/api/tableDevice": device,
    "@/services/api/cache": {}, "@/utils/tenant": { resolveTenantFromHeaders: () => "shop" },
    "@/constants/api": { backendBaseUrl: () => "https://backend.test" },
  }, { fetch: async (url, init) => { calls.push({ url, ...init }); return Response.json({ number: "01" }); } });
  await server.getPublicTable("qr");
  assert.equal(calls[0].headers.get("X-Table-Client-Token"), token);
  assert.equal(calls[0].cache, "no-store");
  await server.getMenu();
  assert.equal(calls[1].headers.has("X-Table-Client-Token"), false);
});
