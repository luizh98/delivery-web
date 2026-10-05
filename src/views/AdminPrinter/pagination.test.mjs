import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";

test("printer history paginates ten jobs, preserves reprinting and resets after refresh", async () => {
  const state = [];
  let cursor = 0;
  let jobs = Array.from({ length: 23 }, (_, index) => ({
    id: `job-${index}`, destination: "RECEIPT", status: "PRINTED",
    createdAt: new Date(Date.UTC(2026, 9, 5, 12, 0, -index)).toISOString(),
  }));
  const reprinted = [];
  const require = createRequire(import.meta.url);
  const compiled = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL("./index.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  runInNewContext(source, {
    module: compiled, exports: compiled.exports,
    require: (name) => {
      if (name === "react") return {
        useState: (initial) => {
          const index = cursor++;
          if (!(index in state)) state[index] = initial;
          return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
        },
        useCallback: (callback) => callback, useMemo: (callback) => callback(), useEffect: () => {},
      };
      if (name === "@/components/ToastProvider") return { useToast: () => ({ showToast: () => {} }) };
      if (name === "@/services/printing/connector") return {
        getPrintOverview: async () => ({ devices: [], printers: [], destinations: [] }),
        getPrintJobs: async () => ({ jobs }), reprintJob: async (id) => { reprinted.push(id); },
      };
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
    visit(compiled.exports.AdminPrinterView({ connectorServerUrl: null }));
    return nodes;
  }
  const text = (node) => Array.isArray(node) ? node.map(text).join("") : node?.props ? text(node.props.children) : String(node ?? "");
  const button = (label) => render().find((node) => node.type === "Button" && text(node) === label);
  const rows = () => render().filter((node) => node.type === "DeviceRow");
  const tick = () => new Promise((resolve) => setImmediate(resolve));
  async function refresh() { button("Atualizar").props.onClick(); await tick(); }

  await refresh();
  assert.deepEqual(rows().map((node) => node.key), jobs.slice(0, 10).map((job) => job.id));
  assert.equal(button("Anterior").props.disabled, true);
  button("Próxima").props.onClick();
  assert.deepEqual(rows().map((node) => node.key), jobs.slice(10, 20).map((job) => job.id));
  button("Próxima").props.onClick();
  assert.equal(rows().length, 3);
  assert.equal(button("Próxima").props.disabled, true);
  button("Anterior").props.onClick();
  button("Reimprimir").props.onClick();
  await tick();
  assert.deepEqual(reprinted, ["job-10"]);
  assert.equal(rows()[0].key, "job-0");
  button("Próxima").props.onClick();
  await refresh();
  assert.equal(rows()[0].key, "job-0");
  for (const count of [10, 1, 0]) {
    jobs = jobs.slice(0, count);
    await refresh();
    assert.equal(rows().length, count);
    if (count) {
      assert.equal(button("Anterior").props.disabled, true);
      assert.equal(button("Próxima").props.disabled, true);
    } else assert.ok(render().some((node) => text(node) === "Nenhum trabalho de impressão."));
  }
  jobs = null;
  await refresh();
  assert.equal(rows().length, 0);
});
