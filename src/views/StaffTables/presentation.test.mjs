import assert from "node:assert/strict";
import test from "node:test";
import { tableElapsed, tableGuests, tableState, tableStatus } from "./presentation.ts";

test("table states follow the visit status", () => {
  for (const [session, state, label] of [[null, "free", "Livre"], [{ status: "OPEN" }, "occupied", "Ocupado"], [{ status: "CLOSING" }, "closing", "Fechamento"]]) {
    assert.equal(tableState({ session }), state);
    assert.equal(tableStatus({ session }), label);
  }
});

test("elapsed time handles minutes, hours, days and unavailable timestamps", () => {
  const now = Date.parse("2026-11-10T15:00:00Z");
  for (const [start, expected] of [["2026-11-10T14:59:30Z", "0 min"], ["2026-11-10T14:01:00Z", "59 min"], ["2026-11-10T13:55:00Z", "1h 05min"], ["2026-11-09T13:55:00Z", "25h 05min"], ["2026-11-10T15:01:00Z", "0 min"], [undefined, "Tempo não informado"], ["invalid", "Tempo não informado"]]) assert.equal(tableElapsed(start, now), expected);
});

test("guest count never invents occupancy for legacy sessions", () => {
  assert.equal(tableGuests(), "Pessoas não informadas");
  assert.equal(tableGuests(0), "Pessoas não informadas");
  assert.equal(tableGuests(1), "1 pessoa");
  assert.equal(tableGuests(4), "4 pessoas");
});
