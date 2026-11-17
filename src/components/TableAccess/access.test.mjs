import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const compile = url => ts.transpileModule(readFileSync(url, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
function render(name, { device = {}, fail = false } = {}) {
  const loaded = { exports: {} }, calls = [], errors = [], navigation = [];
  const jsx = (type, props) => ({ type, props });
  runInNewContext(compile(new URL("./index.tsx", import.meta.url)), {
    module: loaded, exports: loaded.exports, window: { location: { origin: "https://shop.test" } }, navigator: device,
    require(id) {
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (id === "react") return { useState: initial => [initial, next => errors.push(next)] };
      if (id === "react-hook-form") return { useForm: () => ({ register: name => ({ name }), handleSubmit: fn => fn, formState: { errors: {}, isSubmitting: false } }) };
      if (id === "next/navigation") return { useRouter: () => ({ refresh: () => navigation.push("refresh"), push: url => navigation.push(url) }) };
      if (id === "@/utils/tableIdentity") return { tableLabel: table => `Mesa ${table.number}` };
      if (id === "@/utils/tableSharing") return { shareTableAccess: async text => { calls.push({ shared: text }); return "copied"; } };
      if (id === "@/services/api/client") return { ApiError: Error, clientApi: async (path, init) => { calls.push({ path, body: JSON.parse(init.body) }); if (fail) throw Error("offline"); return {}; } };
      if (id.startsWith("@/components/") || id === "./styles" || id === "lucide-react") return new Proxy({}, { get: (_, key) => key });
      return require(id);
    },
  });
  const table = { number: "01", session: { id: "expected-visit" }, shareCode: "23456789AB" };
  const tree = loaded.exports[name]({ token: "qr", table });
  const walk = node => !node || typeof node !== "object" ? [] : Array.isArray(node) ? node.flatMap(walk) : [node, ...walk(node.props?.children)];
  return { nodes: walk(tree), calls, errors, navigation, schema: loaded.exports.tableCodeSchema };
}
test("code entry validates length and normalizes shared code before joining expected visit", async () => {
  const r = render("TableAccess");
  assert.equal(r.nodes.filter(node => node.props?.type === "submit").length, 1);
  assert.equal(r.nodes.filter(node => node.props?.id === "table-code-help").length, 1);
  assert.equal(r.schema.safeParse({ code: "wrong" }).success, false);
  const input = r.schema.parse({ code: " 23456789ab " });
  await r.nodes.find(node => node.type === "form").props.onSubmit(input);
  assert.deepEqual(r.calls, [{ path: "public/tables/qr/join", body: { code: "23456789AB", sessionId: "expected-visit" } }]);
  assert.deepEqual(r.navigation, ["refresh"]);
});
test("failed join preserves entry and offers retry without changing visit", async () => {
  const r = render("TableAccess", { fail: true });
  await r.nodes.find(node => node.type === "form").props.onSubmit({ code: "23456789AB" });
  assert.equal(r.navigation.length, 0);
  assert.ok(r.errors.some(value => value.includes("Confira sua conexão")));
  const input = r.nodes.find(node => node.type === "Input");
  assert.equal(input.props.maxLength, 10);
  assert.equal(input.props["aria-describedby"], "table-code-help");
});
test("responsible customer can share code and QR menu without leaking code into URL", async () => {
  const r = render("TableShare");
  await r.nodes.find(node => node.type === "Button").props.onClick();
  // onClick starts async operation; sharing promise settles in next microtask.
  await new Promise(setImmediate);
  assert.match(r.calls[0].shared, /23456789AB/);
  assert.match(r.calls[0].shared, /https:\/\/shop.test\/menu\?mesa=qr e informe/);
  assert.ok(r.errors.some(value => typeof value === "string" && value.includes("Código e link copiados")));
});

const sharingModule = { exports: {} };
runInNewContext(compile(new URL("../../utils/tableSharing.ts", import.meta.url)), { module: sharingModule, exports: sharingModule.exports, Error });
const share = sharingModule.exports.shareTableAccess;
test("sharing supports native sheet, clipboard fallback, cancellation and manual recovery", async () => {
  let copied = "";
  assert.equal(await share("code", { share: async () => {} }), "shared");
  assert.equal(await share("code", { share: async () => { throw Error("unavailable"); }, clipboard: { writeText: async value => { copied = value; } } }), "copied");
  assert.equal(copied, "code");
  assert.equal(await share("code", { share: async () => { const error = Error("cancel"); error.name = "AbortError"; throw error; } }), "canceled");
  assert.equal(await share("code", {}), "manual");
});
