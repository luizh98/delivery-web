import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire("C:/Users/lhsan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = require("playwright");
const base = "https://dev-terraco-canecao.flyfoods.com.br";
assert.ok(process.env.STAGING_QA_EMAIL && process.env.STAGING_QA_PASSWORD, "QA credentials must be provided through environment");
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const login = await context.request.post(`${base}/api/auth/login`, { data: { identifier: process.env.STAGING_QA_EMAIL, password: process.env.STAGING_QA_PASSWORD } });
  assert.equal(login.status(), 200, "staging login failed");
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/admin/catalog/upsell`);
  await page.getByRole("link", { name: "Ver resultados" }).click();
  await page.getByRole("heading", { name: "Resultado dos upsells", exact: true }).waitFor();

  await page.getByLabel("Período", { exact: true }).selectOption("custom");
  const calendar = page.getByRole("dialog", { name: "Período personalizado" });
  await calendar.waitFor();
  for (let i = 0; i < 9; i++) await calendar.locator(".rdp-button_previous").click();
  await calendar.locator(".rdp-day_button").filter({ hasText: /^1$/ }).click();
  for (let i = 0; i < 9; i++) await calendar.locator(".rdp-button_next").click();
  await calendar.locator(".rdp-day_button").filter({ hasText: /^14$/ }).click();
  const reportResponse = page.waitForResponse((response) => response.url().includes("/api/backend/admin/upsell-report?") && response.url().includes("startDate=2026-01-01"));
  await page.getByRole("button", { name: "Aplicar período", exact: true }).click();
  const response = await reportResponse;
  assert.equal(response.status(), 200);
  const data = await response.json();
  assert.equal(data.series.reduce((sum, day) => sum + day.revenueCents, 0), data.summary.revenueCents, "daily series must reconcile with summary");
  await page.getByRole("heading", { name: "Upsells mais vendidos" }).waitFor();
  assert.equal(await page.getByRole("region", { name: /Detalhes de upsells/ }).locator("tbody tr").count(), Math.min(10, data.items.length));
  const daily = page.getByText("Ver valores por dia", { exact: true });
  await daily.click();
  assert.equal(await page.getByRole("table", { name: /Valor vendido em upsells por dia/ }).locator("tbody tr").count(), data.series.length);
  await daily.click();
  const review = path.join(process.cwd(), ".impeccable/review/upsell-results");
  await mkdir(review, { recursive: true });
  for (const [name, width, height] of [["staging-desktop", 1440, 1000], ["staging-mobile", 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} overflow`);
    await page.screenshot({ path: path.join(review, `${name}.png`), fullPage: true });
  }
  for (const route of ["/admin/analytics", "/admin/orders", "/admin/kitchen", "/admin/deliveries"]) {
    await page.goto(base + route);
    await page.getByLabel("Período", { exact: true }).selectOption("last7");
    await page.getByLabel("Período", { exact: true }).selectOption("custom");
    await page.getByRole("dialog", { name: "Período personalizado" }).waitFor();
    await page.getByRole("dialog", { name: "Período personalizado" }).getByRole("button", { name: "Cancelar", exact: true }).click();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflow`);
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ staging: "passed", reportStatus: response.status(), combinations: data.items.length, dailyRows: data.series.length, desktopMobileOverflow: false, runtimeErrors: 0 }));
} finally {
  await browser.close();
}
