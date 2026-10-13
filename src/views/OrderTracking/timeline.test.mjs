import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
function load(file, imports = {}) {
  const compiled = { exports: {} };
  const source = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  runInNewContext(source, {
    module: compiled, exports: compiled.exports,
    require: (name) => imports[name] ?? require(name),
  });
  return compiled.exports;
}
const status = load("./status.ts");
const styled = load("../../styles.tsx");
const styles = load("./styles.ts", { styles: styled });
const componentNames = new Proxy({}, { get: (_, key) => key });
const { OrderTrackingView } = load("./index.tsx", {
  react: {
    useState: (initial) => [initial, () => {}], useEffect: () => {},
    useCallback: (callback) => callback, useRef: (initial) => ({ current: initial }),
  },
  "next/navigation": { useRouter: () => ({ push: () => {} }) },
  "@/components/BackButton": componentNames,
  "@/components/Button": componentNames,
  "@/components/PageShell": componentNames,
  "@/services/api/client": componentNames,
  "@/utils/format": { money: () => "R$ 10,00" },
  "./status": status, "./styles": componentNames,
});
function timeline(order) {
  const nodes = [];
  function visit(node) {
    if (Array.isArray(node)) node.forEach(visit);
    else if (node?.props) { nodes.push(node); visit(node.props.children); }
  }
  visit(OrderTrackingView({ trackingCode: "test", initialOrder: order }));
  return nodes;
}
function order(status, deliveryType = "DELIVERY") {
  return { status, deliveryType, statusHistory: [
    { status: "RECEIVED", changedAt: "2026-10-13T12:00:00Z" },
    { status: "CONFIRMED", changedAt: "2026-10-13T12:01:00Z" },
  ], items: [], totalCents: 1000, createdAt: "2026-10-13T12:00:00Z" };
}
test("current status has check/time, only next status pulses throughout each flow", () => {
  for (const deliveryType of ["DELIVERY", "PICKUP", "TABLE"]) {
    const steps = status.getTrackingSteps(deliveryType);
    for (const [index, step] of steps.entries()) {
      const nodes = timeline(order(step.status, deliveryType));
      const markers = nodes.filter((node) => node.type === "TimelineMarker");
      assert.deepEqual(markers.map((node) => node.props.state), Array.from(steps, (_, i) =>
        i <= index ? "completed" : i === index + 1 ? "next" : "upcoming"));
      assert.equal(typeof markers[index].props.children, "object");
      assert.equal(nodes.filter((node) => node.props["aria-current"] === "step").length, 1);
      if (step.status === "CONFIRMED") {
        assert.equal(nodes.filter((node) => node.type === "TimelineTime").length, 2);
      }
    }
  }
});
test("canceled orders do not pulse; delivery READY continues towards delivery", () => {
  for (const deliveryType of ["DELIVERY", "PICKUP", "TABLE"]) {
    assert.equal(timeline(order("CANCELED", deliveryType)).some((node) => node.props.state === "next"), false);
  }
  const markers = timeline(order("READY")).filter((node) => node.type === "TimelineMarker");
  assert.equal(markers[2].props.state, "completed");
  assert.equal(markers[3].props.state, "next");
});
test("filled markers stay still and next marker supports reduced motion", () => {
  const marker = (state) => renderToStaticMarkup(React.createElement(styles.TimelineMarker, { state }));
  assert.match(marker("completed"), /background:var\(--color-primary\)/);
  const nextHtml = marker("next");
  const pulseClass = nextHtml.match(/\.([^{}]+)\{[^{}]*animation:order-tracking-next-pulse/)[1];
  assert.ok(nextHtml.match(/<span class="([^"]+)"/)[1].split(" ").includes(pulseClass));
  assert.match(nextHtml, /prefers-reduced-motion:\s*reduce.*animation:none/);
  for (const state of ["completed", "upcoming"]) {
    assert.equal(marker(state).match(/<span class="([^"]+)"/)[1].split(" ").includes(pulseClass), false);
  }
});
