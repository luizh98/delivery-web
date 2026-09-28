import assert from "node:assert/strict";
import test from "node:test";
import { validateOperatingHours, hasOperatingHoursErrors } from "./operatingHours.ts";

test("weekly and holiday hours reject missing or inverted times", () => {
  for (const [openTime, closeTime] of [["", "18:00"], ["18:00", "09:00"], ["09:00", "09:00"]]) {
    const errors = validateOperatingHours(
      [{ dayOfWeek: "MONDAY", openTime, closeTime, closed: false }],
      [{ date: "2026-12-25", name: "Natal", openTime, closeTime, closed: false }],
    );
    assert.equal(hasOperatingHoursErrors(errors), true);
    assert.ok(errors.businessHours.MONDAY);
    assert.ok(errors.holidayHours[0].time);
  }
});

test("closed days need no times; holidays need valid unique dates and names", () => {
  const valid = validateOperatingHours(
    [{ dayOfWeek: "MONDAY", closed: true }],
    [{ date: "2026-12-25", name: "Natal", closed: true }],
  );
  assert.equal(hasOperatingHoursErrors(valid), false);

  const invalid = validateOperatingHours([], [
    { date: "2026-02-30", name: " ", closed: true },
    { date: "2026-02-30", name: "Outra", closed: true },
  ]);
  assert.ok(invalid.holidayHours[0].date);
  assert.ok(invalid.holidayHours[0].name);
  assert.ok(invalid.holidayHours[1].date);
});
