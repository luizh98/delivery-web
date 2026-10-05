import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const compiled = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const loadedModule = { exports: {} };
  runInNewContext(compiled, {
    module: loadedModule, exports: loadedModule.exports, URL, console,
    require: (id) => {
      if (id === "@/components/AdminOrderSoundNotifier") return { useAdminOrderSound: () => ({ soundEnabled: false, setSoundEnabled() {} }) };
      if (id === "@/components/ToastProvider") return { useToast: () => ({ showToast() {} }) };
      if (id === "@/services/api/client") return { clientApi() { throw new Error("Rendering must not call API"); } };
      if (id.startsWith(".") || id.startsWith("@/") || id === "styles") {
        const base = id === "styles" ? path.join(src, "styles") : id.startsWith("@/") ? path.join(src, id.slice(2)) : path.resolve(path.dirname(file), id);
        return load([base + ".tsx", base + ".ts", path.join(base, "index.tsx")].find(existsSync));
      }
      return require(id);
    },
  });
  cache.set(file, loadedModule.exports);
  return loadedModule.exports;
}

export function renderSettings(config = null) {
  const { SettingsForm } = load(path.join(src, "views/AdminSettings/SettingsForm.tsx"));
  return renderToStaticMarkup(React.createElement(SettingsForm, { initialConfig: config }));
}

test("WhatsApp configuration stays inside orders and never renders a saved token", () => {
  const html = renderSettings({ whatsappIntegration: { phoneNumberId: "123456789", apiVersion: "v25.0", language: "pt_BR", tokenConfigured: true, templates: { production: "pedido_producao", delivery: "pedido_entrega", completed: "pedido_concluido" }, accessToken: "must-never-render" } });
  const section = html.slice(html.indexOf('<details id="orders"')).split("</details>")[0];
  for (const field of ["whatsappPhoneNumberId", "whatsappAccessToken", "whatsappApiVersion", "whatsappProductionTemplate", "whatsappDeliveryTemplate", "whatsappCompletedTemplate"]) assert.ok(section.includes(`name="${field}"`), field);
  assert.ok(section.includes("Token configurado"));
  assert.ok(section.includes('type="password"'));
  assert.ok(!html.includes("must-never-render"));
  assert.equal((html.match(/<details /g) ?? []).length, 6);
});

test("WhatsApp first setup requires token; saved setup permits blank token", () => {
  const { whatsappSettingsSchema } = load(path.join(src, "views/AdminSettings/whatsappSettings.ts"));
  const values = { whatsappPhoneNumberId: "123456789", whatsappAccessToken: "", whatsappApiVersion: "v25.0", whatsappProductionTemplate: "pedido_producao", whatsappDeliveryTemplate: "pedido_entrega", whatsappCompletedTemplate: "pedido_concluido", tokenConfigured: false };
  assert.equal(whatsappSettingsSchema.safeParse(values).success, false);
  assert.equal(whatsappSettingsSchema.safeParse({ ...values, tokenConfigured: true }).success, true);
  assert.equal(whatsappSettingsSchema.safeParse({ ...values, whatsappAccessToken: "fake-token" }).success, true);
  for (const patch of [{ whatsappPhoneNumberId: "abc" }, { whatsappApiVersion: "v25.0/path" }, { whatsappProductionTemplate: "Nome com espaço" }, { whatsappAccessToken: "fake\nheader" }]) assert.equal(whatsappSettingsSchema.safeParse({ ...values, tokenConfigured: true, ...patch }).success, false);
});

test("settings preserves editable fields, media, sound and operating hours", () => {
  const html = renderSettings({ name: "Restaurante de teste", deliverySettings: { enabled: true, pricingMode: "PER_KM", maxDistanceKm: 5, pricePerKmCents: 200 } });
  for (const name of ["name", "whatsapp", "menuDescription", "minimumOrderReais", "primaryColor", "secondaryColor", "street", "number", "neighborhood", "city", "state", "automaticOrderConfirmation", "overdueOrderAlertEnabled", "overdueOrderAlertMinutes", "deliveryEnabled", "pricingMode", "maxDistanceKm", "pricePerKmReais", "freeDeliveryMinimumOrderReais", "freeDeliveryDays", "deliveryOrganizationStrategy", "metaPixelId", "metaPixelEnabled"]) assert.ok(html.includes(`name="${name}"`), name);
  assert.equal((html.match(/type="file"/g) ?? []).length, 2);
  assert.equal((html.match(/name="freeDeliveryDays"/g) ?? []).length, 7);
  for (const text of ["Adicionar feriado", "Segunda", "Domingo", "alerta sonoro", "Salvar"]) assert.ok(html.includes(text), text);
});

test("settings preserves grouped routes, distance ranges and holiday editing", () => {
  const html = renderSettings({ deliveryOrganization: { strategy: "PROXIMITY", maxOrdersPerRoute: 3, waitToleranceMinutes: 5, maxDistanceKm: 2 }, deliverySettings: { enabled: true, pricingMode: "RANGE", deliveryFeeRanges: [{ fromDistanceKm: 0, toDistanceKm: null, feeCents: 600 }] }, holidayHours: [{ date: "2026-12-25", name: "Natal", closed: false, openTime: "10:00", closeTime: "18:00" }] });
  for (const name of ["deliveryMaxOrdersPerRoute", "deliveryWaitToleranceMinutes", "deliveryMaxDistanceKm", "deliveryFeeRanges.0.fromDistanceKm", "deliveryFeeRanges.0.toDistanceKm", "deliveryFeeRanges.0.feeReais"]) assert.ok(html.includes(`name="${name}"`), name);
  for (const text of ["Adicionar faixa", "Remover faixa 1", "Sem limite", "Natal", "Remover feriado 1"]) assert.ok(html.includes(text), text);
});

test("related settings share six independently expandable sections", () => {
  const html = renderSettings();
  assert.equal((html.match(/<details /g) ?? []).length, 6);
  for (const [id, contents] of [
    ["restaurant", ["name", "whatsapp", "street", "city"]],
    ["appearance", ["menuDescription", "primaryColor", "secondaryColor", "Escolher logo", "Escolher banner"]],
    ["orders", ["minimumOrderReais", "automaticOrderConfirmation", "overdueOrderAlertMinutes"]],
    ["delivery", ["pricingMode", "deliveryOrganizationStrategy"]],
    ["operating-hours", ["Horário semanal", "Adicionar feriado"]],
    ["marketing", ["metaPixelId", "metaPixelEnabled"]],
  ]) {
    const section = html.slice(html.indexOf(`<details id="${id}"`)).split("</details>")[0];
    for (const content of contents) assert.ok(section.includes(content), `${id}: ${content}`);
  }
});

test("WhatsApp status toggle defaults off and loads saved tenant setting", () => {
  const off = renderSettings();
  assert.match(off, /name="whatsappNotificationsEnabled"/);
  assert.doesNotMatch(off, /name="whatsappNotificationsEnabled"[^>]*checked/);
  const on = renderSettings({ whatsappNotificationsEnabled: true });
  assert.match(on, /name="whatsappNotificationsEnabled"[^>]*checked/);
  const orders = on.slice(on.indexOf('<details id="orders"')).split("</details>")[0];
  assert.ok(orders.includes("Enviar status dos pedidos por WhatsApp"));
});
