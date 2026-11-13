import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import * as calculations from "./paymentCalculation.ts";
import * as presentation from "./presentation.ts";

const descendants = (node) => !node || typeof node !== "object" ? [] : Array.isArray(node) ? node.flatMap(descendants) : [node, ...descendants(node.props?.children)];
const source = (name) => ts.transpileModule(readFileSync(new URL(name, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const account = (patch = {}) => ({ session: { id: "visit", status: "CLOSING", payments: [{ amountCents: 2000 }] }, canCheckout: true, orders: [], totals: { consumptionCents: 6001, serviceFeeCents: 600, serviceFeeBasisPoints: 1000, totalCents: 6601 }, ...patch });

function render({ consumption = account(), error = "", blocked = false, confirm = true, expectedSessionId = "visit" } = {}) {
  let slot = 0;
  const states = [consumption, error, false, false, blocked, false];
  const requests = [], routes = [], notices = [], confirmations = [];
  const loaded = { exports: {} };
  const jsx = (type, props) => ({ type, props });
  runInNewContext(source("./TableCheckout.tsx"), {
    module: loaded, exports: loaded.exports, URLSearchParams,
    require(id) {
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (id === "react") return { useState: (initial) => [slot < states.length ? states[slot++] : initial, () => {}], useRef: (current) => ({ current }), useEffect() {}, useCallback: (fn) => fn };
      if (id === "next/navigation") return { useRouter: () => ({ push: (route) => routes.push(route), replace: (route) => routes.push(route) }) };
      if (id === "@/components/ToastProvider") return { useToast: () => ({ showToast: (message) => notices.push(message) }) };
      if (id === "@/components/ConfirmationProvider") return { useConfirmation: () => ({ requestConfirmation: async (options) => { confirmations.push(options); return confirm; } }) };
      if (id === "@/services/api/client") return { clientApi: async (...args) => { requests.push(args); return args[1]?.method ? {} : consumption; } };
      if (id === "@/utils/format") return { money: String };
      if (id === "@/utils/tableIdentity") return { tableLabel: (value) => "Mesa " + value.number };
      if (id === "./draft") return { staffApiMessage: (_, fallback) => fallback };
      if (id === "./presentation") return presentation;
      return new Proxy({}, { get: (_, key) => key });
    },
  });
  const tree = loaded.exports.TableCheckout({ table: { id: "table", number: "01", active: true, session: { id: "visit" } }, expectedSessionId, admin: { roles: ["ADMIN"] }, restaurantName: "Teste" });
  return { tree, nodes: descendants(tree), requests, routes, notices, confirmations };
}

test("checkout is a focused screen with authoritative total, received and balance", () => {
  const view = render();
  const summary = view.nodes.find((node) => node.props?.["aria-label"] === "Resumo do fechamento");
  for (const value of ["6601", "2000", "4601"]) assert.ok(JSON.stringify(summary).includes(value));
  assert.equal(view.nodes.filter((node) => node.type === "Payments").length, 1);
  for (const forbidden of ["Workbench", "ProductList", "TableServiceAlerts", "MobileBar"]) assert.ok(!view.nodes.some((node) => node.type === forbidden));
  assert.ok(!JSON.stringify(view.tree).includes("Adicionar itens"));
});

test("waiter without checkout permission never mounts receiving controls", () => {
  const view = render({ consumption: account({ canCheckout: false }) });
  assert.ok(!view.nodes.some((node) => node.type === "Payments"));
  assert.ok(JSON.stringify(view.tree).includes("Fechamento pelo caixa"));
});

test("a different visit blocks payment instead of silently switching accounts", () => {
  const view = render({ consumption: account({ session: { id: "new-visit", status: "CLOSING" } }) });
  assert.ok(!view.nodes.some((node) => node.type === "Payments"));
  assert.ok(JSON.stringify(view.tree).includes("A conta desta mesa mudou"));
});

test("opening checkout is read-only; starting closure is explicit and cancellable", async () => {
  for (const confirm of [false, true]) {
    const view = render({ consumption: account({ session: { id: "visit", status: "OPEN" } }), confirm });
    assert.equal(view.requests.length, 0);
    const start = view.nodes.find((node) => node.type === "Button" && node.props.children?.includes?.("Iniciar fechamento"));
    assert.ok(start);
    await start.props.onClick();
    const writes = view.requests.filter(([, init]) => init?.method === "POST");
    assert.equal(writes.length, confirm ? 1 : 0);
    if (confirm) assert.equal(writes[0][0], "admin/table-operations/table/request-bill");
  }
});

test("admin cannot start or force closure before every round is delivered", async () => {
  for (const status of ["RECEIVED", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"]) {
    const view = render({ consumption: account({ session: { id: "visit", status: "OPEN", payments: [] }, orders: [{ id: "served", status: "COMPLETED" }, { id: "pending", status }] }) });
    const start = view.nodes.find(node => node.type === "Button" && node.props.children?.includes?.("Iniciar fechamento"));
    const force = view.nodes.find(node => node.type === "Button" && node.props.children === "Encerrar sem recebimento");
    assert.equal(start.props.disabled, true, status);
    assert.equal(force.props.disabled, true, status);
    assert.ok(JSON.stringify(view.tree).includes("Aguarde a entrega de todos os itens"));
    await start.props.onClick();
    assert.equal(view.requests.filter(([, init]) => init?.method === "POST").length, 0);
    const legacy = render({ consumption: account({ session: { id: "visit", status: "CLOSING" }, orders: [{ id: "pending", status }] }) });
    assert.equal(legacy.nodes.find(node => node.type === "Payments").props.disabled, true);
  }
});

test("pending receipt blocks leaving and stale consumption blocks new receiving", async () => {
  const view = render({ blocked: true });
  assert.equal(await view.tree.props.beforeLeave(), false);
  assert.match(view.notices.at(-1), /operação pendente/);
  const back = view.nodes.find((node) => node.props?.["aria-label"] === "Voltar ao atendimento");
  assert.equal(back.props.disabled, true);
  const stale = render({ error: "Sem conexão" });
  assert.equal(stale.nodes.find((node) => node.type === "Payments").props.disabled, true);
  const ready = render();
  const button = ready.nodes.find((node) => node.props?.["aria-label"] === "Voltar ao atendimento");
  await button.props.onClick();
  assert.equal(ready.routes[0], "/hall?table=table");
});

test("confirmed settlement returns directly to hall without an intermediate completion message", async () => {
  const view = render();
  view.nodes.find(node => node.type === "Payments").props.onSettled();
  assert.deepEqual(view.routes, ["/hall"]);
  const lostResponse = render({ consumption: account({ session: null }) });
  assert.ok(!JSON.stringify(lostResponse.tree).includes("Atendimento encerrado"));
  await lostResponse.nodes.find(node => node.props?.["aria-label"] === "Atualizar conta").props.onClick();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(lostResponse.routes, ["/hall"]);
});

test("settlement redirects only after confirmation and does not show a completion toast", async () => {
  for (const failure of [false, true]) {
    let slot = 0, redirected = 0, refreshed = 0;
    const requests = [], notices = [], storage = new Map();
    const loaded = { exports: {} }, jsx = (type, props) => ({ type, props });
    runInNewContext(source("./Payments.tsx"), {
      module: loaded, exports: loaded.exports,
      sessionStorage: { setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
      require(id) {
        if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
        if (id === "react") return { useState: initial => [slot++ === 1 ? true : initial, () => {}], useRef: current => ({ current }), useEffect() {} };
        if (id === "react-hook-form") return { useForm: () => ({ control: {}, setValue() {}, resetField() {} }), useWatch: () => ({ mode: "ITEMS", splitCount: 1 }) };
        if (id === "@/components/ConfirmationProvider") return { useConfirmation: () => ({ requestConfirmation: async () => true }) };
        if (id === "@/components/ToastProvider") return { useToast: () => ({ showToast: value => notices.push(value) }) };
        if (id === "@/services/api/client") return { ApiError: class extends Error {}, clientApi: async (...args) => { requests.push(args); if (failure) throw Error("lost response"); return {}; } };
        if (id === "@/utils/format") return { money: String };
        if (id === "./paymentCalculation") return calculations;
        if (id === "./presentation") return presentation;
        return new Proxy({}, { get: (_, key) => key });
      },
    });
    const tree = loaded.exports.Payments({ tableId: "table", consumption: account({ session: { id: "visit", status: "CLOSING", payments: [{ mode: "ITEMS", splitCount: 0, amountCents: 6601, consumptionCents: 6001, serviceFeeCents: 600 }] } }), disabled: false, onSaved: async () => { refreshed++; }, onSettled: () => { redirected++; }, onBlockedChange() {} });
    const close = descendants(tree).find(node => node.type === "Button" && node.props.children?.includes?.("Encerrar conta paga"));
    assert.equal(close.props.disabled, false);
    await close.props.onClick();
    assert.equal(requests[0][0], "admin/table-operations/table/settle");
    assert.equal(redirected, failure ? 0 : 1);
    assert.equal(refreshed, failure ? 1 : 0);
    assert.deepEqual(notices, []);
    assert.equal(storage.size, failure ? 1 : 0, "inconclusive settlement must retain its retry payload");
  }
});

test("empty accounts without an expected visit still offer recovery", async () => {
  const view = render({ consumption: account({ session: null }), expectedSessionId: "" });
  assert.ok(JSON.stringify(view.tree).includes("Nenhuma conta aberta"));
  const back = view.nodes.find(node => node.type === "Button" && node.props.children?.includes?.("Voltar às mesas"));
  await back.props.onClick();
  assert.equal(view.routes[0], "/hall");
});

test("checkout query renders a separate screen and never fetches the product menu", async () => {
  const loaded = { exports: {} }, calls = [];
  const jsx = (type, props) => ({ type, props });
  runInNewContext(source("../../app/(product)/hall/page.tsx"), {
    module: loaded, exports: loaded.exports,
    require(id) {
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (id === "next/navigation") return { redirect: (url) => { throw Error("redirect " + url); } };
      if (id === "@/services/api/server") return {
        getAdminUser: async () => ({ roles: ["WAITER"], tenantSlug: "shop" }),
        getStaffTables: async () => [{ id: "table", active: true, session: { id: "visit" } }],
        getRestaurantConfig: async () => ({ name: "Teste" }),
        getMenu: async () => { calls.push("menu"); return {}; },
      };
      return new Proxy({}, { get: (_, key) => key });
    },
  });
  const tree = await loaded.exports.default({ searchParams: Promise.resolve({ table: "table", view: "checkout", session: "visit" }) });
  assert.deepEqual(calls, []);
  const checkout = descendants(tree).find((node) => node.type === "TableCheckout");
  assert.equal(checkout.props.expectedSessionId, "visit");
});
