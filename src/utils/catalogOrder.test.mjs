import assert from "node:assert/strict";
import test from "node:test";
import { catalogOrderChanges, sortCatalogItems } from "./catalogOrder.ts";

const apply = (items, changes) => sortCatalogItems(items.map((item) => changes.find((change) => change.id === item.id) ?? item));

test("moves in both directions, including duplicate order numbers, preserving product data", () => {
  const items = [
    { id: "a", name: "A", sortOrder: 0, priceCents: 900, imageUrl: "image", optionGroups: [{ id: "options" }] },
    { id: "b", name: "B", sortOrder: 0, priceCents: 700 },
    { id: "c", name: "C", sortOrder: 0, priceCents: 800 },
  ];
  const moved = apply(items, catalogOrderChanges(items, "b", -1));
  assert.deepEqual(moved.map((item) => item.id), ["b", "a", "c"]);
  assert.deepEqual(apply(moved, catalogOrderChanges(moved, "b", 1)).map((item) => item.id), ["a", "b", "c"]);
  assert.deepEqual(moved.find((item) => item.id === "a"), { ...items[0], sortOrder: 1 });
  assert.equal(items[0].sortOrder, 0);
});

test("boundaries and unknown IDs do not write; sparse orders become a predictable sequence", () => {
  const items = [{ id: "a", name: "A", sortOrder: -10 }, { id: "b", name: "B", sortOrder: 80 }];
  assert.deepEqual(catalogOrderChanges(items, "a", -1), []);
  assert.deepEqual(catalogOrderChanges(items, "b", 1), []);
  assert.deepEqual(catalogOrderChanges(items, "missing", 1), []);
  const moved = apply(items, catalogOrderChanges(items, "a", 1));
  assert.deepEqual(moved.map((item) => [item.id, item.sortOrder]), [["b", 0], ["a", 1]]);
});
