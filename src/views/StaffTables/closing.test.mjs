import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { draftItemTotal, normalizeTablePhone, staffApiMessage } from "./draft.ts";
import * as presentation from "./presentation.ts";

// Execute the component's real event handlers with a closing visit and a retained draft.
function renderClosing({ pending = null, status = "CLOSING", isAdmin = false, totals, askingPhone = false, dialogValues = {} } = {}) {
  const session = status ? { id: "visit", status } : null;
  const product = { id: "burger", name: "X-burger", priceCents: 2990, active: true, optionGroups: [] };
  const draft = { sessionId: session?.id ?? "", notes: "", items: [{ id: "line", product, quantity: 1, observations: "", options: [] }] };
  const state = new Map([[3, { session, orders: [], totals }], [4, { table: draft }]]);
  if (pending) state.set(17, true);
  if (askingPhone) state.set(12, true);
  const fields = {};
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
    crypto: { randomUUID: () => "00000000-0000-4000-8000-000000000001" },
    require(name) {
      if (name === "@/utils/tableIdentity") return { tableLabel: (table) => `${table.kind === "COMMAND" ? "Comanda" : "Mesa"} ${table.number}` };
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "react") return {
        useState(initial) { const slot = index++; return [state.has(slot) ? state.get(slot) : initial, (value) => writes.push({ slot, value })]; },
        useRef: (current) => ({ current: refIndex++ === 2 && pending ? pending : current }), useEffect() {}, useCallback: (fn) => fn,
      };
      if (name === "next/navigation") return { useRouter: () => ({ push() {} }) };
      if (name === "react-hook-form") return { useForm: () => ({
        formState: { errors: {} },
        register(name, options) { fields[name] = options; return { name }; },
        handleSubmit: (submit) => () => submit(dialogValues),
      }) };
      if (name === "@/components/ToastProvider") return { useToast: () => ({ showToast: (message, variant) => notifications.push({ message, variant }) }) };
      if (name === "@/components/ConfirmationProvider") return { useConfirmation: () => ({ requestConfirmation: async () => true }) };
      if (name === "@/services/api/client") return { ApiError: class extends Error {}, clientApi: (...args) => { requests.push(args); return Promise.resolve({}); } };
      if (name === "@/utils/format") return { money: (cents) => String(cents), statusLabel: (status) => status };
      if (name === "@/utils/productPricing") return { productSalePrice: (item) => item.priceCents };
      if (name === "./draft") return { draftItemTotal, normalizeTablePhone, staffApiMessage };
      if (name === "./presentation") return presentation;
      if (name === "@/utils/tableService") return { tableServiceLabels: {} };
      return new Proxy({}, { get: (_, key) => String(key) });
    },
  });
  const tree = loaded.exports.StaffTables({
    initialTables: [{ id: "table", number: "01", active: true, session, requests: [] }],
    initialMenu: { categories: [], products: [product] },
    initialTableId: "table", admin: { id: "waiter", roles: [isAdmin ? "ADMIN" : "WAITER"] }, restaurantName: "Teste",
  });
  function descendants(node) {
    if (!node || typeof node !== "object") return [];
    if (Array.isArray(node)) return node.flatMap(descendants);
    return [node, ...descendants(node.props?.children)];
  }
  const nodes = descendants(tree);
  const dialog = nodes.find((node) => typeof node.type === "function" && node.type.name === "PhoneDialog");
  return { nodes, notifications, writes, requests, fields, dialog, renderDialog: () => descendants(dialog.type(dialog.props)) };
}

test("opening asks for people and submits count with first round", async () => {
  const view = renderClosing({ status: null, askingPhone: true, dialogValues: { phone: "(11) 98888-7777", guestCount: "4" } });
  assert.equal(view.dialog.props.opening, true);
  const nodes = view.renderDialog();
  assert.ok(nodes.some((node) => node.props?.label === "Total de pessoas"));
  for (const invalid of ["", "0", "-1", "1.5", "1000", "abc"]) assert.notEqual(view.fields.guestCount.validate(invalid), true);
  for (const valid of ["1", "4", "999"]) assert.equal(view.fields.guestCount.validate(valid), true);
  await nodes.find((node) => node.type === "form").props.onSubmit();
  const posts = view.requests.filter(([, init]) => init?.method === "POST");
  assert.equal(posts.length, 1);
  const body = JSON.parse(posts[0][1].body);
  assert.equal(body.guestCount, 4);
  assert.equal(body.customerPhone, "11988887777");
});

test("existing visit contact does not ask for or overwrite people", async () => {
  const view = renderClosing({ status: "OPEN", askingPhone: true, dialogValues: { phone: "11988887777" } });
  assert.equal(view.dialog.props.opening, false);
  const nodes = view.renderDialog();
  assert.ok(!nodes.some((node) => node.props?.label === "Total de pessoas"));
  await nodes.find((node) => node.type === "form").props.onSubmit();
  const post = view.requests.find(([, init]) => init?.method === "POST");
  assert.ok(post);
  assert.ok(!Object.hasOwn(JSON.parse(post[1].body), "guestCount"));
});

test("canceling opening keeps draft and sends nothing", () => {
  const view = renderClosing({ status: null, askingPhone: true });
  view.dialog.props.onClose();
  assert.equal(view.requests.length, 0);
  assert.ok(!view.writes.some(({ slot }) => slot === 4));
});

test("first round opens the contact and people dialog before any request", async () => {
  const view = renderClosing({ status: null });
  const send = view.nodes.find((node) => node.type === "Button" && node.props?.children?.some?.((child) => typeof child === "string" && child.includes("à cozinha")));
  assert.ok(send);
  send.props.onClick();
  await Promise.resolve();
  assert.ok(view.writes.some(({ slot, value }) => slot === 12 && value === true));
  assert.equal(view.requests.length, 0);
});

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

test("staff account uses server total and shows service fee separately", () => {
  const view = renderClosing({ totals: { consumptionCents: 2005, serviceFeeBasisPoints: 1000, serviceFeeCents: 201, totalCents: 2206 } });
  const details = view.nodes.find(node => node.props?.["aria-label"] === "Composição da conta");
  const text = JSON.stringify(details);
  for (const value of ["2005", "201", "Taxa de serviço ("]) assert.ok(text.includes(value));
  const summary = view.nodes.find(node => node.type === "AccountTotal");
  assert.ok(JSON.stringify(summary).includes("2206"));
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
  const pending = { tableId: "table", body: JSON.stringify({ submissionId: "original-id", guestCount: 4, items: [{ productId: "burger", quantity: 1 }] }) };
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

test("waiter can request closing directly in the summary; only admin sees final closure", () => {
  for (const isAdmin of [false, true]) {
    const { nodes } = renderClosing({ status: "OPEN", isAdmin });
    const summary = nodes.find((node) => node.type === "AccountPanel");
    assert.ok(summary);
    const text = JSON.stringify(summary);
    assert.ok(text.includes("Pedir fechamento"));
    assert.equal(text.includes("Encerrar comanda"), isAdmin);
    const workbench = nodes.find((node) => node.type === "Workbench");
    assert.ok(!JSON.stringify(workbench).includes("Encerrar comanda"));
  }
});

test("selecting another alert for the current table refreshes without clearing consumption", async () => {
  const view = renderClosing();
  const alerts = view.nodes.find((node) => node.type === "TableServiceAlerts");
  alerts.props.onSelect("table");
  await Promise.resolve();
  assert.equal(view.requests[0]?.[0], "admin/table-operations/table/orders", "same-table alert must fetch immediately instead of waiting for polling");
  assert.ok(!view.writes.some(({ slot, value }) => slot === 3 && value === null), "known total must remain visible during refresh");
});
