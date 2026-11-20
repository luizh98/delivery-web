import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { draftItemTotal, normalizeTablePhone, staffApiMessage } from "./draft.ts";
import { formatBrazilianPhoneInput } from "../../utils/customerInput.ts";

function harness({ fail } = {}) {
  const product = { id: "food", name: "Prato", active: true, priceCents: 2000, optionGroups: [], imageUrl: "/photo.jpg" };
  const state = new Map(), refs = [], requests = [], messages = [];
  let slot = 0, ref = 0, uuid = 0;
  class ApiError extends Error { constructor(status) { super("bad"); this.status = status; } }
  const source = ts.transpileModule(readFileSync(new URL("./NewTableOrder.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const loaded = { exports: {} };
  const jsx = (type, props) => ({ type, props });
  runInNewContext(source, { module: loaded, exports: loaded.exports, window: { scrollTo() {} }, crypto: { randomUUID: () => `id-${++uuid}` }, require(name) {
    if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
    if (name === "react") return { useState(initial) { const key = slot++; if (!state.has(key)) state.set(key, initial); return [state.get(key), (next) => state.set(key, typeof next === "function" ? next(state.get(key)) : next)]; }, useRef(initial) { const key = ref++; return refs[key] ??= { current: initial }; }, useEffect() {} };
    if (name === "@/services/api/client") return { ApiError, clientApi: async (...args) => { requests.push(args); if (fail) { const error = fail; fail = null; throw error === "network" ? new Error("network") : new ApiError(error); } return { orderNumber: "42" }; } };
    if (name === "@/components/ToastProvider") return { useToast: () => ({ showToast: (...args) => messages.push(args) }) };
    if (name === "@/components/ConfirmationProvider") return { useConfirmation: () => ({ requestConfirmation: async () => true }) };
    if (name === "@/utils/format") return { money: (value) => String(value) };
    if (name === "@/utils/productPricing") return { productSalePrice: (value) => value.priceCents };
    if (name === "@/utils/tableIdentity") return { tableLabel: (value) => `Comanda ${value.number}` };
    if (name === "./draft") return { draftItemTotal, staffApiMessage };
    return new Proxy({}, { get: (_, key) => String(key) });
  } });
  const props = { menu: { categories: [], products: [product] }, tables: [{ id: "command", number: "23", kind: "COMMAND", active: true }], admin: { roles: ["WAITER"] }, restaurantName: "Restaurante", storeOpen: true, onTables() {}, onSent() {} };
  function render() {
    slot = ref = 0;
    const nodes = [];
    function visit(node) { if (Array.isArray(node)) return node.forEach(visit); if (!node || typeof node !== "object") return; nodes.push(node); visit(node.props?.children); }
    visit(loaded.exports.NewTableOrder(props));
    return nodes;
  }
  function add() {
    render().find((node) => node.props?.["aria-label"] === "Adicionar Prato").props.onClick();
    const editor = render().find((node) => node.type === "ItemEditor");
    assert.ok(editor, "product without options opens observation editor");
    editor.props.onSave({ ...editor.props.item, observations: "Sem cebola", quantity: 2 });
  }
  const target = { tableId: "command", physicalTableId: "table", sessionId: "visit", customerPhone: "11988887777", customerName: "Maria" };
  function choose() { render().find((node) => node.type === "Summary").props.children[1].props.onClick(); return render().find((node) => node.type === "OrderDestination"); }
  return { render, add, choose, target, requests, messages };
}

test("items precede destination; observations, quantity and contact reach existing audited endpoint", async () => {
  const view = harness();
  const initial = view.render();
  assert.ok(initial.some((node) => node.props?.src === "/photo.jpg"));
  assert.equal(initial.some((node) => node.type === "OrderDestination"), false);
  view.add();
  assert.equal(view.requests.length, 0);
  await view.choose().props.onConfirm(view.target);
  await new Promise(setImmediate);
  assert.equal(view.requests.length, 1);
  assert.equal(view.requests[0][0], "admin/table-operations/command/orders");
  const body = JSON.parse(view.requests[0][1].body);
  assert.equal(body.expectedTotalCents, 4000);
  assert.equal(body.customerName, "Maria");
  assert.equal(body.physicalTableId, "table");
  assert.equal(body.sessionId, "visit");
  assert.equal(body.items[0].observations, "Sem cebola");
  assert.equal(body.items[0].quantity, 2);
  assert.equal(view.render().some((node) => node.props?.["aria-label"] === "Excluir Prato"), false);
});

test("uncertain submission freezes draft and retries the identical destination, body and key", async () => {
  const view = harness({ fail: "network" }); view.add();
  await view.choose().props.onConfirm(view.target);
  await new Promise(setImmediate);
  const nodes = view.render();
  assert.equal(nodes.find((node) => node.props?.["aria-label"] === "Adicionar Prato").props.disabled, true);
  assert.equal(nodes.find((node) => node.props?.["aria-label"] === "Excluir Prato").props.disabled, true);
  await nodes.find((node) => node.type === "Summary").props.children[1].props.onClick();
  await new Promise(setImmediate);
  assert.equal(view.requests.length, 2);
  assert.equal(view.requests[0][0], view.requests[1][0]);
  assert.equal(view.requests[0][1].body, view.requests[1][1].body);
});

test("rejected submission preserves items and allows selecting another destination", async () => {
  const view = harness({ fail: 409 }); view.add();
  await view.choose().props.onConfirm(view.target);
  await new Promise(setImmediate);
  assert.equal(view.render().find((node) => node.props?.["aria-label"] === "Excluir Prato").props.disabled, false);
  await view.choose().props.onConfirm({ ...view.target, tableId: "other-command" });
  await new Promise(setImmediate);
  assert.equal(view.requests[1][0], "admin/table-operations/other-command/orders");
  assert.notEqual(JSON.parse(view.requests[0][1].body).submissionId, JSON.parse(view.requests[1][1].body).submissionId);
});

test("destination waits for consumption and late contact lookup never erases typed fields", async () => {
  const data = { tableId: "command", physicalTableId: "", customerName: "", customerPhone: "", guestCount: "1" };
  const effects = [], state = new Map();
  let slot = 0, resolve;
  const form = { formState: { errors: {} }, register: () => ({}), handleSubmit: (fn) => fn, getValues: (name) => data[name], setValue: (name, value) => { data[name] = value; } };
  const jsx = (type, props) => ({ type, props });
  const loaded = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL("./OrderDestination.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  runInNewContext(source, { module: loaded, exports: loaded.exports, AbortController, require(name) {
    if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
    if (name === "react") return { useRef: () => ({ current: null }), useEffect: (fn) => effects.push(fn), useState: (initial) => { const key = slot++; if (!state.has(key)) state.set(key, initial); return [state.get(key), (next) => state.set(key, next)]; } };
    if (name === "react-hook-form") return { useForm: () => form, useWatch: ({ name }) => data[name] };
    if (name === "@/services/api/client") return { clientApi: () => new Promise((done) => { resolve = done; }) };
    if (name === "@/utils/customerInput") return { formatBrazilianPhoneInput };
    if (name === "./draft") return { normalizeTablePhone, staffApiMessage };
    if (name === "@/utils/tableIdentity") return { tableLabel: (table) => table.number };
    return new Proxy({}, { get: (_, key) => String(key) });
  } });
  const tree = loaded.exports.OrderDestination({ tables: [{ id: "command", number: "23", kind: "COMMAND", active: true }], onClose() {}, onConfirm() {} });
  const fields = tree.props.children.props.children.find((node) => node?.type === "fieldset");
  assert.equal(fields.props.disabled, true);
  effects[1]();
  data.physicalTableId = "typed-table"; data.customerName = "Typed name"; data.customerPhone = "11988887777";
  resolve({ session: null, orders: [{ customerName: "Old contact", customerPhone: "11999990000" }] });
  await new Promise(setImmediate);
  assert.equal(data.physicalTableId, "typed-table");
  assert.equal(data.customerName, "Typed name");
  assert.equal(data.customerPhone, "11988887777");
});
