import assert from "node:assert/strict";

const origin = process.env.SMOKE_ORIGIN ?? "http://127.0.0.1:3102";
const serverPort = new URL(origin).port;

async function page(host, pathname, headers = {}) {
  const response = await fetch(`http://${host.split(":")[0]}:${serverPort}${pathname}`, {
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  return { status: response.status, html: await response.text() };
}

const a = await page("lp-test-a.localhost:3102", "/links?utm_source=instagram%20bio&next=https://evil.example", { "x-tenant-slug": "lp-test-b" });
const b = await page("lp-test-b.localhost:3102", "/links");
assert.equal(a.status, 200);
assert.equal(b.status, 200);
assert.match(a.html, /LP Test A/);
assert.doesNotMatch(a.html, /LP Test B/);
assert.match(b.html, /LP Test B/);
assert.doesNotMatch(b.html, /LP Test A/);
assert.match(a.html, /href="\/\?utm_source=instagram\+bio"/);
assert.match(b.html, /href="\/"/);
assert.match(a.html, /https:\/\/maps\.example\.com\/a/);
assert.doesNotMatch(b.html, /maps\.example\.com/);
assert.match(a.html, /rel="noopener noreferrer"/);
assert.match(a.html, /og:image/);
assert.match(a.html, /lp-test-a\/social\.v1\.png/);
assert.match(b.html, /lp-test-b\/social\.v1\.png/);
assert.equal((await page("missing.localhost:3102", "/links")).status, 404);
assert.equal((await page("localhost:3102", "/links")).status, 404);
assert.equal((await page("lp-test-a.localhost:3102", "/")).status, 200);
console.log("PASS: isolamento, header forjado, CTA/UTM, opcionais, metadata, 404 e / cardápio");
