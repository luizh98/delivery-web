import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import { tableLabel } from "../../utils/tableIdentity.ts";

const realRequire = createRequire(import.meta.url);
function renderBulk(api = async () => ({ created: [{ id: "c1", number: "1", kind: "COMMAND" }], existing: ["2"], failed: ["3"] }), { open = true, submitting = false } = {}) {
  const values = { kind: "COMMAND", start: 1, end: 3 }, requests = [], updates = [], writes = [];
  let resolver;
  let stateIndex = 0;
  const lifecycle = [];
  const dialog = { showModal: () => lifecycle.push("open"), close: () => lifecycle.push("close") };
  const loaded = { exports: {} }, jsx = (type, props) => ({ type, props });
  const source = ts.transpileModule(readFileSync(new URL("./BulkTableForm.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  runInNewContext(source, { module: loaded, exports: loaded.exports,
    require(name) {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "zod" || name === "@hookform/resolvers/zod") return realRequire(name);
      if (name === "react") return { useState: value => [stateIndex++ === 2 ? open : value, next => writes.push(next)], useRef: () => ({ current: dialog }), useEffect: fn => fn() };
      if (name === "react-hook-form") return { useWatch: () => [values.start, values.end], useForm: options => {
        resolver = options.resolver;
        return { register: () => ({}), watch: name => values[name], formState: { errors: {}, isSubmitting: submitting }, handleSubmit: fn => () => fn(values) };
      } };
      if (name === "@/services/api/client") return { clientApi: (...args) => { requests.push(args); return api(...args); } };
      return new Proxy({}, { get: (_, key) => String(key) });
    },
  });
  const tree = loaded.exports.BulkTableForm({ disabled: false, onComplete: data => updates.push(data) });
  const walk = node => !node || typeof node !== "object" ? [] : Array.isArray(node) ? node.flatMap(walk) : [node, ...walk(node.props?.children)];
  return { nodes: walk(tree), requests, updates, writes, lifecycle, validate: value => resolver(value, {}, { fields: {}, shouldUseNativeValidation: false }) };
}

test("bulk fields stay hidden until requested and dialog closes by button or Escape", () => {
  const closed = renderBulk(undefined, { open: false });
  assert.ok(!closed.nodes.some(node => node.type === "Form"));
  const trigger = closed.nodes.find(node => node.props?.["aria-haspopup"] === "dialog");
  assert.equal(trigger.props.type, "button");
  trigger.props.onClick();
  assert.equal(closed.writes.at(-1), true);
  const opened = renderBulk();
  assert.deepEqual(opened.lifecycle, ["open"]);
  opened.nodes.find(node => node.props?.["aria-label"] === "Fechar cadastro em massa").props.onClick();
  assert.equal(opened.writes.at(-1), false);
  let prevented = false;
  opened.nodes.find(node => node.type === "BulkDialog").props.onCancel({ preventDefault: () => { prevented = true; } });
  assert.ok(prevented);
  assert.equal(opened.lifecycle.at(-1), "close");
});
test("bulk dialog cannot be dismissed while a batch is being submitted", () => {
  const ui = renderBulk(undefined, { submitting: true });
  const close = ui.nodes.find(node => node.props?.["aria-label"] === "Fechar cadastro em massa");
  assert.equal(close.props.disabled, true);
  ui.nodes.find(node => node.type === "BulkDialog").props.onCancel({ preventDefault() {} });
  assert.deepEqual(ui.lifecycle, ["open"]);
  assert.equal(ui.writes.length, 0);
});

test("bulk form sends selected type and range, adds only created records and preserves partial result", async () => {
  const ui = renderBulk();
  await ui.nodes.find(node => node.type === "Form").props.onSubmit();
  assert.equal(ui.requests[0][0], "admin/tables/bulk");
  assert.deepEqual(JSON.parse(ui.requests[0][1].body), { kind: "COMMAND", start: 1, end: 3 });
  assert.equal(ui.updates[0][0].kind, "COMMAND");
  assert.equal(ui.writes.at(-1).failed[0], "3");
});
test("bulk form validates range before submitting and explains safe retry on network failure", async () => {
  const ui = renderBulk(async () => { throw new Error("network"); });
  for (const value of [{ kind: "COMMAND", start: 3, end: 1 }, { kind: "TABLE", start: 1, end: 501 }, { kind: "OTHER", start: 1, end: 2 }]) {
    assert.ok(Object.keys((await ui.validate(value)).errors).length);
  }
  assert.equal(Object.keys((await ui.validate({ kind: "TABLE", start: 1, end: 500 })).errors).length, 0);
  await ui.nodes.find(node => node.type === "Form").props.onSubmit();
  assert.ok(ui.writes.at(-1).includes("números já cadastrados serão preservados"));
  assert.equal(ui.updates.length, 0);
});
test("command identity differs from legacy shared table with same number", () => {
  assert.equal(tableLabel({ number: "1" }), "Mesa 1");
  assert.equal(tableLabel({ number: "1", kind: "COMMAND" }), "Comanda 1");
});
