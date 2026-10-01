import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const origin = process.env.SMOKE_ORIGIN ?? "http://terraco-canecao.localhost:3106";
const expected = await readFile("public/landing-pages/terraco-canecao/index.html", "utf8");

const landing = await fetch(new URL("/links?utm_source=qa", origin), {
  signal: AbortSignal.timeout(15000),
});
assert.equal(landing.status, 200);
assert.match(landing.headers.get("content-type") ?? "", /text\/html/);
const normalizeLines = (value) => value.replaceAll("\r\n", "\n");
assert.ok(normalizeLines(await landing.text()) === normalizeLines(expected),
  "/links deve servir o HTML original adaptado");
assert.match(expected, /var LINK_CARDAPIO = '\/';/);

for (const asset of ["logo.v1.webp", "batata-costela.v1.webp"]) {
  const response = await fetch(new URL(`/landing-pages/terraco-canecao/${asset}`, origin), {
    method: "HEAD",
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200, asset);
  assert.match(response.headers.get("content-type") ?? "", /image\/webp/, asset);
}

const menu = await fetch(new URL("/", origin), { signal: AbortSignal.timeout(15000) });
assert.equal(menu.status, 200);
console.log(`PASS ${origin}/links: HTML original, imagens e cardápio`);
