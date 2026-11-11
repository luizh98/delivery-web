import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("./index.tsx", import.meta.url), "utf8");
const ast = ts.createSourceFile("index.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const callbacks = {};
function visit(node) {
  if (ts.isVariableDeclaration(node) && ["matchingOrders", "filteredOrders"].includes(node.name.getText(ast))) {
    callbacks[node.name.getText(ast)] = node.initializer.arguments[0].getText(ast);
  }
  if (ts.isFunctionDeclaration(node) && ["normalizeSearch", "getReceivedAt", "localDateKey", "getOrderFilterStatus"].includes(node.name?.text)) {
    callbacks[node.name.text] = node.getText(ast);
  }
  ts.forEachChild(node, visit);
}
visit(ast);
const compiled = ts.transpileModule(`${Object.entries(callbacks).filter(([name]) => !name.endsWith("Orders")).map(([, code]) => code).join("\n")}
  const matchingOrders = (${callbacks.matchingOrders})();
  result = { matchingOrders, filteredOrders: (${callbacks.filteredOrders})() };`, {
  compilerOptions: { target: ts.ScriptTarget.ES2020 },
}).outputText;

const orders = ["DELIVERY", "PICKUP", "TABLE"].flatMap((deliveryType) =>
  ["RECEIVED", "CANCELED"].map((status) => ({
    id: `${deliveryType}-${status}`, deliveryType, status,
    customer: { name: "João", phone: "11999999999" },
    createdAt: "2026-11-11T15:00:00Z", statusHistory: [],
  })),
);
function filter(options = {}) {
  const context = {
    orders, deliveryTypeFilter: "", search: "", startDate: "2026-11-11", endDate: "2026-11-11", statusFilter: null,
    dateKey: (date) => date.toISOString().slice(0, 10), ...options,
  };
  runInNewContext(compiled, context);
  return JSON.parse(JSON.stringify(context.result));
}

test("all types default to visible non-canceled orders; each type scopes cards and status counts", () => {
  assert.equal(filter().matchingOrders.length, 6);
  assert.equal(filter().filteredOrders.length, 3);
  for (const deliveryTypeFilter of ["DELIVERY", "PICKUP", "TABLE"]) {
    const result = filter({ deliveryTypeFilter });
    assert.equal(result.matchingOrders.length, 2);
    assert.equal(result.filteredOrders.length, 1);
    assert.ok(result.matchingOrders.every((order) => order.deliveryType === deliveryTypeFilter));
    assert.equal(filter({ deliveryTypeFilter, statusFilter: "CANCELED" }).filteredOrders[0].status, "CANCELED");
  }
});

test("type combines with search and date range without discarding other types from state", () => {
  assert.equal(filter({ deliveryTypeFilter: "TABLE", search: "joao" }).filteredOrders.length, 1);
  assert.equal(filter({ deliveryTypeFilter: "TABLE", search: "absent" }).filteredOrders.length, 0);
  assert.equal(filter({ deliveryTypeFilter: "PICKUP", startDate: "2026-11-12" }).filteredOrders.length, 0);
  assert.equal(filter({ deliveryTypeFilter: "DELIVERY", endDate: "2026-11-10" }).filteredOrders.length, 0);
  assert.equal(filter().filteredOrders.length, 3);
});
