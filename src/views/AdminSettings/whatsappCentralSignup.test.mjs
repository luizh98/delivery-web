import test from "node:test";
import assert from "node:assert/strict";
import { centralSignupConfig, centralSignupContext, validCentralResult, validSignupProvider, openCentralSignup } from "./whatsappCentralSignup.ts";

const config = centralSignupConfig("https://connect.flyfoods.com.br", "flyfoods.com.br");
const state = "a".repeat(64);
const provider = { enabled: true, appId: "123", configId: "456", apiVersion: "v25.0" };
const result = { event: "FINISH", code: "one-time-code", wabaId: "456", phoneNumberId: "123", businessId: "" };

test("central config defaults to direct flow and rejects insecure or ambiguous origins", () => {
  assert.equal(centralSignupConfig().origin, null);
  assert.deepEqual(centralSignupConfig("https://connect.flyfoods.com.br/", "flyfoods.com.br"), config);
  for (const origin of ["http://connect.flyfoods.com.br", "https://user@connect.flyfoods.com.br", "https://connect.flyfoods.com.br/path", "https://connect.flyfoods.com.br?x=1", "javascript:alert(1)"]) assert.throws(() => centralSignupConfig(origin, "flyfoods.com.br"));
  assert.throws(() => centralSignupConfig(config.origin, "*.flyfoods.com.br"));
  assert.equal(centralSignupConfig("http://connect.localhost:3100", "localhost").origin, "http://connect.localhost:3100");
});

test("central context admits tenant origins only with exact domain boundary and nonce", () => {
  const hash = origin => new URLSearchParams({ origin, state }).toString();
  assert.deepEqual(centralSignupContext(hash("https://tenant.flyfoods.com.br"), config), { origin: "https://tenant.flyfoods.com.br", state });
  for (const origin of ["https://flyfoods.com.br.attacker.test", "https://evilflyfoods.com.br", "http://tenant.flyfoods.com.br", "https://tenant.flyfoods.com.br/path", "null"]) assert.equal(centralSignupContext(hash(origin), config), null);
  assert.equal(centralSignupContext(hash("https://tenant.flyfoods.com.br").replace(state, "short"), config), null);
  assert.equal(centralSignupContext(hash("https://tenant.flyfoods.com.br"), centralSignupConfig()), null);
});

test("relay validates configuration, standard and WABA-only completion", () => {
  assert.equal(validSignupProvider(provider), true);
  assert.equal(validSignupProvider({ ...provider, enabled: false }), false);
  assert.equal(validCentralResult(result), true);
  assert.equal(validCentralResult({ ...result, phoneNumberId: "" }), false);
  assert.equal(validCentralResult({ ...result, event: "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING", phoneNumberId: "" }), true);
  assert.equal(validCentralResult({ ...result, code: "x\ny" }), false);
  assert.equal(validCentralResult({ ...result, wabaId: "bad" }), false);
});

test("relay binds origin, popup and nonce; ignores forgery and replay; abort cleans up", async () => {
  const oldWindow = globalThis.window;
  const listeners = new Set();
  let openedURL, closeCount = 0;
  const sent = [];
  const popup = { closed: false, close() { closeCount++; }, postMessage(...args) { sent.push(args); } };
  globalThis.window = { location: { origin: "https://tenant.flyfoods.com.br" }, open(url) { openedURL = url; return popup; }, addEventListener(_, listener) { listeners.add(listener); }, removeEventListener(_, listener) { listeners.delete(listener); } };
  const emit = data => { for (const listener of listeners) listener(data); };
  const controller = new AbortController();
  try {
    const pending = openCentralSignup(config.origin, provider, controller.signal);
    const nonce = new URLSearchParams(new URL(openedURL).hash.slice(1)).get("state");
    assert.match(nonce, /^[a-f0-9]{64}$/);
    assert.equal(openedURL.includes("one-time-code"), false);
    const envelope = { type: "FLYFOODS_WHATSAPP_RESULT", state: nonce, result };
    emit({ origin: "https://evil.test", source: popup, data: envelope });
    emit({ origin: config.origin, source: {}, data: envelope });
    emit({ origin: config.origin, source: popup, data: { ...envelope, state } });
    assert.equal(listeners.size, 1);
    emit({ origin: config.origin, source: popup, data: { type: "FLYFOODS_WHATSAPP_READY", state: nonce } });
    assert.equal(sent[0][1], config.origin);
    emit({ origin: config.origin, source: popup, data: envelope });
    assert.deepEqual(await pending, result);
    emit({ origin: config.origin, source: popup, data: envelope });
    assert.equal(closeCount, 1);
    assert.equal(listeners.size, 0);
    const cancelled = openCentralSignup(config.origin, provider, controller.signal);
    controller.abort();
    assert.deepEqual(await cancelled, { event: "CANCEL" });
    assert.equal(listeners.size, 0);
    window.open = () => null;
    assert.throws(() => openCentralSignup(config.origin, provider, new AbortController().signal), /pop-ups/);
  } finally { controller.abort(); globalThis.window = oldWindow; }
});
