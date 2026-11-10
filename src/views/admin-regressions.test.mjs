import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
require("tsx/cjs");

function render(file, { role = "WAITER", auditPage = null } = {}) {
  let schema;
  const requests = [];
  const loaded = { exports: {} };
  const jsx = (type, props) => ({ type, props });
  const source = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  runInNewContext(source, {
    module: loaded, exports: loaded.exports, URLSearchParams,
    require(name) {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "react") return {
        useState: (initial) => [initial === null && auditPage ? auditPage : initial === true ? false : initial, () => {}],
        useEffect() {},
      };
      if (name === "@hookform/resolvers/zod") return { zodResolver: (value) => { schema = value; } };
      if (name === "react-hook-form") return {
        useWatch: () => role,
        useForm: () => ({ register: (name) => ({ name }), handleSubmit: (fn) => fn, formState: { errors: {} } }),
      };
      if (name === "@/utils/adminAuth") return require("../utils/adminAuth.ts");
      if (name === "./format") return require("./AdminAuditLogs/format.ts");
      if (name === "zod") return require("zod");
      if (name === "@/components/ToastProvider") return { useToast: () => ({ showToast() {} }) };
      if (name === "@/components/ConfirmationProvider") return { useConfirmation: () => ({}) };
      if (name === "@/services/api/client") return { clientApi: (...args) => { requests.push(args); return Promise.resolve({}); } };
      return new Proxy({}, { get: (_, key) => String(key) });
    },
  });
  const tree = auditPage ? loaded.exports.AdminAuditLogsView() : loaded.exports.UserManager({ initialUsers: [], currentAdminId: "admin" });
  function descendants(node) {
    if (!node || typeof node !== "object") return [];
    if (Array.isArray(node)) return node.flatMap(descendants);
    return [node, ...descendants(node.props?.children)];
  }
  return { nodes: descendants(tree), schema, requests };
}

test("waiter create/edit form exposes and requires a trimmed name", () => {
  const view = render("./AdminUsers/UserManager.tsx");
  assert.ok(view.nodes.some((node) => node.type === "Field" && node.props.label === "Nome do garçom"));
  const values = { name: "", email: "waiter@example.com", phone: "", password: "password1", role: "WAITER", active: true };
  for (const name of ["", "   "]) assert.equal(view.schema.safeParse({ ...values, name }).success, false);
  assert.equal(view.schema.parse({ ...values, name: " Ana " }).name, "Ana");
  assert.equal(view.schema.safeParse({ ...values, role: "ENTREGADOR" }).success, false);
  assert.equal(view.schema.safeParse({ ...values, role: "ADMIN" }).success, true);
});

test("audit history renders automatic authors with null roles alongside staff authors", () => {
  const entry = { id: "automatic", actor: { id: "", name: "Fila WhatsApp", email: "", roles: null }, createdAt: "2026-11-10T10:00:00Z", action: "UPDATE", collection: "orders", documentIds: ["order"], status: "APPLIED", changes: [], source: "whatsapp_queue" };
  const { nodes } = render("./AdminAuditLogs/index.tsx", {
    auditPage: { items: [entry, { ...entry, id: "staff", actor: { id: "waiter", name: "Ana", email: "ana@example.com", roles: ["WAITER"] } }], page: 0, totalElements: 2, totalPages: 1 },
  });
  const text = JSON.stringify(nodes);
  assert.ok(text.includes("Fila WhatsApp"));
  assert.ok(text.includes("WAITER"));
});
