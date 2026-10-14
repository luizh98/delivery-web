import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire("C:/Users/lhsan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json");
const { chromium } = require("playwright");
const base = "https://flyfoods.com.br";
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  for (const route of ["/", "/admin/login", "/politicas-e-diretrizes"]) {
    const response = await context.request.get(base + route);
    assert.equal(response.status(), 200, `${route} must remain available`);
  }
  const login = await context.request.post(base + "/api/auth/login", { data: { identifier: process.env.RELEASE_QA_EMAIL, password: process.env.RELEASE_QA_PASSWORD } });
  assert.equal(login.status(), 200, "production login failed");
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const pending = page.waitForResponse((response) => response.url().includes("/api/backend/admin/upsell-report?"));
  await page.goto(base + "/admin/catalog/upsell/results");
  await page.getByRole("heading", { name: "Resultado dos upsells", exact: true }).waitFor();
  const response = await pending;
  assert.equal(response.status(), 200);
  const data = await response.json();
  assert.equal(data.items.reduce((total, row) => total + row.revenueCents, 0), data.summary.revenueCents);
  assert.equal(data.series.reduce((total, day) => total + day.revenueCents, 0), data.summary.revenueCents);
  await page.getByLabel("Período", { exact: true }).selectOption("last7");
  await page.getByLabel("Período", { exact: true }).selectOption("custom");
  const dialog = page.getByRole("dialog", { name: "Período personalizado" });
  await dialog.waitFor();
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  const directory = path.join(process.cwd(), ".impeccable/review/release-main-20261014");
  await mkdir(directory, { recursive: true });
  for (const [name, width, height] of [["production-desktop", 1440, 1000], ["production-mobile", 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} overflow`);
    await page.screenshot({ path: path.join(directory, name + ".png"), fullPage: true });
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ production: "passed", publicRoutes: 3, reportStatus: 200, totalsReconciled: true, desktopMobileOverflow: false, runtimeErrors: 0 }));
} finally { await browser.close(); }
