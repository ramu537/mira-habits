const usefulKinds = new Set([
  "HABIT_WEEK_CAPACITY", "HABIT_WEEK_CHANGE", "HABIT_RECORDING_GAP",
  "HABIT_WEEKDAY_PATTERN", "HABIT_RETURN", "HABIT_STEADY",
]);

// Older backend versions may still send receipts. Never dress them up as coaching.
export function usefulObservations(observations = []) {
  const seen = new Set();
  return observations.filter(item => {
    if (!usefulKinds.has(item.kind) || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).sort((a, b) => {
    const priority = { HABIT_WEEK_CAPACITY: 90, HABIT_WEEK_CHANGE: 80, HABIT_RECORDING_GAP: 75,
      HABIT_WEEKDAY_PATTERN: 70, HABIT_RETURN: 65, HABIT_STEADY: 60 };
    return (priority[b.kind] || 0) - (priority[a.kind] || 0)
      || Number(Boolean(b.assistantInterpretation)) - Number(Boolean(a.assistantInterpretation));
  }).slice(0, 3);
}
