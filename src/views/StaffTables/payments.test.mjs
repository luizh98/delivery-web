import assert from "node:assert/strict";
import test from "node:test";
import { paymentLines, paymentQuote } from "./paymentCalculation.ts";

const account = () => ({
  session: { id: "visit", status: "CLOSING", payments: [] },
  totals: { consumptionCents: 6002, serviceFeeBasisPoints: 1000, serviceFeeCents: 600, totalCents: 6602 },
  orders: [{ id: "food", status: "READY", items: [{ name: "Batata", quantity: 1, totalCents: 1000 }, { name: "Hambúrguer", quantity: 2, totalCents: 4001 }, { name: "Refrigerante", quantity: 2, totalCents: 1001 }] }],
});

test("different people select quantities with cumulative fee and discounted odd cents", () => {
  const value = account();
  const first = paymentQuote(value, "ITEMS", 0, { "food:0": 1, "food:1": 1 });
  assert.equal(first.valid, true);
  assert.equal(first.amountCents, 3300);
  value.session.payments.push({ ...first, mode: "ITEMS", splitCount: 0 });
  assert.equal(paymentLines(value)[1].remaining, 1);
  assert.equal(paymentQuote(value, "ITEMS", 0, { "food:0": 1 }).valid, false);
  const second = paymentQuote(value, "ITEMS", 0, { "food:1": 1, "food:2": 2 });
  assert.equal(second.valid, true);
  assert.equal(second.amountCents, 3302);
  value.session.payments.push({ ...second, mode: "ITEMS", splitCount: 0 });
  assert.equal(paymentQuote(value, "ITEMS", 0, {}).balanceCents, 0);
});

test("equal parts distribute cents and cannot switch division after receiving", () => {
  const value = account();
  value.totals = { consumptionCents: 101, serviceFeeBasisPoints: 0, serviceFeeCents: 0, totalCents: 101 };
  for (const amount of [34, 34, 33]) {
    const quote = paymentQuote(value, "EQUAL", 3, {});
    assert.equal(quote.valid, true);
    assert.equal(quote.amountCents, amount);
    value.session.payments.push({ ...quote, mode: "EQUAL", splitCount: 3 });
    assert.equal(paymentQuote(value, "EQUAL", 2, {}).valid, false);
    assert.equal(paymentQuote(value, "ITEMS", 0, { "food:0": 1 }).valid, false);
  }
  assert.equal(paymentQuote(value, "EQUAL", 3, {}).balanceCents, 0);
  assert.equal(paymentQuote(value, "EQUAL", 3, {}).valid, false);
});

test("invalid quantity, stale price, canceled items and missing totals block receiving", () => {
  const value = account();
  for (const quantity of [-1, 1.5, 99, NaN]) assert.equal(paymentQuote(value, "ITEMS", 0, { "food:0": quantity }).valid, false);
  for (const count of [0, -1, 1.5, NaN, 1000]) assert.equal(paymentQuote(value, "EQUAL", count, {}).valid, false);
  assert.equal(paymentQuote(value, "ITEMS", 0, {}).valid, false);
  value.orders[0].status = "CANCELED";
  assert.equal(paymentLines(value).length, 0);
  assert.equal(paymentQuote(value, "ITEMS", 0, { "food:0": 1 }).valid, false);
  value.totals = undefined;
  assert.equal(paymentQuote(value, "EQUAL", 2, {}).valid, false);
});
