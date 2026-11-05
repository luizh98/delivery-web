import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { draftItemTotal, normalizeTablePhone, staffApiMessage } from "./draft.ts";

// Execute the component's real event handlers with a closing visit and a retained draft.
function renderClosing({ pending = null } = {}) {
  const session = { id: "visit", status: "CLOSING" };
  const product = { id: "burger", name: "X-burger", priceCents: 2990, active: true, optionGroups: [] };
  const draft = { sessionId: "visit", notes: "", items: [{ id: "line", product, quantity: 1, observations: "", options: [] }] };
  const state = new Map([[3, { session, orders: [] }], [4, { table: draft }]]);
  if (pending) state.set(17, true);
  const notifications = [];
  const writes = [];
  const requests = [];
  let index = 0;
  let refIndex = 0;
  const loaded = { exports: {} };
  const jsx = (type, props) => ({ type, props });
  const source = ts.transpileModule(readFileSync(new URL("./index.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  runInNewContext(source, {
    module: loaded, exports: loaded.exports,
    require(name) {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "react") return {
        useState(initial) { const slot = index++; return [state.has(slot) ? state.get(slot) : initial, (value) => writes.push({ slot, value })]; },
        useRef: (current) => ({ current: refIndex++ === 2 && pending ? pending : current }), useEffect() {}, useCallback: (fn) => fn,
      };
      if (name === "next/navigation") return { useRouter: () => ({ push() {} }) };
      if (name === "@/components/ToastProvider") return { useToast: () => ({ showToast: (message, variant) => notifications.push({ message, variant }) }) };
      if (name === "@/components/ConfirmationProvider") return { useConfirmation: () => ({ requestConfirmation: async () => true }) };
      if (name === "@/services/api/client") return { ApiError: class extends Error {}, clientApi: (...args) => { requests.push(args); return Promise.resolve({}); } };
      if (name === "@/utils/format") return { money: (cents) => String(cents), statusLabel: (status) => status };
      if (name === "@/utils/productPricing") return { productSalePrice: (item) => item.priceCents };
      if (name === "./draft") return { draftItemTotal, normalizeTablePhone, staffApiMessage };
      if (name === "@/utils/tableService") return { tableServiceLabels: {} };
      return new Proxy({}, { get: (_, key) => String(key) });
    },
  });
  const tree = loaded.exports.StaffTables({
    initialTables: [{ id: "table", number: "01", active: true, session, requests: [] }],
    initialMenu: { categories: [], products: [product] },
    initialTableId: "table", admin: { id: "waiter", roles: ["WAITER"] }, restaurantName: "Teste",
  });
  function descendants(node) {
    if (!node || typeof node !== "object") return [];
    if (Array.isArray(node)) return node.flatMap(descendants);
    return [node, ...descendants(node.props?.children)];
  }
  return { nodes: descendants(tree), notifications, writes, requests };
}

test("closing table product attempt reports warning without editing the round", () => {
  const view = renderClosing();
  const button = view.nodes.find((node) => node.props?.["aria-label"] === "Adicionar X-burger");
  assert.ok(button);
  assert.notEqual(button.props.disabled, true, "attempt must reach explanatory feedback instead of native disabled silence");
  button.props.onClick();
  assert.match(view.notifications.at(-1)?.message ?? "", /Conta em fechamento/);
  assert.equal(view.notifications.at(-1)?.variant, "warning");
  assert.equal(view.writes.length, 0);
  assert.equal(view.requests.length, 0);
});

test("closing table send attempt reports warning without issuing an order", async () => {
  const view = renderClosing();
  const button = view.nodes.find((node) => node.type === "Button" && node.props?.children?.some?.((child) => typeof child === "string" && child.includes("à cozinha")));
  assert.ok(button);
  assert.notEqual(button.props.disabled, true, "send attempt must explain closing state");
  button.props.onClick();
  await Promise.resolve();
  assert.match(view.notifications.at(-1)?.message ?? "", /Conta em fechamento/);
  assert.equal(view.requests.length, 0);
  assert.equal(view.writes.length, 0);
});

test("closing notice with reopen action is outside the mobile-hidden workbench", () => {
  const view = renderClosing();
  const notice = view.nodes.find((node) => node.props?.id === "table-closing-notice");
  assert.ok(notice, "persistent closing notice must exist in both mobile panes");
  assert.equal(notice.props.role, "status");
  const workbench = view.nodes.find((node) => node.type === "Workbench");
  assert.ok(workbench);
  assert.ok(!JSON.stringify(workbench).includes('"id":"table-closing-notice"'));
});

test("closing visit still allows checking an uncertain prior submission with the same payload", async () => {
  const pending = { tableId: "table", body: JSON.stringify({ submissionId: "original-id", items: [{ productId: "burger", quantity: 1 }] }) };
  const view = renderClosing({ pending });
  const button = view.nodes.find((node) => node.type === "Button" && node.props?.children?.includes?.("Conferir envio"));
  assert.ok(button);
  assert.notEqual(button.props.disabled, true);
  button.props.onClick();
  await Promise.resolve();
  const posts = view.requests.filter(([, init]) => init?.method === "POST");
  assert.equal(posts.length, 1);
  assert.equal(posts[0][1].body, pending.body);
});
