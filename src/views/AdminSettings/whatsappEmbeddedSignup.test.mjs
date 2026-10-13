import assert from "node:assert/strict";
import test from "node:test";
import { parseMetaSignupMessage, connectionErrorMessage, templateStatusLabel, loadMetaSDK } from "./whatsappEmbeddedSignup.ts";

const completed = { type: "WA_EMBEDDED_SIGNUP", event: "FINISH", data: { waba_id: "456", phone_number_id: "123", business_id: "789" } };

test("SDK bootstrap does not enable login before the real bundle is ready", async () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const script = {};
  let initialized = 0;
  globalThis.window = { setTimeout: () => 1, clearTimeout() {} };
  globalThis.document = { getElementById: () => null, createElement: () => script, head: { appendChild() {} } };
  try {
    const ready = loadMetaSDK("123", "v25.0");
    window.FB = { __buffer: { calls: [] }, init() { initialized++; }, login() {} };
    script.onload();
    await Promise.resolve();
    assert.equal(initialized, 0, "bootstrap queued login would lose the click activation");
    delete window.FB.__buffer;
    window.fbAsyncInit();
    assert.equal(await ready, window.FB);
    assert.equal(initialized, 1);
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
});

test("signup accepts official origins and validates identities before completion", () => {
  const expected = { event: "FINISH", wabaId: "456", phoneNumberId: "123", businessId: "789" };
  assert.deepEqual(parseMetaSignupMessage("https://www.facebook.com", JSON.stringify(completed)), expected);
  assert.deepEqual(parseMetaSignupMessage("https://web.facebook.com", completed), expected);
  for (const origin of ["https://fakefacebook.com", "http://www.facebook.com", "https://www.facebook.com.attacker.test", "https://www.facebook.com:444"]) {
    assert.equal(parseMetaSignupMessage(origin, completed), null);
  }
  assert.equal(parseMetaSignupMessage("https://www.facebook.com", { ...completed, data: { waba_id: "456", phone_number_id: "not-an-id" } }), null);
  assert.equal(parseMetaSignupMessage("https://www.facebook.com", "invalid JSON"), null);
});

test("cancel, error and coexistence cannot become a standard completion", () => {
  assert.deepEqual(parseMetaSignupMessage("https://www.facebook.com", { type: "WA_EMBEDDED_SIGNUP", event: "CANCEL" }), { event: "CANCEL" });
  assert.deepEqual(parseMetaSignupMessage("https://www.facebook.com", { type: "WA_EMBEDDED_SIGNUP", event: "ERROR" }), { event: "ERROR" });
  for (const event of ["FINISH_ONLY_WABA", "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING", "FINISH_OBO_MIGRATION"]) {
    assert.deepEqual(parseMetaSignupMessage("https://www.facebook.com", { ...completed, event }), { event: "UNSUPPORTED" });
  }
});

test("pending and unknown statuses never claim approval; API errors guide recovery", () => {
  assert.equal(templateStatusLabel("APPROVED"), "Aprovado");
  assert.equal(templateStatusLabel("PENDING"), "Em análise na Meta");
  assert.equal(templateStatusLabel("NEW_STATUS"), "Aguardando verificação");
  assert.equal(connectionErrorMessage(new Error(JSON.stringify({ message: "Conecte novamente." }))), "Conecte novamente.");
  assert.match(connectionErrorMessage(new Error("Network failure")), /Tente novamente/);
});
