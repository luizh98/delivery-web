import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const mismatch = "O número selecionado precisa ser igual ao Celular do restaurante. Salve esse campo antes de conectar.";

for (const central of [false, true]) {
  test(`signup phone mismatch shows error toast and clears progress (${central ? "central" : "SDK"})`, async () => {
    const hooks = [], effects = [], toasts = [], listeners = new Map(), calls = [];
    let cursor = 0, loginCallback;
    const connection = { provider: { enabled: true, appId: "123", apiVersion: "v25.0", configId: "456" }, integration: null };
    const window = {
      location: { pathname: "/admin/settings" },
      addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: (name) => listeners.delete(name),
    };
    const fetch = async (url) => {
      calls.push(url);
      if (url === "/api/whatsapp-signup/config") return Response.json({ origin: central ? "https://connect.example.com" : null });
      if (url.endsWith("/signup/complete")) return Response.json({ code: "phone_mismatch", message: mismatch }, { status: 409 });
      if (url.endsWith("/signup")) return Response.json({ attemptId: "attempt" });
      if (url.endsWith("/connection")) return Response.json(connection);
      throw new Error(`Unexpected request: ${url}`);
    };
    const cache = new Map();
    function load(relative) {
      if (cache.has(relative)) return cache.get(relative);
      const loaded = { exports: {} };
      const source = readFileSync(new URL(relative, import.meta.url), "utf8");
      runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
        module: loaded, exports: loaded.exports, Error, URL, Headers, FormData, fetch, window,
        setTimeout: () => 1, clearTimeout() {},
        require: (id) => {
          if (id === "react") return {
            useState(initial) {
              const index = cursor++;
              if (!(index in hooks)) hooks[index] = initial;
              return [hooks[index], (value) => { hooks[index] = typeof value === "function" ? value(hooks[index]) : value; }];
            },
            useRef(initial) { const index = cursor++; return hooks[index] ??= { current: initial }; },
            useEffect(callback) { const index = cursor++; if (!(index in hooks)) { hooks[index] = true; effects.push(callback); } },
          };
          if (id === "@/components/ToastProvider") return { useToast: () => ({ showToast: (message, variant) => toasts.push({ message, variant }) }) };
          if (id === "@/components/ConfirmationProvider") return { useConfirmation: () => ({ requestConfirmation: async () => true }) };
          if (id === "@/services/api/client") return load("../../services/api/client.ts");
          if (id === "./whatsappEmbeddedSignup") return {
            ...load("./whatsappEmbeddedSignup.ts"),
            loadMetaSDK: async () => ({ login: (callback) => { loginCallback = callback; } }),
          };
          if (id === "./whatsappCentralSignup") return { openCentralSignup: async () => ({ code: "code", wabaId: "123", phoneNumberId: "456", businessId: "" }) };
          if (id === "react/jsx-runtime") return require(id);
          return new Proxy({}, { get: (_, key) => String(key) });
        },
        AbortController,
      });
      cache.set(relative, loaded.exports);
      return loaded.exports;
    }
    const { WhatsAppConnection } = load("./WhatsAppConnection.tsx");
    function render() {
      cursor = 0;
      const tree = WhatsAppConnection({ onChange() {}, phoneSaved: true });
      effects.splice(0).forEach((effect) => effect());
      return tree;
    }
    const flush = () => new Promise((resolve) => setImmediate(resolve));
    function elements(node) {
      if (!node || typeof node !== "object") return [];
      if (Array.isArray(node)) return node.flatMap(elements);
      return [node, ...elements(node.props?.children)];
    }
    render();
    await flush();
    const button = elements(render()).find((element) => element.type === "Button" && element.props.children?.includes?.("Conectar WhatsApp"));
    assert.ok(button && !button.props.disabled, "connection can start");
    button.props.onClick();
    if (!central) {
      loginCallback({ authResponse: { code: "code" } });
      listeners.get("message")({ origin: "https://www.facebook.com", data: { type: "WA_EMBEDDED_SIGNUP", event: "FINISH", data: { waba_id: "123", phone_number_id: "456" } } });
    }
    await flush();
    await flush();
    assert.ok(calls.some((url) => url.endsWith("/signup/complete")), "actual completion request ran");
    assert.deepEqual(toasts, [{ message: mismatch, variant: "error" }]);
    const result = elements(render());
    assert.ok(result.some((element) => element.props?.role === "alert" && element.props.children === mismatch), "inline error remains visible");
    assert.ok(!result.some((element) => element.props?.role === "status" && /preparando o número/.test(element.props.children)), "stale progress cleared");
    assert.equal(result[0].props["aria-busy"], false);
  });
}
