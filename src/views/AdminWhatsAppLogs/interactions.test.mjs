import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as format from "./format.ts";

const require = createRequire(import.meta.url);
const tick = () => new Promise(resolve => setImmediate(resolve));
const elements = node => !node || typeof node !== "object" ? [] : Array.isArray(node) ? node.flatMap(elements) : [node, ...elements(node.props?.children)];

function mount(file, name, api, props = {}) {
  const hooks = [], effects = [];
  let cursor = 0;
  const values = { search: "", status: "" };
  const loaded = { exports: {} };
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    module: loaded, exports: loaded.exports, AbortController, encodeURIComponent,
    require: id => {
      if (id === "react") return {
        useState(initial) { const i = cursor++; if (!(i in hooks)) hooks[i] = typeof initial === "function" ? initial() : initial; return [hooks[i], value => { hooks[i] = typeof value === "function" ? value(hooks[i]) : value; }]; },
        useEffect(effect, deps) { const i = cursor++; const old = hooks[i]; if (!old || deps.some((dep, j) => dep !== old.deps[j])) { old?.cleanup?.(); const saved = { deps }; hooks[i] = saved; effects.push(() => { saved.cleanup = effect(); }); } },
      };
      if (id === "react-hook-form") return { useForm: () => ({ register: key => ({ name: key }), handleSubmit: callback => () => callback(values), reset: next => Object.assign(values, next), getValues: () => values }) };
      if (id === "@/services/api/client") return { clientApi: api };
      if (id === "./format") return format;
      if (id === "@/components/DateRangeFilter") return { DateRangeFilter: "DateRangeFilter", getPresetDateRange: () => ({ startDate: "2026-11-06", endDate: "2026-11-06" }) };
      if (id === "react/jsx-runtime") return require(id);
      return new Proxy({}, { get: (_, key) => String(key) });
    },
  });
  return { values, render() { cursor = 0; const result = elements(loaded.exports[name](props)); effects.splice(0).forEach(effect => effect()); return result; } };
}

test("página aplica período/busca, abre pedido, troca histórico e recupera falha", async () => {
  const calls = [];
  let fail = false;
  const order = { id: "order", orderNumber: "050006", status: "COMPLETED", createdAt: "2026-11-05T23:00:00Z", notifications: [] };
  const fixture = mount("./index.tsx", "AdminWhatsAppLogsView", async path => {
    calls.push(path);
    if (path.endsWith("/connection")) return { integration: {}, notificationsEnabled: true };
    if (fail) throw new Error("offline");
    return { items: path.includes("/webhooks") ? [] : [order], page: 0, totalElements: 1, totalPages: 1 };
  });
  assert.ok(fixture.render().some(node => node.props?.role === "status"));
  await tick();
  let nodes = fixture.render();
  nodes.find(node => node.type === "OrderButton").props.onClick();
  assert.equal(fixture.render().find(node => node.type === "OrderLogsDetail").props.orderId, "order");
  fixture.values.search = "#050006";
  nodes.find(node => node.type === "DateRangeFilter").props.onChange({ startDate: "2026-11-05", endDate: "2026-11-05" });
  fixture.render(); await tick(); nodes = fixture.render();
  const query = new URLSearchParams(calls.findLast(path => path.includes("logs?" )).split("?")[1]);
  assert.equal(query.get("search"), "#050006");
  assert.equal(query.get("startDate"), "2026-11-05");
  assert.ok(!nodes.some(node => node.type === "OrderLogsDetail"));
  nodes.find(node => node.type === "Button" && node.props.children === "Webhooks sem pedido").props.onClick();
  fixture.render(); await tick(); nodes = fixture.render();
  assert.ok(calls.some(path => path.includes("logs/webhooks?")));
  assert.ok(nodes.some(node => node.type === "WebhookList"));
  fail = true;
  nodes.find(node => node.type === "Button" && Array.isArray(node.props.children) && node.props.children.includes("Atualizar")).props.onClick();
  fixture.render(); await tick(); nodes = fixture.render();
  assert.ok(nodes.some(node => node.props?.role === "alert"));
  fail = false;
  nodes.find(node => node.type === "Button" && Array.isArray(node.props.children) && node.props.children.includes("Atualizar")).props.onClick();
  fixture.render(); await tick();
  assert.ok(!fixture.render().some(node => node.props?.role === "alert"));
});

test("detalhe mostra legado sem inventar tentativas nem confirmação e pagina webhooks", async () => {
  const calls = [];
  const fixture = mount("./OrderLogs.tsx", "OrderLogsDetail", async path => {
    calls.push(path);
    return { order: { id: "order", orderNumber: "050006", notifications: [{ id: "notification", stage: "production", status: "accepted", attempts: 1, delivery: null, history: null, messageId: "wamid.test", createdAt: "2026-11-05T23:00:00Z" }] }, webhooks: { items: [], page: 0, totalPages: 2, totalElements: 26 } };
  }, { orderId: "order", refresh: 0 });
  fixture.render(); await tick();
  const nodes = fixture.render();
  assert.ok(JSON.stringify(nodes).includes("Registro anterior ao histórico de tentativas"));
  assert.ok(JSON.stringify(nodes).includes("Sem confirmação de entrega ou leitura"));
  nodes.find(node => node.props?.label === "Webhooks do pedido").props.onPage(1);
  fixture.render(); await tick();
  assert.ok(calls.at(-1).includes("page=1"));
});
