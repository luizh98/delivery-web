import assert from "node:assert/strict";
import { test } from "node:test";
import { pendingTableCalls } from "./tableService.ts";

test("alerts identify doubt and closure, excluding assigned and inactive tables", () => {
  const calls = pendingTableCalls([
    { id: "one", number: "01", active: true, requests: [
      { id: "doubt", type: "SERVICE", status: "PENDING" },
      { id: "bill", type: "CLOSURE", status: "PENDING" },
      { id: "taken", type: "SERVICE", status: "ASSIGNED" },
    ] },
    { id: "off", number: "02", active: false, requests: [{ id: "hidden", type: "SERVICE", status: "PENDING" }] },
  ]);
  assert.deepEqual(calls, [
    { id: "doubt", tableId: "one", tableNumber: "01", kind: undefined, label: "Dúvida · chamou garçom" },
    { id: "bill", tableId: "one", tableNumber: "01", kind: undefined, label: "Fechamento da conta" },
  ]);
  assert.deepEqual(pendingTableCalls([]), []);
});
