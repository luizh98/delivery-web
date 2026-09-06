import test from "node:test";
import assert from "node:assert/strict";
import { buildPromotionComboCartItems } from "./cartItems.ts";

test("builds normal cart lines using current product prices", () => {
  const combo = {
    code: "combo-code",
    name: "Combo almoço",
    items: [
      {
        productId: "drink",
        quantity: 2,
        displayOrder: 0,
        product: {
          id: "drink",
          name: "Refrigerante",
          priceCents: 700,
          optionGroups: [],
        },
      },
      {
        productId: "burger",
        quantity: 1,
        displayOrder: 1,
        product: {
          id: "burger",
          name: "Hambúrguer",
          priceCents: 2500,
          optionGroups: [],
        },
      },
    ],
  };

  const items = buildPromotionComboCartItems(combo, () => "line-id");

  assert.deepEqual(items.map((item) => [item.productId, item.quantity, item.totalCents]), [
    ["drink", 2, 1400],
    ["burger", 1, 2500],
  ]);
  assert.equal(items[0].upsellCampaignId, undefined);
  assert.equal(items[0].unitPriceCents, 700);
});
