import assert from "node:assert/strict";
import test from "node:test";
import { applyDefaultOfferPrice } from "./offerPricing.ts";

const offers = [
  { targetId: "drink", priceType: "PERCENTAGE", discountPercentage: 15, weekdayPrices: [{ dayOfWeek: "FRIDAY", priceReais: 5 }] },
  { targetId: "category", priceType: "FIXED", fixedOfferPriceReais: 8, weekdayPrices: [] },
];

test("applies a fixed price or percentage to every offer without changing targets or weekday overrides", () => {
  const fixed = applyDefaultOfferPrice(offers, { priceType: "FIXED", value: 7.5 });
  assert.ok(fixed.every((offer) => offer.fixedOfferPriceReais === 7.5 && offer.discountPercentage === undefined));
  const percentage = applyDefaultOfferPrice(fixed, { priceType: "PERCENTAGE", value: 20 });
  assert.ok(percentage.every((offer) => offer.discountPercentage === 20 && offer.fixedOfferPriceReais === undefined));
  assert.deepEqual(percentage.map((offer) => [offer.targetId, offer.weekdayPrices]), offers.map((offer) => [offer.targetId, offer.weekdayPrices]));
  assert.equal(offers[0].discountPercentage, 15);
  assert.equal(offers[1].fixedOfferPriceReais, 8);
});

test("accepts zero and 100%, rejecting negative, fractional and invalid percentages or prices", () => {
  assert.doesNotThrow(() => applyDefaultOfferPrice(offers, { priceType: "FIXED", value: 0 }));
  for (const value of [0, 100]) assert.doesNotThrow(() => applyDefaultOfferPrice(offers, { priceType: "PERCENTAGE", value }));
  for (const value of [-1, 101, 1.5, NaN, Infinity, "", undefined]) {
    assert.throws(() => applyDefaultOfferPrice(offers, { priceType: "PERCENTAGE", value }));
  }
  for (const value of [-1, NaN, Infinity, "", undefined]) {
    assert.throws(() => applyDefaultOfferPrice(offers, { priceType: "FIXED", value }));
  }
});
