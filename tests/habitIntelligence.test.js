import assert from "node:assert/strict";
import test from "node:test";
import { habitToday } from "../src/lib/dates.js";
import { weeklyProgress, canRecordDay } from "../src/lib/habits.js";
import { usefulObservations } from "../src/lib/coaching.js";

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

test("only useful coaching appears, capped at three and without duplicate IDs", () => {
  const rows = [{ id: "receipt", kind: "HABIT_CHECK_IN" },
    ...[1, 2, 2, 3, 4].map(id => ({ id, kind: "HABIT_WEEK_CHANGE" }))];
  assert.deepEqual(usefulObservations(rows).map(item => item.id), [1, 2, 3]);
  assert.deepEqual(usefulObservations(), []);
});

test("board blocks future and pre-creation dates but lets existing backfills be corrected", () => {
  const habit = { createdAt: "2026-09-22T20:00:00Z", completedDates: ["2026-09-20"] };
  assert.equal(canRecordDay(habit, "2026-09-24", "2026-09-23"), false);
  assert.equal(canRecordDay(habit, "2026-09-22", "2026-09-23"), false);
  assert.equal(canRecordDay(habit, "2026-09-20", "2026-09-23"), true);
  assert.equal(canRecordDay(habit, "2026-09-23", "2026-09-23"), true);
});

test("a saved connected-assistant brief is visible even when it chose a lower ranked finding", () => {
  const rows = [1, 2, 3, 4].map(id => ({ id, kind: "HABIT_STEADY", assistantInterpretation: id === 4 ? { explanation: "A grounded brief" } : null }));
  assert.deepEqual(usefulObservations(rows).map(item => item.id), [4, 1, 2]);
});
