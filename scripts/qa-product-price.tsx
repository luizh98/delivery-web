import React from "react";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductPrice } from "../src/components/ProductPrice";

const examples = [
  { priceCents: 2990, discountType: "FIXED" as const, discountValue: 1990 },
  { priceCents: 2990, discountType: "PERCENTAGE" as const, discountValue: 20 },
  { priceCents: 2990, discountType: "FIXED" as const, discountValue: 0 },
  { priceCents: 2990 },
];
const markup = examples.map((product) => renderToStaticMarkup(<ProductPrice product={product} />));
assert.equal(markup[0].includes("OFERTA"), false);
assert.equal(markup[1].includes("OFF"), false);
assert.equal(markup[0].match(/R\$\s*19,90/g)?.length, 2); // Accessible name + one visible price.
assert.ok(markup[0].includes("<del"));
assert.ok(markup[2].includes("0,00"));
assert.equal(markup[3].includes("<del"), false);
console.log(markup.join("<br />"));
