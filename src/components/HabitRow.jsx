import { Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cadenceLabel, habitStats, isCompleted, paletteToken } from "../lib/habits";

export default function HabitRow({ habit, today, toggling, onToggle, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);
  const done = isCompleted(habit, today);
  const stats = habitStats(habit, today);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => { if (!ref.current?.contains(event.target)) setMenuOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menuOpen]);

  return (
    <article className={done ? "habit-row is-done" : "habit-row"} style={{ "--habit-color": paletteToken(habit.color) }}>
      <button className="habit-check" type="button" disabled={toggling} aria-pressed={done} aria-label={`${done ? "Mark incomplete" : "Mark complete"}: ${habit.name}`} onClick={() => onToggle(habit, !done)}>{done && <Check size={20} strokeWidth={2.6} />}</button>
      <button className="habit-row__main" type="button" onClick={() => onEdit(habit)}><strong>{habit.name}</strong><small>{cadenceLabel(habit)}</small></button>
      <div className="habit-row__stats"><span><strong>{stats.currentStreak}{habit.cadence === "DAILY" ? "d" : "w"}</strong><small>streak</small></span><span><strong>{stats.rate}%</strong><small>30 days</small></span></div>
      <div className="row-menu" ref={ref}><button className="icon-button" type="button" aria-label={`Actions for ${habit.name}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}><MoreHorizontal size={19} /></button>{menuOpen && <div className="row-menu__popover"><button type="button" onClick={() => { setMenuOpen(false); onEdit(habit); }}><Pencil size={16} /> Edit</button><button className="danger-action" type="button" onClick={() => { setMenuOpen(false); onDelete(habit); }}><Trash2 size={16} /> Delete</button></div>}</div>
    </article>
  );
}

