import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = ts.transpileModule(readFileSync(new URL("./AttentionAction.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

function setup(kind, api, confirm = true) {
  const requests = [];
  const toasts = [];
  const confirmations = [];
  let refreshes = 0;
  let task;
  let inTransition = false;
  const deferredUpdates = [];
  const busy = { current: false };
  class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
  const compiled = { exports: {} };
  runInNewContext(source, {
    module: compiled, exports: compiled.exports, JSON, encodeURIComponent,
    require: (name) => {
      if (name === "react") return {
        useRef: () => busy,
        useState: (initial) => [initial, () => {}],
        useTransition: () => [false, (fn) => {
          inTransition = true;
          try { task = fn(); } finally { inTransition = false; }
        }],
      };
      if (name === "next/navigation") return { useRouter: () => ({ refresh: () => refreshes++ }) };
      if (name === "@/components/ConfirmationProvider") return { useConfirmation: () => ({ requestConfirmation: async (value) => { if (inTransition) deferredUpdates.push("confirmation"); confirmations.push(value); return confirm; } }) };
      if (name === "@/components/ToastProvider") return { useToast: () => ({ showToast: (...args) => toasts.push(args) }) };
      if (name === "@/services/api/client") return { ApiError, clientApi: async (...args) => { if (inTransition) deferredUpdates.push("request"); requests.push(args); return api(...args); } };
      if (name === "react/jsx-runtime") return require(name);
      return new Proxy({}, { get: (_, key) => key });
    },
  });
  const button = compiled.exports.AttentionAction({ id: "item", name: "123", kind });
  return { requests, toasts, confirmations, deferredUpdates, ApiError, button, click: () => button.props.onClick() ?? task, refreshes: () => refreshes };
}

test("confirmation renders outside the transition that would wait for its answer", async () => {
  const state = setup("order", () => ({}));
  await state.click();
  assert.deepEqual(state.deferredUpdates, [], "a transition awaiting confirmation prevents its dialog from committing");
});

test("activation starts independently of other pending action transitions", async () => {
  const state = setup("product", () => [{ id: "item", active: false }]);
  await state.click();
  assert.deepEqual(state.deferredUpdates, []);
  assert.equal(state.requests.length, 2);
});

test("activation preserves current catalog data and prevents duplicate submissions", async () => {
  const current = { id: "item", active: false, name: "Nome atualizado", priceCents: 2300, imageUrl: "/photo", videoUrl: "/video", optionGroups: [{ deleted: true, items: [{ active: false }] }] };
  let resolve;
  const state = setup("product", (path) => path === "admin/products" ? new Promise((done) => { resolve = done; }) : {});
  const pending = state.click();
  state.click();
  assert.equal(state.requests.length, 1);
  resolve([current]);
  await pending;
  const [path, options] = state.requests[1];
  assert.equal(path, "admin/products/item");
  assert.equal(options.method, "PUT");
  assert.deepEqual(JSON.parse(options.body), { ...current, active: true });
  assert.equal(state.confirmations.length, 0);
  assert.equal(state.refreshes(), 1);
});

test("active or removed products are not overwritten", async () => {
  for (const products of [[{ id: "item", active: true }], []]) {
    const state = setup("product", () => products);
    await state.click();
    assert.equal(state.requests.length, 1);
    assert.equal(state.refreshes(), 1);
    assert.equal(state.toasts[0][1] === "error", products.length === 0);
  }
});

test("completion requires confirmation and sends only final status", async () => {
  for (const confirmed of [false, true]) {
    const state = setup("order", () => ({}), confirmed);
    await state.click();
    assert.equal(state.confirmations.length, 1);
    assert.equal(state.requests.length, confirmed ? 1 : 0);
    assert.equal(state.refreshes(), confirmed ? 1 : 0);
    if (confirmed) {
      assert.equal(state.requests[0][0], "admin/orders/item/status");
      assert.equal(state.requests[0][1].method, "PATCH");
      assert.deepEqual(JSON.parse(state.requests[0][1].body), { status: "COMPLETED" });
    }
  }
});

test("failures show an error, keep the row and allow retry", async () => {
  for (const kind of ["product", "order"]) {
    const state = setup(kind, () => { throw new Error("offline"); });
    await state.click();
    await state.click();
    assert.equal(state.toasts.length, 2);
    assert.equal(state.toasts[0][1], "error");
    assert.equal(state.refreshes(), 0);
  }
});

test("category validation is shown when activation is refused", async () => {
  const state = setup("product", (path) => {
    if (path === "admin/products") return [{ id: "item", active: false }];
    throw new state.ApiError(400, JSON.stringify({ message: "A categoria selecionada está inativa." }));
  });
  await state.click();
  assert.equal(state.toasts[0][0], "A categoria selecionada está inativa.");
  assert.equal(state.toasts[0][1], "error");
  assert.equal(state.refreshes(), 0);
});
