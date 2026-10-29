import test from "node:test";
import assert from "node:assert/strict";
import { buildRepeatOrderCartItems } from "./cartItems.ts";

const item = {
  productId: "burger",
  name: "Hambúrguer",
  quantity: 2,
  unitPriceCents: 2500,
  observations: "Sem cebola",
  options: [{ groupId: "extras", groupName: "Extras", itemId: "cheese", itemName: "Queijo", priceCents: 300 }],
  totalCents: 5600,
};

test("repeat order recovers current product image from menu when history has no image", async () => {
  let requests = 0;
  const items = await buildRepeatOrderCartItems({ items: [item] }, async () => {
    requests++;
    return { products: [
      { id: "drink", imageUrl: "/drink.webp" },
      { id: "burger", imageUrl: "/burger.webp", priceCents: 9999 },
    ] };
  }, () => "new-line");

  assert.equal(requests, 1);
  assert.deepEqual(items, [{ ...item, lineId: "new-line", imageUrl: "/burger.webp" }]);
});

test("repeat order uses current image instead of historical image", async () => {
  const [result] = await buildRepeatOrderCartItems(
    { items: [{ ...item, imageUrl: "/old.webp" }] },
    async () => ({ products: [{ id: "burger", imageUrl: "/current.webp" }] }),
  );
  assert.equal(result.imageUrl, "/current.webp");
});

test("missing products and products without photos can still be repeated", async () => {
  const items = await buildRepeatOrderCartItems(
    { items: [item, { ...item, productId: "missing" }] },
    async () => ({ products: [{ id: "burger" }] }),
  );
  assert.equal(items.length, 2);
  assert.equal(items[0].imageUrl, undefined);
  assert.equal(items[1].imageUrl, undefined);
  assert.notEqual(items[0].lineId, items[1].lineId);
});

test("menu failure preserves historical images and still returns cart items", async () => {
  const items = await buildRepeatOrderCartItems(
    { items: [{ ...item, imageUrl: "/saved.webp" }, item] },
    async () => { throw new Error("Menu unavailable"); },
  );
  assert.equal(items[0].imageUrl, "/saved.webp");
  assert.equal(items[1].imageUrl, undefined);
  assert.equal(items[1].totalCents, item.totalCents);
});
