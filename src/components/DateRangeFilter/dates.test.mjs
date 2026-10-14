import assert from "node:assert/strict";
import { test } from "node:test";
import { dateFromKey, dateKey, getPresetDateRange, rangeDays } from "./dates.ts";

test("date presets include today and cross month/year boundaries", () => {
  const now = new Date(2026, 0, 1, 20);
  assert.deepEqual(getPresetDateRange("today", now), { startDate: "2026-01-01", endDate: "2026-01-01" });
  assert.deepEqual(getPresetDateRange("yesterday", now), { startDate: "2025-12-31", endDate: "2025-12-31" });
  assert.deepEqual(getPresetDateRange("last7", now), { startDate: "2025-12-26", endDate: "2026-01-01" });
  assert.deepEqual(getPresetDateRange("thisMonth", new Date(2024, 1, 29)), { startDate: "2024-02-01", endDate: "2024-02-29" });
});

test("calendar keys and inclusive day limits preserve civil dates", () => {
  assert.equal(dateKey(dateFromKey("2024-02-29")), "2024-02-29");
  assert.equal(rangeDays(new Date(2024, 0, 1), new Date(2024, 11, 31)), 366);
  assert.equal(rangeDays(new Date(2026, 2, 7), new Date(2026, 2, 9)), 3);
  assert.equal(rangeDays(new Date(2026, 9, 14), new Date(2026, 9, 14)), 1);
});
