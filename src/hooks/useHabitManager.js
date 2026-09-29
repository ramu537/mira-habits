import { useCallback, useEffect, useRef, useState } from "react";
import { habitApi } from "../api/habits";
import { dateRange, habitToday } from "../lib/dates";

export function useHabitManager(user) {
  const [today, setToday] = useState(habitToday);
  const [habits, setHabits] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState("");
  const [loading, setLoading] = useState(true), [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(""), [writing, setWriting] = useState(false);
  const live = useRef(false), sequence = useRef(0), lock = useRef(false);
  useEffect(() => { live.current = true; return () => { live.current = false; sequence.current++; }; }, []);
  const load = useCallback(async () => {
    if (!user || lock.current) return;
    const request = ++sequence.current;
    setLoading(true);
    try {
      const [rows, intelligence] = await Promise.all([
        habitApi.list(dateRange(today, 90)[0], today),
        habitApi.analyze(today).then(value => ({ value })).catch(() => ({ error: "Insights could not be refreshed." })),
      ]);
      if (!live.current || request !== sequence.current) return;
      setHabits(rows || []); setReady(true); setLoadError("");
      setAnalysis(intelligence.value || null); setAnalysisError(intelligence.error || "");
    } catch (error) {
      if (!live.current || request !== sequence.current) return;
      setLoadError(error.message || "Habits could not be refreshed.");
      setAnalysis(null); setAnalysisError("Refresh your records before using insights.");
    } finally {
      if (live.current && request === sequence.current) setLoading(false);
    }
  }, [user?.uid, today]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      setToday(habitToday()); void load();
    };
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [load]);
  async function write(operation, apply) {
    if (lock.current) throw new Error("A habit change is still saving. Please wait.");
    lock.current = true; sequence.current++; setWriting(true); setAnalysis(null); setAnalysisError("");
    try {
      const value = await operation();
      if (live.current) apply(value);
      return value;
    } finally {
      lock.current = false;
      if (live.current) { setWriting(false); void load(); }
    }
  }
  const actions = {
    saveHabit: (payload, id = null) => write(
      () => id ? habitApi.update(id, payload) : habitApi.create(payload),
      saved => setHabits(current => id
        ? current.map(habit => habit.id === saved.id ? { ...saved, completedDates: habit.completedDates } : habit)
        : [...current, saved])),
    deleteHabit: id => write(() => habitApi.remove(id), () => setHabits(current => current.filter(h => h.id !== id))),
    toggleHabit: (habit, completed, day = today) => write(
      () => habitApi.setCompletion(habit.id, day, completed),
      () => setHabits(current => current.map(item => item.id !== habit.id ? item : {
        ...item, completedDates: completed ? [...new Set([...(item.completedDates || []), day])].sort()
          : (item.completedDates || []).filter(date => date !== day),
      }))),
  };
  return { today, habits, analysis: analysis?.date === today ? analysis : null, analysisError,
    loading, ready, loadError, writing, retry: load, actions };
}
