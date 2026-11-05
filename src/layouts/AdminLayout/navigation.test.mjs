import assert from "node:assert/strict";
import test from "node:test";
import { navigationHome, navigationItemVisible, navigationRole } from "./navigation.ts";

test("waiter and driver each see only their operation in the shared menu", () => {
  const items = [
    { href: "/admin" }, { href: "/hall", adminOnly: true },
    { href: "/admin/deliveries" }, { href: "/admin/users", adminOnly: true },
  ];
  assert.deepEqual(items.filter((item) => navigationItemVisible(item, navigationRole(["WAITER"]))), [items[1]]);
  assert.deepEqual(items.filter((item) => navigationItemVisible(item, navigationRole(["ENTREGADOR"]))), [items[2]]);
  assert.equal(navigationHome(navigationRole(["WAITER"])), "/hall");
  assert.equal(navigationHome(navigationRole(["ENTREGADOR"])), "/admin/deliveries");
});

test("admin and existing multi-role precedence are preserved", () => {
  assert.equal(navigationRole(["WAITER", "ADMIN"]), "admin");
  assert.equal(navigationRole(["WAITER", "STANDARD"]), "standard");
  assert.equal(navigationRole(["ENTREGADOR", "ADMIN"]), "admin");
  assert.equal(navigationItemVisible({ href: "/admin/users", adminOnly: true }, "admin"), true);
  assert.equal(navigationItemVisible({ href: "/admin/users", adminOnly: true }, "standard"), false);
});
