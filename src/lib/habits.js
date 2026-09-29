import { dateRange, localDateKey, shiftDate, habitToday } from "./dates.js";

// Hex values are required by the existing backend's HabitRequest contract.
export const habitPalette = [
  { value: "#4F8A10", token: "var(--habit-lime)", label: "Lime" },
  { value: "#C28020", token: "var(--habit-amber)", label: "Amber" },
  { value: "#D92E70", token: "var(--habit-pink)", label: "Pink" },
  { value: "#2C6DEB", token: "var(--habit-blue)", label: "Blue" },
  { value: "#7C5CE0", token: "var(--habit-violet)", label: "Violet" },
  { value: "#159C91", token: "var(--habit-teal)", label: "Teal" },
];

export function paletteToken(color) {
  return habitPalette.find((item) => item.value.toUpperCase() === String(color).toUpperCase())?.token || color;
}

export function startOfWeek(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const mondayOffset = (date.getDay() + 6) % 7;
  return shiftDate(dateKey, -mondayOffset);
}

export function cadenceLabel(habit) {
  return habit.cadence === "DAILY" ? "Every day" : `${habit.targetPerWeek} times per week`;
}

export function isCompleted(habit, dateKey) {
    return (habit.completedDates || []).includes(dateKey);
}

export function canRecordDay(habit, day, today) {
  if (day > today) return false;
  if (isCompleted(habit, day)) return true;
  return !habit.createdAt || day >= habitToday(new Date(habit.createdAt));
}

export function weeklyProgress(habit, dateKey) {
  const monday = startOfWeek(dateKey);
  const since = habit.scheduleSince ? habitToday(new Date(habit.scheduleSince)) : monday;
  const count = new Set((habit.completedDates || []).filter(day => day >= monday && day >= since && day <= dateKey)).size;
  return { count, target: habit.targetPerWeek, remaining: Math.max(0, habit.targetPerWeek - count) };
}

export function habitStats(habit, endDate = localDateKey(), periodDays = 30) {
  const completed = new Set(habit.completedDates || []);
  const days = dateRange(endDate, periodDays);
  const completedInPeriod = days.filter((day) => completed.has(day)).length;
  const expected = habit.cadence === "DAILY"
    ? periodDays
    : Math.max(1, Math.ceil(periodDays / 7) * habit.targetPerWeek);

  return {
    currentStreak: habit.cadence === "DAILY"
      ? dailyCurrentStreak(completed, endDate)
      : weeklyCurrentStreak(completed, endDate, habit.targetPerWeek),
    bestStreak: habit.cadence === "DAILY"
      ? dailyBestStreak(completed)
      : weeklyBestStreak(completed, habit.targetPerWeek),
    completedCount: completed.size,
    completedInPeriod,
    rate: Math.min(100, Math.round((completedInPeriod / expected) * 100)),
  };
}

export function todaySummary(habits, today = localDateKey()) {
  const completed = habits.filter((habit) => isCompleted(habit, today)).length;
  const perfectDays = dateRange(today, 30)
    .filter((date) => habits.length > 0 && habits.every((habit) => isCompleted(habit, date))).length;
  return {
    completed,
    total: habits.length,
    remaining: Math.max(0, habits.length - completed),
    percent: habits.length ? Math.round((completed / habits.length) * 100) : 0,
    perfectDays,
  };
}

export function completionSeries(habits, endDate = localDateKey(), count = 14) {
  return dateRange(endDate, count).map((date) => {
    const completed = habits.filter((habit) => isCompleted(habit, date)).length;
    return {
      date,
      completed,
      total: habits.length,
      percent: habits.length ? Math.round((completed / habits.length) * 100) : 0,
      label: new Intl.DateTimeFormat("en", { weekday: "short" })
        .format(new Date(`${date}T12:00:00`)).slice(0, 1),
    };
  });
}

function dailyCurrentStreak(completed, endDate) {
  let cursor = completed.has(endDate) ? endDate : shiftDate(endDate, -1);
  let streak = 0;
  while (completed.has(cursor) && streak < 3660) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }
  return streak;
}

function dailyBestStreak(completed) {
  const sorted = Array.from(completed).sort();
  let best = 0;
  let current = 0;
  let previous = null;
  sorted.forEach((date) => {
    current = previous && shiftDate(previous, 1) === date ? current + 1 : 1;
    best = Math.max(best, current);
    previous = date;
  });
  return best;
}

function weeklyCounts(completed) {
  const counts = new Map();
  completed.forEach((date) => {
    const week = startOfWeek(date);
    counts.set(week, (counts.get(week) || 0) + 1);
  });
  return counts;
}

function weeklyCurrentStreak(completed, endDate, target) {
  const counts = weeklyCounts(completed);
  let cursor = startOfWeek(endDate);
  if ((counts.get(cursor) || 0) < target) cursor = shiftDate(cursor, -7);
  let streak = 0;
  while ((counts.get(cursor) || 0) >= target && streak < 520) {
    streak += 1;
    cursor = shiftDate(cursor, -7);
  }
  return streak;
}

function weeklyBestStreak(completed, target) {
  const qualifying = Array.from(weeklyCounts(completed))
    .filter(([, count]) => count >= target)
    .map(([week]) => week)
    .sort();
  let best = 0;
  let current = 0;
  let previous = null;
  qualifying.forEach((week) => {
    current = previous && shiftDate(previous, 7) === week ? current + 1 : 1;
    best = Math.max(best, current);
    previous = week;
  });
  return best;
}
