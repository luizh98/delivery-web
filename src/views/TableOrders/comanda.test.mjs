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
  const navigation = [];
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
      if (name === "next/navigation") return { useRouter: () => ({ push: url => navigation.push(url) }) };
      if (name === "@/utils/format") return { money: (value) => String(value), statusLabel: (status) => status };
      if (name === "@/utils/productAvailability") return { tableMenuPath: () => "/menu?mesa=token" };
      return new Proxy({}, { get: (_, key) => String(key) });
    },
  });
  const tree = loaded.exports.TableOrders({ token: "token", table: { number: "01", session: { id: "visit", participationId: "participation", status: "OPEN" } } });
  const walk = (node) => !node || typeof node !== "object" ? [] : Array.isArray(node) ? node.flatMap(walk) : [node, ...walk(node.props?.children)];
  return { nodes: walk(tree), load, navigation };
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

function mountHold(disabled = false) {
  const hooks = [], effects = [], timers = new Map(), listeners = new Map();
  let cursor = 0, now = 0, nextId = 0, calls = 0;
  const loaded = { exports: {} };
  const jsx = (type, props) => ({ type, props });
  const events = {
    visibilityState: "visible",
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
  };
  runInNewContext(ts.transpileModule(readFileSync(new URL("./index.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, {
    module: loaded, exports: loaded.exports, window: events, document: events,
    setTimeout(fn, ms) { const id = ++nextId; timers.set(id, { fn, at: now + ms }); return id; },
    clearTimeout: id => timers.delete(id),
    require(name) {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "react") return {
        useState(initial) { const i = cursor++; if (!(i in hooks)) hooks[i] = initial; return [hooks[i], value => { hooks[i] = value; }]; },
        useRef(initial) { const i = cursor++; return hooks[i] ??= { current: initial }; },
        useCallback(fn) { const i = cursor++; return hooks[i] ??= fn; },
        useEffect(fn, deps) {
          const i = cursor++, previous = hooks[i];
          if (!previous || deps.some((dep, index) => dep !== previous.deps[index])) {
            previous?.cleanup?.();
            hooks[i] = { deps };
            effects.push(() => { hooks[i].cleanup = fn(); });
          }
        },
      };
      return new Proxy({}, { get: (_, key) => String(key) });
    },
  });
  return {
    get calls() { return calls; }, events, listeners,
    render(nextDisabled = disabled) {
      disabled = nextDisabled; cursor = 0;
      const button = loaded.exports.HoldToCallButton({ disabled, called: false, onConfirm: () => calls++ });
      effects.splice(0).forEach(fn => fn());
      return button.props;
    },
    advance(ms) { now += ms; for (const [id, timer] of timers) if (timer.at <= now) { timers.delete(id); timer.fn(); } },
    unmount() { hooks.forEach(hook => hook?.cleanup?.()); },
  };
}

const pointer = { isPrimary: true, button: 0 };
const key = (value, repeat = false) => ({ key: value, repeat, preventDefault() {} });

test("waiter requires a continuous 3-second hold and ignores ordinary clicks", () => {
  const mounted = mountHold();
  let button = mounted.render();
  assert.equal(button.onClick, undefined);
  button.onPointerDown(pointer);
  mounted.advance(2999);
  assert.equal(mounted.calls, 0);
  button = mounted.render();
  assert.ok(button.children.some(child => child?.type === "HoldProgress"));
  mounted.advance(1);
  assert.equal(mounted.calls, 1);
  mounted.advance(6000);
  button.onPointerUp();
  assert.equal(mounted.calls, 1);
});

test("release, leave, cancellation, blur, hidden page, disabling and unmount cancel the hold", () => {
  for (const cancel of ["onPointerUp", "onPointerLeave", "onPointerCancel", "onBlur", "blur", "hidden", "disabled", "unmount"]) {
    const mounted = mountHold();
    const button = mounted.render();
    button.onPointerDown(pointer);
    mounted.advance(1500);
    if (cancel === "hidden") { mounted.events.visibilityState = "hidden"; mounted.listeners.get("visibilitychange")(); }
    else if (cancel === "blur") mounted.listeners.get("blur")();
    else if (cancel === "disabled") mounted.render(true);
    else if (cancel === "unmount") mounted.unmount();
    else button[cancel]();
    mounted.advance(3000);
    assert.equal(mounted.calls, 0, cancel);
  }
});

test("new hold restarts from zero; keyboard supports Space and Enter without repeat calls", () => {
  for (const value of [" ", "Enter"]) {
    const mounted = mountHold();
    const button = mounted.render();
    button.onKeyDown(key(value)); mounted.advance(2000); button.onKeyUp(key(value));
    button.onKeyDown(key(value)); mounted.advance(2999);
    assert.equal(mounted.calls, 0);
    mounted.advance(1);
    button.onKeyDown(key(value, true)); mounted.advance(3000);
    assert.equal(mounted.calls, 1);
  }
});

test("disabled button and secondary pointers cannot start a call", () => {
  const mounted = mountHold(true);
  mounted.render().onPointerDown(pointer); mounted.advance(3000);
  assert.equal(mounted.calls, 0);
  const button = mounted.render(false);
  button.onPointerDown({ isPrimary: false, button: 0 });
  button.onPointerDown({ isPrimary: true, button: 2 }); mounted.advance(3000);
  assert.equal(mounted.calls, 0);
});

test("footer uses outline button and preserves the table menu URL", () => {
  const { nodes, navigation } = renderComanda();
  const footer = nodes.find(node => node.type === "Footer");
  const button = footer.props.children;
  assert.equal(button.type, "Button");
  assert.equal(button.props.variant, "outline");
  assert.ok(button.props.children.includes("Voltar ao cardápio"));
  button.props.onClick();
  assert.deepEqual(navigation, ["/menu?mesa=token"]);
});

test("confirmed hold retains the service request and visit identity", async () => {
  const requests = [];
  const { nodes } = renderComanda(async (path, options) => {
    if (options?.method === "POST") requests.push({ path, body: JSON.parse(options.body) });
    return consumption;
  });
  const button = nodes.find(node => node.type?.name === "HoldToCallButton");
  assert.equal(button.props.disabled, false);
  await button.props.onConfirm();
  assert.deepEqual(requests, [{ path: "public/tables/token/service-requests", body: { type: "SERVICE", participationId: "participation" } }]);
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
