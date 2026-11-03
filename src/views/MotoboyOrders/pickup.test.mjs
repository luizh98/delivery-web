import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

class ApiError extends Error { constructor(status, message = "API failed") { super(message); this.status = status; } }
function load(clientApi) {
  const module = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL("./pickup.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  runInNewContext(source, { module, exports: module.exports, require: () => ({ ApiError, clientApi }) });
  return module.exports;
}
const code = "flyfoods:pickup:v1:123:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

test("pickup confirmation survives reload failure and explains stale list", async () => {
  const calls = [];
  const { confirmPickup } = load(async (...args) => { calls.push(args); return { id: "123", orderNumber: "B-7002" }; });
  const result = await confirmPickup("123", code, async () => false);
  assert.equal(result.success, true);
  assert.match(result.message, /B-7002: saída confirmada/);
  assert.match(result.message, /Não foi possível atualizar a lista/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "admin/motoboy/orders/123/pickup");
  assert.equal(JSON.parse(calls[0][1].body).qrCode, code);
});

test("conflict only claims refreshed list when reload actually succeeds", async () => {
  const { confirmPickup } = load(async () => { throw new ApiError(409); });
  for (const updated of [true, false]) {
    const result = await confirmPickup("123", code, async () => updated);
    assert.equal(result.success, false);
    assert.match(result.message, /já retirado por outro entregador/);
    assert.equal(result.message.includes("Lista atualizada."), updated);
    assert.equal(result.message.includes("Lista não atualizada."), !updated);
  }
});

test("lost response explains uncertainty and preserves explicit safe retry", async () => {
  const { confirmPickup } = load(async () => { throw new Error("offline"); });
  const result = await confirmPickup("123", undefined, async () => false);
  assert.equal(result.success, false);
  assert.match(result.message, /Não foi possível confirmar o resultado/);
  assert.match(result.message, /repetir não duplica/);
  assert.doesNotMatch(result.message, /Lista atualizada\./);
});

test("notification recovery distinguishes recorded pickup from a pending departure notice", async () => {
  const { confirmPickup } = load(async () => { throw new ApiError(500, JSON.stringify({ code: "pickup_notification_pending" })); });
  const result = await confirmPickup("123", code, async () => true);
  assert.equal(result.success, false);
  assert.match(result.message, /Retirada registrada, mas aviso de saída pendente/);
  assert.match(result.message, /novamente para recuperar o aviso/);
});

test("continuous reader resolves each signed payload to its order; arbitrary URLs are rejected", () => {
  const { pickupOrderId } = load(() => { throw new Error("parsing must not call API"); });
  assert.equal(pickupOrderId(code), "123");
  assert.equal(pickupOrderId(code.replace(":123:", ":456:")), "456");
  for (const invalid of ["", "https://other.example/123", code + "\n", code.replace(":123:", ":../admin:"), code.replace("v1", "v2")]) assert.equal(pickupOrderId(invalid), null);
});
