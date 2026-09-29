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
  }).sort((a, b) => Number(Boolean(b.assistantInterpretation)) - Number(Boolean(a.assistantInterpretation))).slice(0, 3);
}
