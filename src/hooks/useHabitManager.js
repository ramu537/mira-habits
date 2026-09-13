import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { habitApi } from "../api/habits";
import { dateRange, localDateKey } from "../lib/dates";

export function useHabitManager(user = null) {
  const today = localDateKey();
  const requestSequence = useRef(0);
  const toggleLocks = useRef(new Set());
  const [habits, setHabits] = useState([]);
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    const requestId = ++requestSequence.current;
    setLoading(true);
    setLoadError("");
    try {
      const dates = dateRange(today, 90);
      const result = await habitApi.list(dates[0], today);
      if (requestId !== requestSequence.current) return;
      setHabits(Array.isArray(result) ? result : []);
      setReady(true);
    } catch (error) {
      if (requestId !== requestSequence.current) return;
      setLoadError(error.message);
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  }, [user, today]);

  useEffect(() => {
    if (user) {
      load();
    }
    return () => { requestSequence.current += 1; };
  }, [load, user]);

  const actions = useMemo(() => ({
    async saveHabit(payload, editingId = null) {
      const saved = editingId
        ? await habitApi.update(editingId, payload)
        : await habitApi.create(payload);
      setHabits((current) => editingId
        ? current.map((habit) => habit.id === saved.id ? saved : habit)
        : [...current, saved]);
      return saved;
    },
    async deleteHabit(id) {
      await habitApi.remove(id);
      setHabits((current) => current.filter((habit) => habit.id !== id));
    },
    async toggleHabit(habit, completed) {
      if (toggleLocks.current.has(habit.id)) return false;
      toggleLocks.current.add(habit.id);
      setTogglingIds((current) => new Set(current).add(habit.id));
      const previousDates = [...(habit.completedDates || [])];
      setHabits((current) => current.map((item) => item.id === habit.id ? {
        ...item,
        completedDates: completed
          ? Array.from(new Set([...(item.completedDates || []), today])).sort()
          : (item.completedDates || []).filter((date) => date !== today),
      } : item));

      try {
        await habitApi.setCompletion(habit.id, today, completed);
        return true;
      } catch (error) {
        setHabits((current) => current.map((item) => item.id === habit.id
          ? { ...item, completedDates: previousDates }
          : item));
        throw error;
      } finally {
        toggleLocks.current.delete(habit.id);
        setTogglingIds((current) => {
          const next = new Set(current);
          next.delete(habit.id);
          return next;
        });
      }
    },
  }), [today]);

  return { today, habits, togglingIds, loading, ready, loadError, retry: load, actions };
}

