import test from "node:test";
import assert from "node:assert/strict";
import { normalizePrintOverview } from "./normalizeOverview.ts";

test("normalizes null or missing Mongo-backed collections to arrays", () => {
  const overview = normalizePrintOverview({
    devices: null,
    printers: undefined,
    destinations: null,
  });

  assert.deepEqual(overview, { devices: [], printers: [], destinations: [] });
  assert.doesNotThrow(() => overview.destinations.find(() => false));
});
