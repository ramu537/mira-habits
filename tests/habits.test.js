import assert from "node:assert/strict";
import test from "node:test";
import { completionSeries, habitStats, startOfWeek, todaySummary } from "../src/lib/habits.js";

const daily = {
  id: 1,
  name: "Morning walk",
  cadence: "DAILY",
  targetPerWeek: 7,
  color: "#4F8A10",
  completedDates: ["2026-09-07", "2026-09-08", "2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13"],
};

const weekly = {
  id: 2,
  name: "Strength training",
  cadence: "WEEKLY",
  targetPerWeek: 3,
  color: "#7C5CE0",
  completedDates: ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-07", "2026-09-09", "2026-09-12"],
};

test("startOfWeek uses Monday", () => {
  assert.equal(startOfWeek("2026-09-13"), "2026-09-07");
  assert.equal(startOfWeek("2026-09-07"), "2026-09-07");
});

test("daily stats calculate current and best streaks", () => {
  const stats = habitStats(daily, "2026-09-13", 7);
  assert.equal(stats.currentStreak, 4);
  assert.equal(stats.bestStreak, 4);
  assert.equal(stats.completedInPeriod, 6);
  assert.equal(stats.rate, 86);
});

test("weekly stats count consecutive qualifying weeks", () => {
  const stats = habitStats(weekly, "2026-09-13", 14);
  assert.equal(stats.currentStreak, 2);
  assert.equal(stats.bestStreak, 2);
  assert.equal(stats.completedInPeriod, 6);
  assert.equal(stats.rate, 100);
});

test("todaySummary includes completion and perfect-day context", () => {
  assert.deepEqual(todaySummary([daily, weekly], "2026-09-13"), {
    completed: 1,
    total: 2,
    remaining: 1,
    percent: 50,
    perfectDays: 2,
  });
});

test("completionSeries keeps each day and its denominator explicit", () => {
  const series = completionSeries([daily, weekly], "2026-09-13", 3);
  assert.deepEqual(series.map(({ date, completed, total, percent }) => ({ date, completed, total, percent })), [
    { date: "2026-09-11", completed: 1, total: 2, percent: 50 },
    { date: "2026-09-12", completed: 2, total: 2, percent: 100 },
    { date: "2026-09-13", completed: 1, total: 2, percent: 50 },
  ]);
});
