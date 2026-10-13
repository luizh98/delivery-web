import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

test("provider notifies panels on connection/reconnection and forwards driver updates", () => {
  let effect;
  const streams = [];
  class EventSource {
    handlers = new Map();
    closed = false;
    constructor(url) { assert.equal(url, "/api/backend/admin/orders/events"); streams.push(this); }
    addEventListener(name, callback) { this.handlers.set(name, callback); }
    removeEventListener(name) { this.handlers.delete(name); }
    close() { this.closed = true; }
    emit(name, data) { this.handlers.get(name)?.({ data }); }
  }
  const loaded = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(new URL("./index.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  runInNewContext(compiled, {
    module: loaded, exports: loaded.exports, EventSource,
    require(name) {
      if (name === "react") return {
        createContext: () => ({ Provider: "Provider" }),
        useRef: (current) => ({ current }), useCallback: (callback) => callback,
        useMemo: (callback) => callback(), useEffect: (callback) => { effect = callback; },
      };
      if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }) };
      throw new Error(`Unexpected import ${name}`);
    },
  });
  const provider = loaded.exports.AdminOrderEventsProvider({ children: null });
  const cleanup = effect();
  const stream = streams[0];
  const received = [];
  let connections = 0;
  const unsubscribe = provider.props.value.subscribe((order) => received.push(order), () => { connections++; });
  stream.emit("open");
  stream.emit("order", JSON.stringify({ id: "order", status: "OUT_FOR_DELIVERY" }));
  stream.emit("open");
  assert.equal(connections, 2);
  assert.equal(received[0].status, "OUT_FOR_DELIVERY");
  unsubscribe();
  stream.emit("open");
  assert.equal(connections, 2);
  cleanup();
  assert.equal(stream.closed, true);
  assert.equal(stream.handlers.size, 0);
});
