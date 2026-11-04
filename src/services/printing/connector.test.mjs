import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("./connector.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function setup() {
  const values = new Map();
  let destinations = [];
  let error = false;
  let calls = 0;
  const exports = {};
  const localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  runInNewContext(compiled, {
    exports, window: { localStorage },
    require: (name) => name === "@/services/api/client" ? {
      clientApi: async () => {
        calls++;
        if (error) throw new Error("offline");
        return { destinations };
      },
    } : {},
  });
  return { api: exports, localStorage, configure: (value) => { destinations = value; }, fail: () => { error = true; }, calls: () => calls };
}

test("browser printing is disabled by default, even if connector lookup fails", async () => {
  const { api, fail, calls } = setup();
  fail();
  assert.equal(api.isBrowserPrintEnabled("RECEIPT"), false);
  assert.equal(await api.shouldAutomaticallyPrintInBrowser("RECEIPT"), false);
  assert.equal(calls(), 0);
});

test("browser opt-in is destination specific and connector keeps priority", async () => {
  const { api, configure } = setup();
  api.setBrowserPrintEnabled("RECEIPT", true);
  assert.equal(api.isBrowserPrintEnabled("RECEIPT"), true);
  assert.equal(api.isBrowserPrintEnabled("KITCHEN"), false);
  assert.equal(await api.shouldAutomaticallyPrintInBrowser("RECEIPT"), true);
  configure(["RECEIPT"]);
  assert.equal(await api.shouldAutomaticallyPrintInBrowser("RECEIPT"), false);
  api.setBrowserPrintEnabled("RECEIPT", false);
  assert.equal(api.isBrowserPrintEnabled("RECEIPT"), false);
});

test("lookup failure never authorizes browser printing and can recover", async () => {
  const { api, fail } = setup();
  api.setBrowserPrintEnabled("RECEIPT", true);
  fail();
  await assert.rejects(api.shouldAutomaticallyPrintInBrowser("RECEIPT"), /offline/);
});

test("unavailable storage defaults to disabled and cannot silently save opt-in", async () => {
  const { api, localStorage } = setup();
  localStorage.getItem = () => { throw new Error("blocked"); };
  localStorage.setItem = () => { throw new Error("blocked"); };
  assert.equal(api.isBrowserPrintEnabled("RECEIPT"), false);
  assert.throws(() => api.setBrowserPrintEnabled("RECEIPT", true), /blocked/);
});
