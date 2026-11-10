import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function browserCart(initialStorage = {}) {
  const storage = new Map(Object.entries(initialStorage));
  let url = new URL("https://restaurant.test/cart");
  const loaded = { exports: {} };
  const jsx = (type, props) => typeof type === "function" ? type(props) : { type, props };
  const compiled = ts.transpileModule(readFileSync(new URL("./index.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  runInNewContext(compiled, {
    module: loaded, exports: loaded.exports, Event,
    window: {
      localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
      dispatchEvent() {}, addEventListener() {}, removeEventListener() {},
    },
    require(name) {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "react") return {
        createContext: () => ({ Provider: "Provider" }),
        useCallback: (callback) => callback,
        useSyncExternalStore: (_, getSnapshot) => getSnapshot(),
        Suspense: ({ children }) => children,
      };
      if (name === "next/navigation") return {
        usePathname: () => url.pathname, useSearchParams: () => url.searchParams,
      };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return {
    cart(path = url.pathname + url.search) {
      url = new URL(path, url);
      return loaded.exports.CartProvider({ children: null }).props.value;
    },
    storage,
  };
}

const item = { lineId: "delivery", productId: "product", quantity: 1, totalCents: 1000, options: [] };
const order = { trackingCode: "12345678-1234-4123-8123-123456789012", items: [item] };

test("legacy TABLE checkout recovers to DELIVERY without losing address, items or history", () => {
  for (const version of [1, 2, 3]) {
    const browser = browserCart({ "delivery-order-v1": JSON.stringify({
      version, items: [item], checkout: { deliveryType: "TABLE", street: "Rua salva" },
      lastOrder: order, recentOrders: [order], recentOrderTrackingCodes: [order.trackingCode],
    }) });
    const cart = browser.cart("/cart");
    assert.equal(cart.checkout.deliveryType, "DELIVERY");
    assert.equal(cart.checkout.street, "Rua salva");
    assert.equal(cart.items[0].lineId, "delivery");
    assert.equal(cart.recentOrderTrackingCodes[0], order.trackingCode);
  }
});

test("QR menu, product and checkout share a table cart, isolated from delivery and other tables", () => {
  const browser = browserCart();
  let cart = browser.cart("/cart");
  cart.addItem(item);
  cart = browser.cart();
  cart.updateCheckout({ ...cart.checkout, deliveryType: "PICKUP", customerName: "Delivery", street: "Rua salva" });

  cart = browser.cart("/menu?mesa=one");
  assert.equal(cart.items.length, 0);
  cart.addItem({ ...item, lineId: "table" });
  cart = browser.cart("/products/product?mesa=one");
  assert.equal(cart.items[0].lineId, "table");
  cart.updateCheckout({ ...cart.checkout, deliveryType: "TABLE", customerName: "Mesa" });
  cart = browser.cart("/menu/sacola?mesa=one");
  assert.equal(cart.checkout.deliveryType, "TABLE");
  assert.equal(cart.checkout.customerName, "Mesa");
  assert.equal(browser.cart("/menu?mesa=two").items.length, 0);

  cart = browser.cart("/cart?mesa=one");
  assert.equal(cart.checkout.deliveryType, "PICKUP");
  assert.equal(cart.checkout.customerName, "Delivery");
  assert.equal(cart.checkout.street, "Rua salva");
  assert.equal(cart.items[0].lineId, "delivery");
  assert.equal(browser.cart("/menu/sacola?mesa=one").items[0].lineId, "table");
});

test("completing a table order does not clear delivery cart or change its delivery type", () => {
  const browser = browserCart();
  browser.cart("/cart").addItem(item);
  browser.cart("/menu/sacola?mesa=one").completeOrder(order);
  assert.equal(browser.cart().items.length, 0);
  assert.equal(browser.cart("/cart").items.length, 1);
  assert.equal(browser.cart().checkout.deliveryType, "DELIVERY");
});

test("checkout submits DELIVERY outside a table and TABLE without address inside a table", async () => {
  const require = createRequire(import.meta.url);
  const compiled = ts.transpileModule(readFileSync(new URL("../../views/Cart/index.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  for (const table of [undefined, { token: "one", number: "1" }]) {
    const loaded = { exports: {} };
    let stateIndex = 0;
    let submit;
    let payload;
    let formValues;
    const checkout = { deliveryType: "TABLE", paymentMethod: "PIX", customerName: "Cliente", customerPhone: "11999999999", street: "Rua salva", number: "1", neighborhood: "Centro", city: "Cidade", state: "SP", zipCode: "", changeForReais: 0 };
    const jsx = (type, props) => ({ type, props });
    const fallback = new Proxy({}, { get: (_, key) => String(key) });
    runInNewContext(compiled, {
      module: loaded, exports: loaded.exports,
      require(name) {
        if (name === "@/utils/tableIdentity") return { tableLabel: (table) => `${table.kind === "COMMAND" ? "Comanda" : "Mesa"} ${table.number}` };
        if (name === "zod") return require(name);
        if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
        if (name === "react") return {
          useEffect() {}, useRef: (current) => ({ current }),
          useState: (initial) => [stateIndex++ === 1 ? true : initial, () => {}],
        };
        if (name === "react-hook-form") return {
          useForm: ({ values }) => {
            formValues = values;
            return { control: {}, formState: { errors: {} }, register: () => ({}), getValues: () => values,
              handleSubmit: (callback) => { submit = callback; return () => {}; } };
          },
          useWatch: ({ name: field }) => formValues[field],
        };
        if (name === "@hookform/resolvers/zod") return { zodResolver: () => () => {} };
        if (name === "next/navigation") return { useRouter: () => ({ replace() {} }) };
        if (name === "@/components/CartProvider") return { useCart: () => ({ checkout, items: [item], subtotalCents: 1000, completeOrder() {} }) };
        if (name === "@/components/CustomerAuthProvider") return { useCustomerAuth: () => ({ customer: null }) };
        if (name === "@/components/TrackingProvider") return { useTracking: () => ({ purchase() {} }) };
        if (name === "@/services/api/client") return {
          ApiError: Error, clientApi: async (_, request) => { payload = JSON.parse(request.body); return { ...order, totals: { totalCents: 1000 } }; },
        };
        if (name === "@/utils/customerInput") return { formatBrazilianMobileInput: (value) => value, normalizeBrazilianMobile: (value) => value, isValidBrazilianMobile: () => true };
        if (name === "@/utils/format") return { money: String };
        return fallback;
      },
    });
    loaded.exports.CartView({ restaurantConfig: { open: true }, initialStep: 2, table });
    assert.equal(formValues.deliveryType, table ? "TABLE" : "DELIVERY");
    // Simulate stale form data too: payload must follow the route context.
    await submit({ ...checkout, deliveryType: "DELIVERY" });
    assert.equal(payload.deliveryType, table ? "TABLE" : "DELIVERY");
    assert.equal(payload.tableToken, table?.token);
    assert.equal(Boolean(payload.deliveryAddress), !table);
    if (!table) {
      await submit(checkout);
      assert.equal(payload.deliveryType, "DELIVERY");
    }
  }
});
