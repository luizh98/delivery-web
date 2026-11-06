import assert from "node:assert/strict";
import { test } from "node:test";
import { errorLabel, logQuery, notificationStatus, orderNumber } from "./format.ts";

test("aceite não vira confirmação de entrega; fatos de leitura sobrevivem à falha tardia", () => {
  assert.match(notificationStatus({ status: "accepted", delivery: null }), /sem confirmação de entrega/);
  assert.equal(notificationStatus({ status: "accepted", delivery: { sent: {} } }), "Enviado pela Meta");
  assert.equal(notificationStatus({ status: "accepted", delivery: { delivered: {}, failed: {} } }), "Entregue");
  assert.equal(notificationStatus({ status: "accepted", delivery: { read: {}, failed: {} } }), "Lido");
  assert.equal(notificationStatus({ status: "accepted", delivery: { failed: {} } }), "Falha na entrega");
  assert.equal(errorLabel("template_not_approved"), "Modelo de mensagem não aprovado");
  assert.equal(errorLabel("meta_131026"), "meta_131026");
});

test("consulta preserva número com zeros, período, paginação e timezone", () => {
  const filters = { startDate: "2026-11-05", endDate: "2026-11-05", search: " #050006 ", status: "COMPLETED" };
  const query = new URLSearchParams(logQuery(filters, 2));
  assert.equal(query.get("search"), "#050006");
  assert.equal(query.get("page"), "2");
  assert.equal(query.get("size"), "25");
  assert.equal(query.get("timezone"), Intl.DateTimeFormat().resolvedOptions().timeZone);
  assert.equal(query.get("startDate"), "2026-11-05");
  assert.equal(orderNumber({ orderNumber: "050006", id: "internal-id" }), "050006");
});
