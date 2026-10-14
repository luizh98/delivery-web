import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { getPresetDateRange } from "../../components/DateRangeFilter/dates.ts";

test("performance paginates ten items and options, resets filters and ignores stale responses", async () => {
  const slots = [];
  let cursor = 0;
  const effects = [];
  const requests = [];
  const require = createRequire(import.meta.url);
  const compiled = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL("./LazyAdminDashboard.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  runInNewContext(source, {
    module: compiled, exports: compiled.exports, AbortController, DOMException, URLSearchParams,
    window: { addEventListener() {}, removeEventListener() {} },
    require: (name) => {
      if (name === "react") return {
        useState: (initial) => {
          const index = cursor++;
          if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
          return [slots[index], (value) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
        },
        useRef: (initial) => {
          const index = cursor++;
          return slots[index] ??= { current: initial };
        },
        useCallback: (callback) => callback,
        useEffect: (callback, deps) => {
          const index = cursor++;
          const previous = slots[index];
          if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
            effects.push(() => {
              previous?.cleanup?.();
              slots[index] = { deps, cleanup: callback() };
            });
          }
        },
      };
      if (name === "@/services/api/client") return {
        clientApi: (path, options) => {
          if (!path.startsWith("admin/dashboard/performance?")) return Promise.resolve({ summary: {} });
          return new Promise((resolve, reject) => requests.push({
            params: new URLSearchParams(path.split("?")[1]), signal: options.signal, resolve, reject,
          }));
        },
      };
      if (name === "@/utils/format") return { money: String };
      if (name === "@/components/DateRangeFilter") return { DateRangeFilter: "DateRangeFilter", getPresetDateRange };
      if (name === "react/jsx-runtime") return require(name);
      return new Proxy({}, { get: (_, key) => key });
    },
  });
  function render() {
    cursor = 0;
    const nodes = [];
    function visit(node) {
      if (Array.isArray(node)) node.forEach(visit);
      else if (node?.props) { nodes.push(node); visit(node.props.children); }
    }
    visit(compiled.exports.AdminDashboardView());
    effects.splice(0).forEach((effect) => effect());
    return nodes;
  }
  const text = (node) => Array.isArray(node) ? node.map(text).join("") : node?.props ? text(node.props.children) : String(node ?? "");
  const button = (label) => render().find((node) => ["Button", "ToggleButton"].includes(node.type) && text(node) === label);
  const table = () => render().find((node) => node.type === "PerformanceTable");
  const tick = () => new Promise((resolve) => setImmediate(resolve));
  const latest = () => requests.at(-1);
  async function resolve(request = latest(), total = 23) {
    const page = Number(request.params.get("page"));
    const size = Number(request.params.get("size"));
    assert.equal(size, 10);
    request.resolve({
      items: Array.from({ length: Math.max(0, Math.min(size, total - page * size)) }, (_, index) => ({ id: page * size + index })),
      page, size, totalElements: total, totalPages: Math.ceil(total / size),
    });
    await tick();
    render();
  }
  function click(label) { button(label).props.onClick(); render(); }

  render();
  assert.equal(requests.length, 0);
  click("Carregar mais relatórios");
  click("Carregar mais relatórios");
  assert.equal(button("Próxima").props.disabled, true);
  await resolve();
  assert.equal(table().props.values.length, 10);
  assert.equal(button("Anterior").props.disabled, true);
  click("Próxima");
  await resolve();
  assert.equal(table().props.values[0].id, 10);
  click("Carregar mais relatórios");
  assert.equal(requests.length, 2, "loading another report must not reset the ranking");
  click("Próxima");
  await resolve();
  assert.equal(table().props.values.length, 3);
  assert.equal(button("Próxima").props.disabled, true);
  click("Anterior");
  await resolve();
  assert.equal(table().props.values[0].id, 10);

  click("Opcionais");
  assert.ok(table(), "switching modes keeps the ranking visible");
  assert.equal(latest().params.get("type"), "options");
  assert.equal(latest().params.get("page"), "0");
  await resolve();
  click("Próxima");
  const stale = latest();
  click("Itens");
  assert.equal(stale.signal.aborted, true);
  await resolve();
  await resolve(stale);
  assert.equal(table().props.values[0].id, 0);
  click("Próxima");
  latest().reject(new Error("network unavailable"));
  await tick();
  render();
  assert.equal(button("Próxima").props.disabled, true);
  click("Tentar novamente");
  assert.equal(latest().params.get("page"), "1");
  await resolve();
  assert.equal(table().props.values[0].id, 10);

  render().find((node) => node.type === "DateRangeFilter").props.onChange(getPresetDateRange("last7"));
  render();
  click("Carregar mais relatórios");
  click("Carregar mais relatórios");
  assert.equal(latest().params.get("page"), "0");
  await resolve();
  for (const total of [10, 1, 0]) {
    click(latest().params.get("type") === "items" ? "Opcionais" : "Itens");
    await resolve(latest(), total);
    assert.equal(table().props.values.length, total);
    assert.equal(button("Anterior").props.disabled, true);
    assert.equal(button("Próxima").props.disabled, true);
  }
});
