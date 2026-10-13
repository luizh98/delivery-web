import test from "node:test";
import assert from "node:assert/strict";
import { adminLoginSchema, adminPhoneSchema } from "./adminAuth.ts";

test("admin phone is optional and accepts DDD, formatting and Brazil prefix", () => {
  for (const phone of ["", "  ", "11987654321", "(11) 98765-4321", "+55 (11) 98765-4321", "5511987654321", "1134567890", "55987654321"]) {
    assert.equal(adminPhoneSchema.safeParse(phone).success, true, phone);
  }
  for (const phone of ["987654321", "12345678901234", "abc", "+54 11 98765-4321"]) {
    assert.equal(adminPhoneSchema.safeParse(phone).success, false, phone);
  }
});

test("admin login requires email or phone and password", () => {
  for (const identifier of ["admin@example.com", " ADMIN@example.com ", "(11) 98765-4321", "+55 (11) 98765-4321"]) {
    assert.equal(adminLoginSchema.safeParse({ identifier, password: "password1" }).success, true, identifier);
  }
  for (const identifier of ["", "  ", "admin", "invalid@", "987654321"]) {
    assert.equal(adminLoginSchema.safeParse({ identifier, password: "password1" }).success, false, identifier);
  }
  assert.equal(adminLoginSchema.safeParse({ identifier: "admin@example.com", password: "" }).success, false);
});
