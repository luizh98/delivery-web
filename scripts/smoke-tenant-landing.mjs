import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const slug = process.env.SMOKE_TENANT_SLUG;
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  throw new Error("Informe SMOKE_TENANT_SLUG");
}
if (slug === "terraco-canecao") {
  throw new Error("Terraço usa HTML próprio; execute scripts/smoke-terraco-html.mjs");
}

const origin = process.env.SMOKE_ORIGIN ?? "http://127.0.0.1:3104";
const port = new URL(origin).port;
const config = JSON.parse(await readFile(`public/landing-pages/${slug}/config.json`, "utf8"));

async function page(host, pathname) {
  const response = await fetch(`http://${host}:${port}${pathname}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  return {
    status: response.status,
    html: await response.text(),
    cacheControl: response.headers.get("cache-control") ?? "",
  };
}

const landing = await page(`${slug}.localhost`, "/links?utm_source=instagram&next=ignored");
assert.equal(landing.status, 200);
for (const text of [config.name, config.headline, config.description, config.addressText, config.menuLabel].filter(Boolean)) {
  assert.ok(landing.html.includes(text), `Texto ausente: ${text}`);
}
assert.match(landing.html, /href="\/\?utm_source=instagram"/);
assert.doesNotMatch(landing.html, /href="\/\?[^\"]*next=/, "Parâmetro estranho chegou ao CTA");
for (const url of [config.mapsUrl, config.whatsappUrl, config.systemUrl, ...config.extraLinks.map((link) => link.url)].filter(Boolean)) {
  assert.ok(landing.html.includes(`href="${url.replaceAll("&", "&amp;")}"`), `Destino ausente: ${url}`);
}
assert.ok(landing.html.includes(config.logo.file));
assert.ok(landing.html.includes(config.heroMobile.file));
assert.match(landing.html, /og:image/);
assert.match(landing.cacheControl, /no-store/);
const image = await fetch(`http://${slug}.localhost:${port}/landing-pages/${slug}/${config.logo.file}`, { method: "HEAD" });
assert.equal(image.status, 200);
assert.match(image.headers.get("cache-control") ?? "", /immutable/);
const json = await fetch(`http://${slug}.localhost:${port}/landing-pages/${slug}/config.json`, { method: "HEAD" });
assert.equal(json.status, 200);
assert.match(json.headers.get("cache-control") ?? "", /max-age=0/);
assert.equal((await page(`${slug}.localhost`, "/")).status, 200);
assert.equal((await page("missing.localhost", "/links")).status, 404);
console.log(`PASS ${slug}: conteúdo, links, metadata, CTA, cache, / cardápio e 404`);
console.log(JSON.stringify({
  htmlCache: landing.cacheControl,
  imageCache: image.headers.get("cache-control"),
  configCache: json.headers.get("cache-control"),
}));
