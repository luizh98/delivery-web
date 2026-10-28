import test from "node:test";
import assert from "node:assert/strict";
import { stalledOrderHours } from "./stalledOrders.ts";

const now = Date.parse("2026-10-28T12:00:00Z");
const old = "2026-10-26T12:00:00Z";
const recent = "2026-10-28T11:00:00Z";
const order = { status: "PREPARING", createdAt: old, updatedAt: recent, statusHistory: [{ status: "PREPARING", changedAt: old }] };

test("stalled uses current status history, not unrelated updates or order age", () => {
  assert.equal(stalledOrderHours(order, now), 48);
  assert.equal(stalledOrderHours({ ...order, statusHistory: [...order.statusHistory, { status: "PREPARING", changedAt: recent }] }, now), null);
});

test("stalled strictly exceeds 24h and excludes final statuses", () => {
  assert.equal(stalledOrderHours(order, Date.parse(old) + 86_400_000), null);
  assert.equal(stalledOrderHours(order, Date.parse(old) + 86_400_001), 24);
  for (const status of ["COMPLETED", "CANCELED"]) assert.equal(stalledOrderHours({ ...order, status }, now), null);
  for (const status of ["RECEIVED", "CONFIRMED", "READY", "OUT_FOR_DELIVERY"]) {
    assert.equal(stalledOrderHours({ ...order, status, statusHistory: [{ status, changedAt: old }] }, now), 48);
  }
});

test("legacy orders fall back to creation; invalid and future dates do not trigger alerts", () => {
  assert.equal(stalledOrderHours({ ...order, statusHistory: [] }, now), 48);
  for (const createdAt of [undefined, "invalid", "2026-10-29T12:00:00Z"]) {
    assert.equal(stalledOrderHours({ ...order, createdAt, statusHistory: [] }, now), null);
  }
});
