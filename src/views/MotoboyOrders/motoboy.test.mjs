import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const compiled = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const loadedModule = { exports: {} };
  runInNewContext(compiled, {
    module: loadedModule, exports: loadedModule.exports, console,
    require: (id) => {
      if (id === "@/components/ToastProvider") return { useToast: () => ({ showToast() {} }) };
      if (id === "@/components/ConfirmationProvider") return { useConfirmation: () => ({ requestConfirmation() { throw new Error("Rendering must not confirm actions"); } }) };
      if (id === "@/services/api/client") return { clientApi() { throw new Error("Rendering must not call API"); } };
      if (id.startsWith(".") || id.startsWith("@/") || id === "styles") {
        const base = id === "styles" ? path.join(src, "styles") : id.startsWith("@/") ? path.join(src, id.slice(2)) : path.resolve(path.dirname(file), id);
        return load([base + ".tsx", base + ".ts", path.join(base, "index.tsx")].find(existsSync));
      }
      return require(id);
    },
  });
  cache.set(file, loadedModule.exports);
  return loadedModule.exports;
}

const order = { id: "pedido123", orderNumber: "123", customer: { name: "João", phone: "11999999999" }, status: "PREPARING", deliveryAddress: { street: "Rua das Flores", number: "45", neighborhood: "Centro" }, items: [{ productId: "food", quantity: 2, name: "Marmita", observations: "Sem cebola", options: [{ itemName: "Feijão" }] }], notes: "Conferir bebida" };
const route = { id: "rota123", status: "OUT_FOR_DELIVERY", orders: [{ ...order, status: "OUT_FOR_DELIVERY" }] };
function render(routes = [], enabled = true, orders = [order]) {
  const { MotoboyOrdersBoard } = load(path.join(src, "views/MotoboyOrders/MotoboyOrdersBoard.tsx"));
  return renderToStaticMarkup(React.createElement(MotoboyOrdersBoard, { initialRoutes: routes, initialPickup: { enabled, orders } }));
}

test("pickup starts with physical check and one primary action", () => {
  const html = render();
  for (const text of ["Para retirar · 1", "Em entrega · 0", "Retirar e sair para entrega", "confira pedido físico", "2 × Marmita", "Sem cebola", "Feijão", "Conferir bebida"]) assert.ok(html.includes(text), text);
  assert.ok(!html.includes("Confirmar entrega"));
  assert.match(html, /aria-pressed="true"[^>]*>Para retirar/);
});

test("kitchen-dispatched orders open deliveries and retain navigation tools", () => {
  const html = render([route]);
  for (const text of ["Em entrega · 1", "Para retirar · 1", "Confirmar entrega", "Ver no Google Maps", "WhatsApp"]) assert.ok(html.includes(text), text);
  for (const text of ["Retirar e sair", ">Subir<", ">Descer<", ">Baixar<"]) assert.ok(!html.includes(text), text);
});

test("disabled tenant keeps delivery-only screen", () => {
  const html = render([route], false);
  assert.ok(!html.includes("Para retirar"));
  assert.ok(html.includes("Confirmar entrega"));
});

test("empty pickup and empty delivery have distinct instructions", () => {
  assert.ok(render([], true, []).includes("Nenhum pedido disponível para retirar"));
  assert.ok(render([], false, []).includes("Nenhum pedido pendente para entrega"));
});
