import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import { tableLabel } from "../../utils/tableIdentity.ts";

const realRequire = createRequire(import.meta.url);
const tables = [{ id: "t12", number: "12", kind: "TABLE", active: true }, { id: "c12", number: "12", kind: "COMMAND", active: true }, { id: "t13", number: "13", kind: "TABLE", active: false }];
const walk = node => !node || typeof node !== "object" ? [] : Array.isArray(node) ? node.flatMap(walk) : [node, ...walk(node.props?.children)];
function renderManager({ filter = "", confirmed = true, fail = false, editing = null } = {}) {
  let index = 0;
  const requests = [], confirmations = [], toasts = [], writes = [], resets = [];
  class ApiError extends Error { constructor(status) { super("failed"); this.status = status; } }
  const jsx = (type, props) => ({ type, props }), loaded = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL("./TableManager.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  runInNewContext(source, { module: loaded, exports: loaded.exports,
    require(name) {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "zod" || name === "@hookform/resolvers/zod") return realRequire(name);
      if (name === "react") return { useRef: () => ({ current: null }), useState(initial) { const slot = index++; return [slot === 1 ? editing : slot === 7 ? filter : typeof initial === "function" ? initial() : initial, value => writes.push({ slot, value })]; } };
      if (name === "react-hook-form") return { useForm: () => ({ register: () => ({}), reset: value => resets.push(value), formState: { isSubmitting: false, errors: {} }, handleSubmit: fn => fn }) };
      if (name === "@/utils/tableIdentity") return { tableLabel };
      if (name === "@/components/ToastProvider") return { useToast: () => ({ showToast: (...args) => toasts.push(args) }) };
      if (name === "@/components/ConfirmationProvider") return { useConfirmation: () => ({ requestConfirmation: async value => { confirmations.push(value); return confirmed; } }) };
      if (name === "@/services/api/client") return { ApiError, clientApi: async (...args) => { requests.push(args); if (fail) throw new ApiError(409); } };
      return new Proxy({}, { get: (_, key) => String(key) });
    },
  });
  const nodes = walk(loaded.exports.TableManager({ initialTables: tables }));
  const deleteButton = id => walk(nodes.find(node => node.type === "TableCard" && node.props.children[0].props.children[0].props.children === tableLabel(tables.find(table => table.id === id)))).find(node => node.type === "Button" && JSON.stringify(node.props.children).includes("Excluir"));
  return { nodes, requests, confirmations, toasts, writes, resets, deleteButton };
}

test("number filter matches both table and command, preserves ordering and reports empty results", () => {
  const ui = renderManager({ filter: " 12 " });
  assert.deepEqual(ui.nodes.filter(node => node.type === "TableName").map(node => node.props.children), ["Mesa 12", "Comanda 12"]);
  assert.ok(JSON.stringify(ui.nodes.find(node => node.props?.role === "status").props.children).includes("2"));
  const input = ui.nodes.find(node => node.type === "Input" && node.props.type === "search");
  input.props.onChange({ target: { value: "13" } });
  assert.equal(ui.writes.at(-1).value, "13");
  const empty = renderManager({ filter: "999" });
  assert.ok(empty.nodes.some(node => node.type === "Empty" && node.props.children.includes("encontrada para este número")));
});
test("delete confirms exact identity, removes only selected row and resets its editor", async () => {
  const ui = renderManager({ editing: "c12" });
  await ui.deleteButton("c12").props.onClick();
  assert.ok(ui.confirmations[0].message.includes("Comanda 12"));
  assert.equal(ui.requests[0][0], "admin/tables/c12");
  assert.equal(ui.requests[0][1].method, "DELETE");
  assert.deepEqual(ui.writes.find(write => write.slot === 0).value(tables).map(table => table.id), ["t12", "t13"]);
  assert.ok(ui.writes.some(write => write.slot === 1 && write.value === null));
  assert.equal(ui.resets.length, 1);
  assert.equal(ui.toasts[0][0], "Cadastro excluído com sucesso.");
});
test("canceling confirmation never deletes; active-session conflict retains the row", async () => {
  const canceled = renderManager({ confirmed: false });
  await canceled.deleteButton("t12").props.onClick();
  assert.equal(canceled.requests.length, 0);
  const conflict = renderManager({ fail: true });
  await conflict.deleteButton("t12").props.onClick();
  assert.ok(!conflict.writes.some(write => write.slot === 0));
  assert.match(conflict.toasts[0][0], /Encerre o atendimento/);
  assert.equal(conflict.toasts[0][1], "error");
});
