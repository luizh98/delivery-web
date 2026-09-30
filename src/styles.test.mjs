import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const srcDir = path.dirname(fileURLToPath(import.meta.url));

function loadStyles(file, imports = {}) {
  const source = readFileSync(path.join(srcDir, file), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  runInNewContext(compiled, {
    module: loadedModule,
    exports: loadedModule.exports,
    require: (id) => imports[id] ?? require(id),
  });
  return loadedModule.exports;
}

test("upsell name emits a valid two-line clamp", () => {
  const styles = loadStyles("styles.tsx");
  const { Name } = loadStyles("views/Cart/UpsellBlock.styles.ts", { styles });
  const html = renderToStaticMarkup(
    React.createElement(Name, null, "FONDUE DE COXINHA SEM MASSA COM QUEIJO E BACON"),
  );

  assert.match(html, /-webkit-line-clamp:2;/);
  assert.doesNotMatch(html, /-webkit-line-clamp:2px;/);
});
