import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("tsx/cjs");
const { auditValue, auditFieldName, auditQuery } = require("./format.ts");

test("audit values distinguish false, null, empty and missing fields", () => {
  assert.equal(auditValue(false, true), "Não");
  assert.equal(auditValue(true, true), "Sim");
  assert.equal(auditValue(null, true), "Sem valor");
  assert.equal(auditValue(null, false), "Não existia");
  assert.equal(auditValue("", true), "Vazio");
  assert.equal(auditValue(0, true), "0");
  assert.match(auditValue({ active: false }, true), /"active": false/);
  assert.equal(auditFieldName("settings.active"), "settings / Ativo");
});

test("audit filters encode values and include the entire local end date", () => {
  const filters = { actor: " Ana+teste@example.com ", collection: "products", documentId: "", action: "UPDATE", status: "", from: "2026-11-01", to: "2026-11-03" };
  const query = new URLSearchParams(auditQuery(filters, 3));
  assert.equal(query.get("page"), "3");
  assert.equal(query.get("size"), "25");
  assert.equal(query.get("actor"), "Ana+teste@example.com");
  assert.equal(query.has("status"), false);
  const start = new Date(query.get("from"));
  const end = new Date(query.get("to"));
  assert.equal(start.getHours(), 0);
  assert.equal(end.getHours(), 23);
  assert.equal(end.getMinutes(), 59);
  assert.equal(end.getMilliseconds(), 999);
});
