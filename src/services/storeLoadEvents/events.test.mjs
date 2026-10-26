import test from "node:test";
import assert from "node:assert/strict";
import { StoreLoadEvents, STORE_LOAD_EVENTS_KEY } from "./index.ts";

function setup() {
  const values = new Map();
  const listeners = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  globalThis.window = {
    localStorage: storage, sessionStorage: storage,
    addEventListener: (key, fn) => listeners.set(key, fn),
    removeEventListener: (key) => listeners.delete(key),
  };
  return { values, listeners, pending: (tenant = "shop") => JSON.parse(values.get(STORE_LOAD_EVENTS_KEY + tenant) ?? "[]") };
}

test("persists failures across page instances and reuses anonymous session", () => {
  const { pending } = setup();
  new StoreLoadEvents("shop").recordFailure();
  new StoreLoadEvents("shop").recordFailure();
  assert.equal(pending().length, 2);
  assert.equal(pending()[0].sessionId, pending()[1].sessionId);
  assert.notEqual(pending()[0].id, pending()[1].id);
});

test("failed request and lost acknowledgement retain same event ID for retry", async () => {
  const { pending } = setup();
  const service = new StoreLoadEvents("shop");
  const id = service.recordFailure();
  const sent = [];
  globalThis.fetch = async (_url, init) => { sent.push(JSON.parse(init.body).id); throw new Error("offline"); };
  await service.flush();
  assert.equal(pending()[0].id, id);
  globalThis.fetch = async (_url, init) => { sent.push(JSON.parse(init.body).id); return { status: 204 }; };
  await new StoreLoadEvents("shop").flush();
  assert.deepEqual(sent, [id, id]);
  assert.equal(pending().length, 0);
});

test("only 204 confirms persistence; concurrent additions survive acknowledgement", async () => {
  const { pending } = setup();
  const service = new StoreLoadEvents("shop");
  service.recordFailure();
  globalThis.fetch = async () => ({ status: 200 });
  await service.flush();
  assert.equal(pending().length, 1);
  globalThis.fetch = async () => { service.recordFailure(); return { status: 204 }; };
  await service.flush();
  assert.equal(pending().length, 1);
});

test("bounds queue, prunes expired/invalid events and isolates tenant queues", async () => {
  const { values, pending } = setup();
  const service = new StoreLoadEvents("shop");
  for (let i = 0; i < 105; i++) service.recordFailure();
  assert.equal(pending().length, 100);
  const old = { ...pending()[0], occurredAt: new Date(Date.now() - 8 * 86400000).toISOString() };
  values.set(STORE_LOAD_EVENTS_KEY + "shop", JSON.stringify([old, null, {}, pending()[0]]));
  service.recordFailure();
  assert.equal(pending().length, 2);
  new StoreLoadEvents("other").recordFailure();
  globalThis.fetch = async (_url, init) => { assert.equal(init.headers["X-Tenant-Slug"], "shop"); return { status: 204 }; };
  await service.flush();
  assert.equal(pending("other").length, 1);
});

test("corrupt or blocked storage never prevents recording or sending", async () => {
  const { values, pending } = setup();
  values.set(STORE_LOAD_EVENTS_KEY + "shop", "broken JSON");
  new StoreLoadEvents("shop").recordFailure();
  assert.equal(pending().length, 1);
  window.localStorage = window.sessionStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("quota"); } };
  const service = new StoreLoadEvents("shop");
  service.recordFailure();
  let calls = 0;
  globalThis.fetch = async () => { calls++; return { status: 204 }; };
  await service.flush();
  await service.flush();
  assert.equal(calls, 1);
});

test("prevents concurrent sends and removes listeners on stop", async () => {
  const { listeners } = setup();
  const service = new StoreLoadEvents("shop");
  service.recordFailure();
  let resolve;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Promise((done) => { resolve = done; }); };
  const stop = service.start();
  await service.flush();
  assert.equal(calls, 1);
  assert.equal(listeners.has("online"), true);
  stop();
  resolve({ status: 204 });
  await new Promise((done) => setImmediate(done));
  assert.equal(listeners.size, 0);
});

test("backs off failures, retries on connectivity and stops after acknowledgement", async (t) => {
  const { listeners, pending } = setup();
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const service = new StoreLoadEvents("shop");
  service.recordFailure();
  let calls = 0;
  globalThis.fetch = async () => { calls++; return { status: 503 }; };
  const stop = service.start();
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  await settle();
  assert.equal(calls, 1);
  t.mock.timers.tick(5000);
  await settle();
  assert.equal(calls, 2);
  t.mock.timers.tick(9999);
  await settle();
  assert.equal(calls, 2);
  t.mock.timers.tick(1);
  await settle();
  assert.equal(calls, 3);
  globalThis.fetch = async () => { calls++; return { status: 204 }; };
  listeners.get("online")();
  t.mock.timers.tick(5000);
  await settle();
  assert.equal(calls, 4);
  assert.equal(pending().length, 0);
  t.mock.timers.tick(300000);
  await settle();
  assert.equal(calls, 4);
  stop();
});

test("timeout keeps the event for retry", async (t) => {
  const { pending } = setup();
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const service = new StoreLoadEvents("shop");
  service.recordFailure();
  globalThis.fetch = async (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener("abort", () => reject(new Error("timeout")));
  });
  const sending = service.flush();
  t.mock.timers.tick(5000);
  await sending;
  assert.equal(pending().length, 1);
});

test("write quota failure retains new events even when reads still work", async () => {
  const { values } = setup();
  window.localStorage.setItem = () => { throw new Error("quota exceeded"); };
  values.set(STORE_LOAD_EVENTS_KEY + "shop", "[]");
  const service = new StoreLoadEvents("shop");
  const id = service.recordFailure();
  globalThis.fetch = async (_url, init) => {
    assert.equal(JSON.parse(init.body).id, id);
    return { status: 204 };
  };
  await service.flush();
});
