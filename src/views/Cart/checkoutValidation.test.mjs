import test from "node:test";
import assert from "node:assert/strict";
import { getCheckoutValidationMessage } from "./checkoutValidation.ts";

test("returns clear message when delivery address is incomplete", () => {
  assert.equal(
    getCheckoutValidationMessage({
      deliveryType: "DELIVERY",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
    }),
    "Informe o endereço de entrega para continuar.",
  );
});

test("does not show address message for pickup", () => {
  assert.equal(
    getCheckoutValidationMessage({
      deliveryType: "PICKUP",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
    }),
    "",
  );
});
