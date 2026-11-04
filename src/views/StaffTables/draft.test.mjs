import test from "node:test";
import assert from "node:assert/strict";
import { draftItemTotal, normalizeTablePhone, validateDraftItem } from "./draft.ts";

const product = { priceCents: 2500, salePriceCents: 2000, optionGroups: [{ id: "side", name: "Acompanhamento", required: true, minSelections: 1, maxSelections: 1, items: [{ id: "fries", name: "Batata", active: true, priceCents: 500 }] }] };
const item = { product, quantity: 2, options: [{ groupId: "side", itemId: "fries" }], observations: "Sem sal" };
test("round uses promotional unit price, extras and quantity in cents", () => assert.equal(draftItemTotal(item), 5000));
test("required options block incomplete item", () => assert.match(validateDraftItem({ ...item, options: [] }), /Acompanhamento/));
test("quantity accepts integers only within limits", () => {
  for (const quantity of [0, -1, 1.5, NaN, 1000]) assert.match(validateDraftItem({ ...item, quantity }), /quantidade/);
  assert.equal(validateDraftItem(item), "");
});

test("table contact accepts landline and mobile with DDD", () => {
  for (const value of ["(11) 98888-7777", "+55 (11) 98888-7777", "5511988887777"]) assert.equal(normalizeTablePhone(value), "11988887777");
  assert.equal(normalizeTablePhone("(55) 3333-4444"), "5533334444");
  for (const value of ["", "99999-9999", "11999999999999"]) assert.equal(normalizeTablePhone(value), "");
});
