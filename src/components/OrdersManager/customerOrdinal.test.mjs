import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("./index.tsx", import.meta.url), "utf8");
const ast = ts.createSourceFile("index.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let customerRow;
function visit(node) {
  if (ts.isJsxElement(node) && node.openingElement.tagName.getText(ast) === "CustomerNameRow") customerRow = node.getText(ast);
  ts.forEachChild(node, visit);
}
visit(ast);
assert.ok(customerRow);

function render(deliveryType) {
  const loaded = { exports: {} };
  const jsx = (type, props) => ({ type, props });
  runInNewContext(ts.transpileModule(`export const row = ${customerRow};`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, {
    exports: loaded.exports,
    require: () => ({ jsx, jsxs: jsx }),
    CustomerNameRow: "CustomerNameRow", CustomerName: "CustomerName", CustomerOrderBadge: "CustomerOrderBadge",
    order: { deliveryType, customer: { name: deliveryType === "TABLE" ? "Mesa 01" : "Ana" } }, customerOrderNumber: 47,
  });
  return JSON.stringify(loaded.exports.row);
}

test("table customer row hides lifetime order ordinal while keeping table name", () => {
  const row = render("TABLE");
  assert.ok(row.includes("Mesa 01"));
  assert.ok(!row.includes("CustomerOrderBadge"));
  assert.ok(!row.includes("47"));
});

test("delivery and pickup retain customer ordinal", () => {
  for (const type of ["DELIVERY", "PICKUP"]) {
    const row = render(type);
    assert.ok(row.includes("CustomerOrderBadge"));
    assert.ok(row.includes("47º pedido de Ana"));
  }
});
