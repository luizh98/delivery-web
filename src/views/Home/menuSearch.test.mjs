import test from "node:test";
import assert from "node:assert/strict";
import { productMatchesSearch } from "./menuSearch.ts";

test("menu search ignores case and accents and matches all words across name and description", () => {
  const product = { name: "Porção de COSTELA", description: "Queijo cremoso e pão" };
  for (const query of ["porcao", "COSTELA", "  PAO   costela ", "queijo porção"]) {
    assert.equal(productMatchesSearch(product, query), true, query);
  }
  assert.equal(productMatchesSearch(product, "costela frango"), false);
});

test("clearing search restores products and missing descriptions are searchable", () => {
  const product = { name: "Água" };
  assert.equal(productMatchesSearch(product, ""), true);
  assert.equal(productMatchesSearch(product, "   "), true);
  assert.equal(productMatchesSearch(product, "agua"), true);
  assert.equal(productMatchesSearch(product, "costela"), false);
});
