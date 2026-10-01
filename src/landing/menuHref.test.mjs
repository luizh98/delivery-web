import assert from "node:assert/strict";
import test from "node:test";
import { menuHrefFromSearchParams } from "./menuHref.ts";

test("preserva só UTMs permitidas e codifica valores no link interno", () => {
  const href = menuHrefFromSearchParams({
    utm_source: "instagram bio",
    utm_campaign: "promo&hoje",
    next: "https://evil.example/",
  });
  assert.equal(href, "/?utm_source=instagram+bio&utm_campaign=promo%26hoje");
  assert.equal(menuHrefFromSearchParams({ next: "/admin" }), "/");
});
