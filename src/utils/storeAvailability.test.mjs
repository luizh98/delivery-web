import assert from "node:assert/strict";
import test from "node:test";
import { formatClosedStoreMessage } from "./storeAvailability.ts";

for (const [name, now, opening, expected] of [
  ["same day", "2026-10-18T10:00:00-03:00", "2026-10-18T17:30:00-03:00", "hoje às 17:30"],
  ["closed Sunday", "2026-10-18T10:00:00-03:00", "2026-10-19T17:30:00-03:00", "amanhã às 17:30"],
  ["tenant Sunday hours", "2026-10-18T10:00:00-03:00", "2026-10-19T05:30:00-03:00", "amanhã às 05:30"],
  ["consecutive closed dates", "2026-10-18T10:00:00-03:00", "2026-10-20T17:30:00-03:00", "terça-feira às 17:30"],
  ["local date before UTC midnight", "2026-10-19T01:00:00Z", "2026-10-19T20:30:00Z", "amanhã às 17:30"],
  ["local date after UTC midnight", "2026-10-19T01:00:00Z", "2026-10-19T02:30:00Z", "hoje às 23:30"],
  ["year boundary", "2026-12-31T23:00:00-03:00", "2027-01-01T17:30:00-03:00", "amanhã às 17:30"],
]) {
  test(`closed store message: ${name}`, () => {
    assert.equal(formatClosedStoreMessage(opening, new Date(now)), `Loja fechada, abre ${expected}`);
  });
}

test("missing or invalid opening has no promised opening time", () => {
  for (const value of [undefined, "", "invalid"]) {
    assert.equal(formatClosedStoreMessage(value), "Loja fechada");
  }
});
