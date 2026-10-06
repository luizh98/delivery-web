import test from "node:test";
import assert from "node:assert/strict";
import { isProductDiscountValid, productSalePrice } from "./productPricing.ts";

test("product discount matches cent-based API calculation", () => {
  for (const [product, expected] of [
    [{ priceCents: 2500 }, 2500],
    [{ priceCents: 2500, discountType: "PERCENTAGE", discountValue: 20 }, 2000],
    [{ priceCents: 999, discountType: "PERCENTAGE", discountValue: 50 }, 500],
    [{ priceCents: 2500, discountType: "FIXED", discountValue: 1990 }, 1990],
    [{ priceCents: 2500, discountType: "FIXED", discountValue: 0 }, 0],
    [{ priceCents: 2500, discountType: "PERCENTAGE", discountValue: 100 }, 0],
  ]) {
    assert.equal(isProductDiscountValid(product), true);
    assert.equal(productSalePrice(product), expected);
  }
});

test("invalid discount cannot change product price", () => {
  for (const [discountType, discountValue] of [
    ["PERCENTAGE", 0], ["PERCENTAGE", 101], ["PERCENTAGE", 10.5],
    ["FIXED", -1], ["FIXED", 2500], ["FIXED", 2501], ["UNKNOWN", 20],
  ]) {
    const product = { priceCents: 2500, discountType, discountValue };
    assert.equal(isProductDiscountValid(product), false);
    assert.equal(productSalePrice(product), 2500);
  }
});
