import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("./index.tsx", import.meta.url), "utf8");
const ast = ts.createSourceFile("index.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let subscription;
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(ast) === "useEffect"
    && node.arguments[0]?.getText(ast).startsWith("() => subscribeToOrderEvents(")) {
    subscription = node.arguments[0].getText(ast);
  }
  ts.forEachChild(node, visit);
}
visit(ast);
assert.ok(subscription, "order event subscription found");
const compiled = ts.transpileModule(`const subscribe = ${subscription}; subscribe();`, {
  compilerOptions: { target: ts.ScriptTarget.ES2020 },
}).outputText;

function listen({ automaticOrderConfirmation = true, connector = false, knownIds = [], visibleStatuses } = {}) {
  let receive;
  const printed = [];
  let orders = [];
  runInNewContext(compiled, {
    automaticOrderConfirmation, visibleStatuses, printDestination: "KITCHEN",
    knownOrderIdsRef: { current: new Set(knownIds) },
    subscribeToOrderEvents(callback) { receive = callback; },
    setOrders(update) { orders = update(orders); },
    isAutomaticConnectorEnabled: async () => connector,
    printOrderDirectly: async (...args) => printed.push(args),
    showToast() { assert.fail("unexpected printing error"); },
  });
  return { receive, printed, orders: () => orders };
}

test("new orders print at every automatic destination, including outside visible statuses", async () => {
  for (const status of ["CONFIRMED", "PREPARING", "READY"]) {
    const listener = listen({ visibleStatuses: ["PREPARING"] });
    const order = { id: status, status };
    listener.receive(order);
    listener.receive({ ...order, status: "READY" });
    await new Promise(setImmediate);
    assert.equal(listener.printed.length, 1, `${status}: exactly one automatic print`);
    assert.equal(listener.printed[0][0], order);
    assert.equal(listener.printed[0][1], "KITCHEN");
    assert.equal(listener.printed[0][2], true);
  }
});

test("connector, existing orders and disabled browser confirmation suppress fallback printing", async () => {
  for (const options of [{ connector: true }, { knownIds: ["order"] }, { automaticOrderConfirmation: false }]) {
    const listener = listen(options);
    listener.receive({ id: "order", status: "PREPARING" });
    await new Promise(setImmediate);
    assert.equal(listener.printed.length, 0);
  }
});
