import test from "node:test";
import assert from "node:assert/strict";
import {
  getMarketingConsent,
  MARKETING_CONSENT_STORAGE_KEY,
  saveMarketingConsent,
  subscribeMarketingConsent,
} from "./index.ts";

function createWindow(initialValue = null) {
  const values = new Map(
    initialValue === null
      ? []
      : [[MARKETING_CONSENT_STORAGE_KEY, initialValue]],
  );
  const listeners = new Map();

  return {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
    addEventListener: (event, listener) => {
      listeners.set(event, listener);
    },
    removeEventListener: () => undefined,
    dispatchEvent: (event) => {
      listeners.get(event.type)?.();
    },
  };
}

test("treats missing and invalid values as no consent", () => {
  globalThis.window = createWindow("invalid");

  assert.equal(getMarketingConsent(), null);
});

test("persists and publishes an explicit marketing decision", () => {
  globalThis.window = createWindow();
  let changes = 0;
  const unsubscribe = subscribeMarketingConsent(() => {
    changes += 1;
  });

  saveMarketingConsent("granted");

  assert.equal(getMarketingConsent(), "granted");
  assert.equal(changes, 1);
  unsubscribe();
});

test("reads denied consent from browser storage", () => {
  globalThis.window = createWindow('"denied"');

  assert.equal(getMarketingConsent(), "denied");
});
