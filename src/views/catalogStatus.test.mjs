import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const productsFile = "AdminProducts/ProductManager.tsx";
const categoriesFile = "AdminCategories/CategoryManager.tsx";

function declaration(file, name) {
  const source = ts.createSourceFile(
    file,
    readFileSync(new URL(file, import.meta.url), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let code;
  function visit(node) {
    if (
      (ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node)) &&
      node.name?.getText(source) === name
    ) {
      code = ts.isVariableDeclaration(node)
        ? node.initializer.getText(source)
        : node.getText(source);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(code, `Missing declaration: ${name}`);
  return code;
}

const filterProducts = new Function(
  "sortedProducts", "normalizedProductSearch", "productCategoryFilter", "productStatusFilter",
  `return ${declaration(productsFile, "filteredProducts")}`,
);
const filterCategories = new Function(
  "categories", "search", "statusFilter",
  `${ts.transpile(declaration(categoriesFile, "categoryMatchesSearch"))}
   return ${declaration(categoriesFile, "filteredCategories")}`,
);
const items = [
  { id: "1", name: "Pizza ativa", categoryId: "food", active: true },
  { id: "2", name: "Pizza inativa", categoryId: "food", active: false },
  { id: "3", name: "Bebida ativa", categoryId: "drink", active: true },
  { id: "4", name: "Bebida inativa", categoryId: "drink", active: false },
];
const ids = (result) => result.map((item) => item.id);

test("catalog status defaults to Todos in both managers", () => {
  assert.equal(
    declaration(productsFile, "[productStatusFilter, setProductStatusFilter]"),
    'useState("")',
  );
  assert.equal(
    declaration(categoriesFile, "[statusFilter, setStatusFilter]"),
    'useState("")',
  );
});

test("both lists support Todos, Ativo and Inativo without losing items", () => {
  for (const [status, expected] of [
    ["", ["1", "2", "3", "4"]],
    ["active", ["1", "3"]],
    ["inactive", ["2", "4"]],
  ]) {
    assert.deepEqual(ids(filterProducts(items, "", "", status)), expected);
    assert.deepEqual(ids(filterCategories(items, "", status)), expected);
  }
});

test("status combines with product search and category, and category search", () => {
  assert.deepEqual(ids(filterProducts(items, "pizza", "food", "inactive")), ["2"]);
  assert.deepEqual(filterProducts(items, "pizza", "drink", "active"), []);
  assert.deepEqual(ids(filterCategories(items, "  PIZZA ", "active")), ["1"]);
  assert.deepEqual(filterCategories(items, "inexistente", "inactive"), []);
  assert.deepEqual(filterProducts([], "", "", ""), []);
  assert.deepEqual(filterCategories([], "", ""), []);
});
