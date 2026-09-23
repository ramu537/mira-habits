import assert from "node:assert/strict";
import test from "node:test";
import { habitToday } from "../src/lib/dates.js";
import { weeklyProgress } from "../src/lib/habits.js";

test("habit day uses the same India time zone as backend and MCP", () => {
  assert.equal(habitToday(new Date("2026-09-22T20:00:00Z")), "2026-09-23");
  assert.equal(habitToday(new Date("2026-09-23T18:29:00Z")), "2026-09-23");
  assert.equal(habitToday(new Date("2026-09-23T18:30:00Z")), "2026-09-24");
});

test("weekly targets can be reached without today's check-in", () => {
  assert.deepEqual(weeklyProgress({ targetPerWeek: 2, completedDates: ["2026-09-21", "2026-09-22"] }, "2026-09-23"),
    { count: 2, target: 2, remaining: 0 });
});
test("schedule changes exclude old check-ins from current weekly target without deleting history", () => {
  const habit = { targetPerWeek: 3, scheduleSince: "2026-09-22T20:00:00Z", completedDates: ["2026-09-21", "2026-09-22", "2026-09-23"] };
  assert.deepEqual(weeklyProgress(habit, "2026-09-23"), { count: 1, target: 3, remaining: 2 });
  assert.equal(habit.completedDates.length, 3);
});
test("weekly check-ins count distinct dates, not future dates or prior weeks", () => {
  assert.deepEqual(weeklyProgress({ targetPerWeek: 2, completedDates: ["2026-09-20", "2026-09-21", "2026-09-21", "2026-09-24"] }, "2026-09-23"),
    { count: 1, target: 2, remaining: 1 });
});
