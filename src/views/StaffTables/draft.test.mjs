import test from "node:test";
import assert from "node:assert/strict";
import { draftItemTotal, validateDraftItem } from "./draft.ts";

const product = { priceCents: 2500, salePriceCents: 2000, optionGroups: [{ id: "side", name: "Acompanhamento", required: true, minSelections: 1, maxSelections: 1, items: [{ id: "fries", name: "Batata", active: true, priceCents: 500 }] }] };
const item = { product, quantity: 2, options: [{ groupId: "side", itemId: "fries" }], observations: "Sem sal" };
test("round uses promotional unit price, extras and quantity in cents", () => assert.equal(draftItemTotal(item), 5000));
test("required options block incomplete item", () => assert.match(validateDraftItem({ ...item, options: [] }), /Acompanhamento/));
test("quantity accepts integers only within limits", () => {
  for (const quantity of [0, -1, 1.5, NaN, 1000]) assert.match(validateDraftItem({ ...item, quantity }), /quantidade/);
  assert.equal(validateDraftItem(item), "");
});
