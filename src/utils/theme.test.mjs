import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_THEME, themeForeground } from "./theme.ts";

test("brand defaults match the landing page palette", () => {
  assert.equal(DEFAULT_THEME.primaryColor, "#f95c09");
  assert.equal(DEFAULT_THEME.secondaryColor, "#202321");
  assert.equal(themeForeground(DEFAULT_THEME.primaryColor), "#202321");
  assert.equal(themeForeground(DEFAULT_THEME.secondaryColor), "#ffffff");
});

test("tenant themes keep readable foregrounds for light, dark and short hex colors", () => {
  assert.equal(themeForeground("#0f766e"), "#ffffff");
  assert.equal(themeForeground("#fff"), "#202321");
  assert.equal(themeForeground("#000"), "#ffffff");
  assert.equal(themeForeground("#757575"), "#ffffff");
  assert.equal(themeForeground("#777777"), "#000000");
  assert.equal(themeForeground("invalid"), "#ffffff");
});
