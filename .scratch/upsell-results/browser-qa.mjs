import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire("C:/Users/lhsan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = require("playwright");
const root = process.cwd();
const review = path.join(root, ".impeccable/review/upsell-results");
await mkdir(review, { recursive: true });
let state = "sales";
const allItems = Array.from({ length: 12 }, (_, i) => ({
  campaignId: i < 2 ? "c1" : "c2", campaignName: i < 2 ? "Bebidas no carrinho" : "Complete seu pedido",
  productId: `p${i}`, productName: i === 0 ? "Refrigerante artesanal de frutas vermelhas — garrafa de 600 ml" : `Produto ilustrativo ${i + 1}`,
  units: 30 - i, orders: 10, originalCents: (30 - i) * 1000 + i * 2500, discountCents: (30 - i) * 200,
  revenueCents: (30 - i) * 800 + i * 2500, missingOriginalPriceUnits: 0,
}));

const mock = createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  response.setHeader("Content-Type", "application/json");
  if (url.pathname === "/api/auth/me") {
    response.end(JSON.stringify({ id: "qa", tenantId: "qa", tenantSlug: "qa", email: "qa@example.test", roles: ["ADMIN"] }));
  } else if (url.pathname === "/api/public/restaurant/config") {
    response.end(JSON.stringify({ name: "Validação — dados ilustrativos", open: true, theme: { primaryColor: "#1d4ed8", secondaryColor: "#172554" } }));
  } else if (url.pathname === "/api/admin/upsell-report") {
    if (state === "error") { response.statusCode = 500; response.end("{}"); return; }
    const items = state === "empty" ? [] : allItems.filter((item) => !url.searchParams.get("campaignId") || item.campaignId === url.searchParams.get("campaignId")).map((item) => ({ ...item, missingOriginalPriceUnits: state === "legacy" ? 1 : 0 }));
    const summary = items.reduce((sum, item) => { for (const key of ["units", "originalCents", "discountCents", "revenueCents", "missingOriginalPriceUnits"]) sum[key] += item[key]; return sum; }, { units: 0, orders: items.length ? 20 : 0, originalCents: 0, discountCents: 0, revenueCents: 0, missingOriginalPriceUnits: 0, completedOrders: 80, participationPercent: items.length ? 25 : 0, averagePerOrderCents: 0, canceledOrders: 2, canceledRevenueCents: 1600, pendingOrders: 1 });
    summary.averagePerOrderCents = Math.round(summary.revenueCents / Math.max(summary.orders, 1));
    const start = new Date(`${url.searchParams.get("startDate")}T12:00:00Z`);
    const end = new Date(`${url.searchParams.get("endDate")}T12:00:00Z`);
    const series = [];
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) series.push({ key: d.toISOString().slice(0, 10), label: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`, revenueCents: items.length ? 5000 + series.length * 1100 : 0, orders: 1, averageTicketCents: 0, discountsCents: 0, deliveryFeesCents: 0 });
    const body = JSON.stringify({ summary, items, campaigns: [{ id: "c1", name: "Bebidas no carrinho" }, { id: "c2", name: "Complete seu pedido" }], series });
    if (state === "slow") setTimeout(() => response.end(body), 1500); else response.end(body);
  } else if (url.pathname === "/api/admin/order-events") {
    response.setHeader("Content-Type", "text/event-stream"); response.write(": fixture\n\n");
  } else { response.end("[]"); }
});
await new Promise((resolve, reject) => { mock.once("error", reject); mock.listen(18089, "127.0.0.1", resolve); });
const next = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "-p", "3108"], { cwd: root, env: { ...process.env, NEXT_PUBLIC_API_URL: "http://127.0.0.1:18089", NEXT_PUBLIC_DEFAULT_TENANT_SLUG: "qa" }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
let logs = "";
next.stdout.on("data", (chunk) => { logs += chunk; });
next.stderr.on("data", (chunk) => { logs += chunk; });
let browser;
try {
  let ready = false;
  for (let i = 0; i < 60; i++) { try { const r = await fetch("http://127.0.0.1:3108/admin/login"); if (r.ok) { ready = true; break; } } catch {} await new Promise((resolve) => setTimeout(resolve, 500)); }
  assert.ok(ready, `Next did not start: ${logs.slice(-2000)}`);
  browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addCookies([{ name: "delivery_admin_token", value: "fixture-token", url: "http://127.0.0.1:3108" }]);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:3108/admin/catalog/upsell/results");
  await page.getByRole("heading", { name: "Upsells mais vendidos" }).waitFor();
  const financialRows = page.getByRole("region", { name: "Detalhes de upsells; role horizontalmente para ver todas as colunas", exact: true }).locator("tbody tr");
  assert.equal(await financialRows.count(), 10);
  await page.getByRole("button", { name: "Próxima", exact: true }).click();
  assert.equal(await financialRows.count(), 2);
  await page.getByRole("button", { name: "Valor vendido", exact: true }).click();
  assert.equal(await financialRows.count(), 10);
  assert.match(await page.getByRole("list", { name: "Ranking por valor vendido" }).locator("li").first().innerText(), /Produto ilustrativo 12/);
  await page.getByRole("button", { name: "Unidades", exact: true }).click();
  await page.getByLabel("Data inicial").fill("2026-10-08");
  await page.getByLabel("Data final").fill("2026-10-14");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await page.getByRole("heading", { name: "Upsells mais vendidos" }).waitFor();
  const dailyValues = page.getByRole("region", { name: "Valores de upsell por dia", exact: true });
  assert.equal(await dailyValues.isVisible(), false, "daily table starts collapsed");
  await page.getByText("Ver valores por dia", { exact: true }).focus();
  await page.keyboard.press("Enter");
  await dailyValues.waitFor();
  assert.equal(await dailyValues.locator("tbody tr").count(), 7);
  assert.match(await dailyValues.locator("tbody tr").first().innerText(), /08\/10\/2026\s+R\$\s*50,00/);
  assert.match(await dailyValues.locator("tbody tr").last().innerText(), /14\/10\/2026\s+R\$\s*116,00/);
  for (const [name, width, height] of [["desktop", 1440, 1000], ["mobile", 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
    await page.screenshot({ path: path.join(review, `${name}.png`), fullPage: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} page overflow`);
  }
  await page.getByLabel("Campanha", { exact: true }).selectOption("c1");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await page.getByRole("heading", { name: "Upsells mais vendidos" }).waitFor();
  assert.equal(await financialRows.count(), 2);
  state = "legacy";
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await page.getByText(/unidades sem preço original registrado/).waitFor();
  assert.equal(await page.locator("dl dd").first().innerText(), "—");
  state = "empty";
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await page.getByRole("heading", { name: "Nenhuma venda de upsell neste período" }).waitFor();
  state = "error";
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await page.getByRole("button", { name: "Tentar novamente" }).waitFor();
  state = "slow";
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await page.getByText("Carregando resultado dos upsells…").waitFor();
  assert.equal(await page.locator("dl").count(), 0, "loading must clear old financial totals");
  await page.getByRole("heading", { name: "Upsells mais vendidos" }).waitFor();
  await page.getByLabel("Data inicial").fill("2026-10-15");
  await page.getByLabel("Data final").fill("2026-10-14");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await page.getByText("A data final deve ser igual ou posterior à inicial.").waitFor();
  assert.deepEqual(errors, [], "browser runtime errors");
  console.log("PASS: pagination, sorting, campaign/date filters, daily values keyboard expansion, legacy, empty, error/retry, loading, validation and desktop/mobile overflow.");
  console.log(`Screenshots: ${review}`);
} finally {
  await browser?.close();
  next.kill();
  mock.closeAllConnections();
  await new Promise((resolve) => mock.close(resolve));
}
