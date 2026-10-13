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
    && node.arguments[0]?.getText(ast).includes("subscribeToOrderEvents(")) {
    subscription = node.arguments[0].getText(ast);
  }
  ts.forEachChild(node, visit);
}
visit(ast);
assert.ok(subscription, "order event subscription found");
const compiled = ts.transpileModule(`const subscribe = ${subscription}; cleanup = subscribe();`, {
  compilerOptions: { target: ts.ScriptTarget.ES2020 },
}).outputText;

function listen({ automaticOrderConfirmation = true, connector = false, knownIds = [], visibleStatuses, fetchOrders = async () => [] } = {}) {
  let receive;
	let connect;
  const printed = [];
  let orders = [];
  const context = {
    cleanup: undefined,
    automaticOrderConfirmation, visibleStatuses, printDestination: "KITCHEN",
    knownOrderIdsRef: { current: new Set(knownIds) },
		subscribeToOrderEvents(callback, onConnect) { receive = callback; connect = onConnect; return () => {}; },
		setOrders(update) { orders = typeof update === "function" ? update(orders) : update; },
		clientApi: fetchOrders,
    URLSearchParams,
		orderStatuses: ["RECEIVED", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELED"],
    isAutomaticConnectorEnabled: async () => connector,
    printOrderDirectly: async (...args) => printed.push(args),
    showToast() { assert.fail("unexpected printing error"); },
  };
  runInNewContext(compiled, context);
  return { receive, printed, connect: () => connect(), cleanup: () => context.cleanup(), orders: () => orders };
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

test("connection refresh catches a missed driver status without printing old orders", async () => {
	const listener = listen({ knownIds: ["order"], fetchOrders: async () => [{ id: "order", status: "OUT_FOR_DELIVERY" }] });
	await listener.connect();
	assert.equal(listener.orders()[0].status, "OUT_FOR_DELIVERY");
	assert.equal(listener.printed.length, 0);
});

test("newer events win over a pending reconnect snapshot and keep kitchen filters", async () => {
  for (const visibleStatuses of [undefined, ["PREPARING"]]) {
    let resolve;
    const snapshot = new Promise((done) => { resolve = done; });
    const listener = listen({ knownIds: ["order"], visibleStatuses, fetchOrders: () => snapshot });
    const connected = listener.connect();
    listener.receive({ id: "order", status: "OUT_FOR_DELIVERY" });
    resolve([{ id: "order", status: "PREPARING" }]);
    await connected;
    assert.equal(listener.orders().length, visibleStatuses ? 0 : 1);
    if (!visibleStatuses) assert.equal(listener.orders()[0].status, "OUT_FOR_DELIVERY");
    assert.equal(listener.printed.length, 0);
  }
});

test("old reconnect requests and unmounted panels cannot overwrite orders", async () => {
  const pending = [];
  const listener = listen({ fetchOrders: () => new Promise((resolve) => pending.push(resolve)) });
  const first = listener.connect();
  const second = listener.connect();
  pending[1]([{ id: "order", status: "OUT_FOR_DELIVERY" }]);
  await second;
  pending[0]([{ id: "order", status: "PREPARING" }]);
  await first;
  assert.equal(listener.orders()[0].status, "OUT_FOR_DELIVERY");
  const last = listener.connect();
  listener.cleanup();
  pending[2]([{ id: "order", status: "CANCELED" }]);
  await last;
  assert.equal(listener.orders()[0].status, "OUT_FOR_DELIVERY");
});

test("silent snapshots do not replay prints when later events arrive", async () => {
  const listener = listen({ fetchOrders: async () => [{ id: "old", status: "PREPARING" }] });
  await listener.connect();
  listener.receive({ id: "old", status: "READY" });
  await new Promise(setImmediate);
  assert.equal(listener.printed.length, 0);
});
