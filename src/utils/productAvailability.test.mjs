import test from "node:test";
import assert from "node:assert/strict";
import { productAvailability, productAvailabilityLabels, productMatchesChannel, productPath, tableMenuPath } from "./productAvailability.ts";

test("legacy products remain available in both channels", () => {
  assert.equal(productAvailability({}), "ALL");
  assert.equal(productAvailabilityLabels[productAvailability({})], "Delivery e salão");
  assert.equal(productMatchesChannel({}, "DELIVERY"), true);
  assert.equal(productMatchesChannel({}, "TABLE"), true);
});
test("channel filters include shared products and exclude opposite exclusivity", () => {
  assert.equal(productMatchesChannel({ availability: "ALL" }, "TABLE"), true);
  assert.equal(productMatchesChannel({ availability: "TABLE" }, "TABLE"), true);
  assert.equal(productMatchesChannel({ availability: "TABLE" }, "DELIVERY"), false);
  assert.equal(productMatchesChannel({ availability: "DELIVERY" }, "TABLE"), false);
});
test("table menu and product links preserve encoded table context", () => {
  assert.equal(tableMenuPath(), "/");
  assert.equal(productPath("burger"), "/products/burger");
  assert.equal(tableMenuPath("qr+token"), "/?mesa=qr%2Btoken");
  assert.equal(productPath("burger", "qr+token"), "/products/burger?mesa=qr%2Btoken");
});
