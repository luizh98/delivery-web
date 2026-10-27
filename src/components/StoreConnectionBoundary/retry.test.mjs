import test from "node:test";
import assert from "node:assert/strict";
import { clearRetries, getRetryDelay, registerRetry } from "./retry.ts";

function setup(t) {
  const values = new Map();
  const clock = { now: 100000 };
  t.mock.method(Date, "now", () => clock.now);
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  };
  return { values, clock };
}

test("allows three attempts then preserves ten-second cooldown in storage", (t) => {
  const { values, clock } = setup(t);
  assert.equal(getRetryDelay("shop"), 0);
  for (let i = 0; i < 3; i++) assert.equal(registerRetry("shop"), true);
  assert.equal(getRetryDelay("shop"), 10);
  assert.equal(registerRetry("shop"), false);
  assert.deepEqual(JSON.parse(values.get("flyfoods:store-load-retry:shop")), { attempts: 3, blockedUntil: 110000 });
  clock.now += 1001;
  assert.equal(getRetryDelay("shop"), 9);
  assert.equal(registerRetry("shop"), false);
  clock.now = 109999;
  assert.equal(registerRetry("shop"), false);
  clock.now = 110000;
  assert.equal(getRetryDelay("shop"), 0);
  assert.equal(registerRetry("shop"), true);
  assert.equal(getRetryDelay("shop"), 10);
});

test("successful load resets attempts and different tenants remain independent", (t) => {
  setup(t);
  for (let i = 0; i < 3; i++) registerRetry("shop");
  assert.equal(getRetryDelay("other"), 0);
  assert.equal(registerRetry("other"), true);
  assert.equal(getRetryDelay("shop"), 10);
  clearRetries("shop");
  assert.equal(getRetryDelay("shop"), 0);
  assert.equal(registerRetry("shop"), true);
  assert.equal(getRetryDelay("shop"), 0);
});

test("corrupt storage or unreasonable future timestamps cannot lock customer out", (t) => {
  const { values } = setup(t);
  for (const raw of ["broken", "null", "{}", '{"attempts":3,"blockedUntil":999999999999}', '{"attempts":-1,"blockedUntil":110000}']) {
    values.set("flyfoods:store-load-retry:invalid", raw);
    assert.equal(getRetryDelay("invalid"), 0);
    assert.equal(registerRetry("invalid"), true);
  }
});

test("blocked storage still applies cooldown in memory without breaking button", (t) => {
  const { clock } = setup(t);
  window.localStorage = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); },
  };
  for (let i = 0; i < 3; i++) assert.equal(registerRetry("blocked"), true);
  assert.equal(registerRetry("blocked"), false);
  clock.now += 10000;
  assert.equal(registerRetry("blocked"), true);
  clearRetries("blocked");
  assert.equal(getRetryDelay("blocked"), 0);
});
