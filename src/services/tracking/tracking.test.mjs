import test from "node:test";
import assert from "node:assert/strict";
import {
  TrackingService,
  isValidMetaPixelId,
} from "./index.ts";

function createWindow() {
  const calls = [];
  const elements = [];
  const storage = new Map();

  return {
    calls,
    elements,
    window: {
      fbq: (...args) => calls.push(args),
      document: {
        getElementById: () => null,
        createElement: () => ({ async: false, src: "" }),
        head: { appendChild: (element) => elements.push(element) },
      },
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
      },
    },
  };
}

test("accepts only numeric Meta Pixel IDs", () => {
  assert.equal(isValidMetaPixelId("111111"), true);
  assert.equal(isValidMetaPixelId("javascript:alert(1)"), false);
  assert.equal(isValidMetaPixelId("123"), false);
});

test("does not load or dispatch when integration is inactive", () => {
  const { window, calls, elements } = createWindow();
  const service = new TrackingService(window);

  service.configure("tenant-a", { pixelId: "111111", enabled: false });
  service.pageView();

  assert.deepEqual(calls, []);
  assert.deepEqual(elements, []);
});

test("does not load or dispatch when no Pixel is configured", () => {
  const { window, calls, elements } = createWindow();
  const service = new TrackingService(window);

  service.configure("tenant-a", null);
  service.pageView();

  assert.deepEqual(calls, []);
  assert.deepEqual(elements, []);
});

test("stops dispatching after marketing consent is withdrawn", () => {
  const { window, calls, elements } = createWindow();
  const service = new TrackingService(window);

  service.configure("tenant-a", { pixelId: "111111", enabled: true });
  service.pageView();
  service.configure("tenant-a", null);
  service.viewContent({ id: "p1", name: "Burger", priceCents: 2500 });

  assert.deepEqual(calls, [
    ["init", "111111"],
    ["trackSingle", "111111", "PageView"],
  ]);
  assert.equal(elements.length, 1);
});

test("loads the script asynchronously and initializes the same Pixel once", () => {
  const { window, elements } = createWindow();
  delete window.fbq;
  const service = new TrackingService(window);

  service.configure("tenant-a", { pixelId: "111111", enabled: true });
  service.configure("tenant-a", { pixelId: "111111", enabled: true });

  assert.equal(elements.length, 1);
  assert.equal(elements[0].id, "meta-pixel-script");
  assert.equal(elements[0].async, true);
  assert.equal(elements[0].src, "https://connect.facebook.net/en_US/fbevents.js");
  assert.deepEqual(window.fbq.queue, [["init", "111111"]]);
});

test("routes events to only the currently configured tenant Pixel", () => {
  const { window, calls } = createWindow();
  const service = new TrackingService(window);

  service.configure("tenant-a", { pixelId: "111111", enabled: true });
  service.pageView();
  service.configure("tenant-b", { pixelId: "222222", enabled: true });
  service.pageView();

  assert.deepEqual(calls, [
    ["init", "111111"],
    ["trackSingle", "111111", "PageView"],
    ["init", "222222"],
    ["trackSingle", "222222", "PageView"],
  ]);
});

test("maps the customer journey events and deduplicates Purchase", () => {
  const { window, calls } = createWindow();
  const service = new TrackingService(window);
  service.configure("tenant-a", { pixelId: "111111", enabled: true });

  service.viewContent({ id: "p1", name: "Burger", priceCents: 2500 });
  service.addToCart({ id: "p1", name: "Burger", quantity: 2, valueCents: 5000 });
  service.initiateCheckout({ valueCents: 5000, itemCount: 2 });
  service.purchase({ id: "order-1", valueCents: 5000, itemIds: ["p1"] });
  service.purchase({ id: "order-1", valueCents: 5000, itemIds: ["p1"] });

  assert.deepEqual(calls, [
    ["init", "111111"],
    ["trackSingle", "111111", "ViewContent", {
      content_ids: ["p1"], content_name: "Burger", content_type: "product",
      value: 25, currency: "BRL",
    }],
    ["trackSingle", "111111", "AddToCart", {
      content_ids: ["p1"], content_name: "Burger", content_type: "product",
      quantity: 2, value: 50, currency: "BRL",
    }],
    ["trackSingle", "111111", "InitiateCheckout", {
      value: 50, num_items: 2, currency: "BRL",
    }],
    ["trackSingle", "111111", "Purchase", {
      content_ids: ["p1"], content_type: "product", order_id: "order-1",
      value: 50, currency: "BRL",
    }],
  ]);
});

test("keeps Purchase deduplicated across service instances", () => {
  const { window, calls } = createWindow();
  const order = { id: "order-1", valueCents: 5000 };
  const firstService = new TrackingService(window);
  firstService.configure("tenant-a", { pixelId: "111111", enabled: true });
  firstService.purchase(order);

  const secondService = new TrackingService(window);
  secondService.configure("tenant-a", { pixelId: "111111", enabled: true });
  secondService.purchase(order);

  assert.equal(calls.filter((call) => call[2] === "Purchase").length, 1);
});
