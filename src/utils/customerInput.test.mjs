import test from "node:test";
import assert from "node:assert/strict";
import {
  formatBrazilianPhoneInput,
  isValidBrazilianPhone,
  isValidBrazilianMobile,
  normalizeBrazilianMobile,
} from "./customerInput.ts";

test("restaurant phone accepts and formats landlines and mobiles with DDD", () => {
  for (const [input, formatted, normalized] of [
    ["1936816150", "(19) 3681-6150", "1936816150"],
    ["(19) 3681-6150", "(19) 3681-6150", "1936816150"],
    ["+55 (19) 3681-6150", "(19) 3681-6150", "1936816150"],
    ["19998765432", "(19) 99876-5432", "19998765432"],
    ["(19) 99876-5432", "(19) 99876-5432", "19998765432"],
    ["+55 (19) 99876-5432", "(19) 99876-5432", "19998765432"],
    ["5536816150", "(55) 3681-6150", "5536816150"],
  ]) {
    assert.equal(isValidBrazilianPhone(input), true, input);
    assert.equal(formatBrazilianPhoneInput(input), formatted);
    assert.equal(normalizeBrazilianMobile(input), normalized);
  }
});

test("phone mask adapts while typing and deleting", () => {
  for (const [input, formatted] of [
    ["", ""], ["1", "(1"], ["19", "(19"], ["193", "(19) 3"],
    ["193681", "(19) 3681"], ["1936816", "(19) 3681-6"],
    ["(19) 9987-65432", "(19) 99876-5432"],
    ["(19) 99876-543", "(19) 9987-6543"],
  ]) assert.equal(formatBrazilianPhoneInput(input), formatted);
});

test("phone rejects incomplete numbers and preserves customer mobile validation", () => {
  for (const value of ["", "abc", "3681-6150", "(19) 3681-615", "(09) 3681-6150", "(19) 36816-6150"]) {
    assert.equal(isValidBrazilianPhone(value), false, value);
  }
  assert.equal(isValidBrazilianMobile("(19) 3681-6150"), false);
  assert.equal(isValidBrazilianMobile("(19) 99876-5432"), true);
});
