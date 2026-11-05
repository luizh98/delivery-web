import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const consumption = {
  session: { id: "visit", status: "OPEN" }, requests: [],
  orders: [{ id: "order", orderNumber: "1042", status: "PREPARING", items: [{ name: "Produto", quantity: 1, totalCents: 2990 }], totals: { totalCents: 2990 } }],
};

function renderComanda(clientApi = async () => consumption) {
  let stateIndex = 0;
  let load;
  const loaded = { exports: {} };
  const jsx = (type, props) => ({ type, props });
  const compiled = ts.transpileModule(readFileSync(new URL("./index.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  runInNewContext(compiled, {
    module: loaded, exports: loaded.exports, AbortController, URLSearchParams,
    require(name) {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "react") return {
        useState: (initial) => [stateIndex++ === 0 ? consumption : initial, () => {}],
        useRef: (current) => ({ current }), useEffect() {}, useCallback: (callback) => { load = callback; return callback; },
      };
      if (name === "@/services/api/client") return { clientApi };
      if (name === "@/utils/format") return { money: (value) => String(value), statusLabel: (status) => status };
      if (name === "@/utils/productAvailability") return { tableMenuPath: () => "/menu?mesa=token" };
      return new Proxy({}, { get: (_, key) => String(key) });
    },
  });
  const tree = loaded.exports.TableOrders({ token: "token", table: { number: "01", session: { id: "visit", participationId: "participation", status: "OPEN" } } });
  const walk = (node) => !node || typeof node !== "object" ? [] : Array.isArray(node) ? node.flatMap(walk) : [node, ...walk(node.props?.children)];
  return { nodes: walk(tree), load };
}

test("Comanda exposes total and closing before order details, without manual refresh", () => {
  const { nodes } = renderComanda();
  const total = nodes.findIndex((node) => node.type === "Total");
  const actions = nodes.findIndex((node) => node.props?.["aria-label"] === "Atendimento e fechamento");
  const orders = nodes.findIndex((node) => node.props?.["aria-label"] === "Pedidos da comanda");
  assert.ok(total >= 0 && total < actions && actions < orders);
  assert.ok(nodes.some((node) => node.type === "h1" && node.props.children.includes(" Comanda")));
  assert.ok(!nodes.some((node) => node.type === "Button" && JSON.stringify(node.props.children).includes("Atualizar")));
});

test("automatic consumption refresh has one in-flight request and can resume after completion", async () => {
  const pending = [];
  const { load } = renderComanda((path) => new Promise((resolve) => pending.push({ path, resolve })));
  const first = load();
  await load();
  assert.equal(pending.length, 1);
  assert.match(pending[0].path, /participationId=participation/);
  pending[0].resolve(consumption);
  await first;
  const next = load();
  assert.equal(pending.length, 2);
  pending[1].resolve(consumption);
  await next;
});
