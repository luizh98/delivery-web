import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function load(path) {
  const loaded = { exports: {} };
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module: loaded, exports: loaded.exports });
  return loaded.exports;
}
const { statusLabel } = load("../../utils/format.ts");
const { getTrackingSteps, getTrackingStatus, getStatusPresentation } = load("../../views/OrderTracking/status.ts");
const source = readFileSync(new URL("./index.tsx", import.meta.url), "utf8");
const fn = source.slice(source.indexOf("function getNextOrderStatus("), source.indexOf("function formatReceivedAgo("));
const loaded = { exports: {} };
runInNewContext(ts.transpileModule(`${fn}\nexports.next = getNextOrderStatus;`, {}).outputText, { exports: loaded.exports });

const filterFn = source.slice(source.indexOf("function getOrderFilterStatus("), source.indexOf("function getNextOrderStatus("));
runInNewContext(ts.transpileModule(`${filterFn}\nexports.filter = getOrderFilterStatus;`, {}).outputText, { exports: loaded.exports });

test("pickup labels and progression retain READY and skip dispatch", () => {
  for (const [current, next] of [["RECEIVED", "CONFIRMED"], ["CONFIRMED", "PREPARING"], ["PREPARING", "READY"], ["READY", "COMPLETED"], ["OUT_FOR_DELIVERY", "COMPLETED"], ["COMPLETED", null], ["CANCELED", null]]) {
    assert.equal(loaded.exports.next({ status: current, deliveryType: "PICKUP" }), next);
  }
  assert.equal(statusLabel("READY", "PICKUP"), "Pronto para retirada");
  assert.equal(statusLabel("COMPLETED", "PICKUP"), "Concluido");
  assert.equal(statusLabel("READY", "DELIVERY"), "Pronto");
  assert.equal(statusLabel("OUT_FOR_DELIVERY", "DELIVERY"), "Saiu para entrega");
  assert.equal(loaded.exports.next({ status: "READY", deliveryType: "DELIVERY" }), "OUT_FOR_DELIVERY");
  assert.equal(statusLabel("READY", "TABLE"), "Pronto para servir");
  assert.equal(loaded.exports.next({ status: "READY", deliveryType: "TABLE" }), "COMPLETED");
  assert.equal(loaded.exports.filter({ status: "OUT_FOR_DELIVERY", deliveryType: "PICKUP" }), "READY");
  assert.equal(loaded.exports.filter({ status: "OUT_FOR_DELIVERY", deliveryType: "DELIVERY" }), "OUT_FOR_DELIVERY");
});

test("tracking handles pickup READY and legacy dispatch without affecting delivery or tables", () => {
  for (const status of ["READY", "OUT_FOR_DELIVERY"]) {
    assert.equal(getTrackingStatus(status, "PICKUP"), "READY");
    assert.equal(getStatusPresentation(status, "PICKUP").title, "Pronto para retirada");
    assert.equal(statusLabel(status, "PICKUP"), "Pronto para retirada");
  }
  assert.equal(getStatusPresentation("COMPLETED", "PICKUP").title, "Pedido retirado");
  assert.equal(getTrackingStatus("READY", "DELIVERY"), "PREPARING");
  assert.equal(getStatusPresentation("OUT_FOR_DELIVERY", "DELIVERY").title, "Pedido saiu para entrega");
  assert.equal(getStatusPresentation("READY", "TABLE").title, "Pronto para servir");
  assert.equal(getTrackingSteps("PICKUP").some((step) => step.status === "OUT_FOR_DELIVERY"), false);
});
