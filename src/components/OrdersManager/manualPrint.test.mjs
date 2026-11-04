import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("./index.tsx", import.meta.url), "utf8");
const ast = ts.createSourceFile("index.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const functions = {};
function visit(node) {
  if (ts.isFunctionDeclaration(node) && ["printOrder", "updateStatus", "renderPrintContent"].includes(node.name?.text)) {
    functions[node.name.text] = node.getText(ast);
  }
  ts.forEachChild(node, visit);
}
visit(ast);
function load(name, context) {
  runInNewContext(ts.transpileModule(functions[name] + `\nthis.run = ${name};`, {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  }).outputText, context);
  return context.run;
}

test("manual printing uses API first; unconfigured browser never opens", async () => {
  for (const scenario of ["queued", "unconfigured", "browser", "error"]) {
    let opened = 0;
    let printed = 0;
    const messages = [];
    const printWindow = { document: { body: {} }, addEventListener() {}, focus() {}, print() { printed++; } };
    const run = load("printOrder", {
      printDestination: "RECEIPT",
      clientApi: async (_url, options) => {
        assert.equal(options.method, "POST");
        if (scenario === "error") throw new Error("offline");
        return scenario === "queued" ? { jobs: [{ id: "job" }] } : undefined;
      },
      isBrowserPrintEnabled: () => scenario === "browser" || scenario === "queued",
      window: { open: () => { opened++; return printWindow; } },
      getPrintContent: async () => "receipt",
      renderPrintContent: async () => {},
      showToast: (message) => messages.push(message),
    });
    await run({ id: "order" });
    assert.equal(opened, scenario === "browser" ? 1 : 0, scenario);
    assert.equal(printed, scenario === "browser" ? 1 : 0, scenario);
    if (scenario === "unconfigured") assert.match(messages[0], /Configure uma impressora/);
  }
});

test("confirmation only prints in browser when explicitly authorized", async () => {
  for (const enabled of [false, true]) {
    let printed = 0;
    const run = load("updateStatus", {
      printDestination: "RECEIPT", clientApi: async () => ({ id: "order" }),
      setOrders: () => {}, showToast: () => {},
      shouldAutomaticallyPrintInBrowser: async () => enabled,
      printOrderDirectly: async () => { printed++; },
    });
    await run({ id: "order" }, "CONFIRMED");
    await new Promise(setImmediate);
    assert.equal(printed, enabled ? 1 : 0);
  }
});

test("browser receipt uses thermal width and the connector driver font size", async () => {
  const elements = [];
  const printWindow = { document: {
    createElement: (tag) => { const element = { tag, style: {} }; elements.push(element); return element; },
    body: { style: {}, replaceChildren() {} }, head: { append() {} }, documentElement: {},
  } };
  await load("renderPrintContent", { splitPickupQr: (text) => ({ text }) })(printWindow, "receipt");
  const pre = elements.find((element) => element.tag === "pre");
  assert.equal(pre.style.fontSize, "8pt");
  assert.equal(pre.style.width, "42ch");
  assert.equal(printWindow.document.body.style.padding, "0");
  assert.match(elements.find((element) => element.tag === "style").textContent, /width: 72mm/);
});
