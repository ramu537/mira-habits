import { Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cadenceLabel, isCompleted, paletteToken, weeklyProgress } from "../lib/habits";

export default function HabitRow({ habit, today, progress, toggling, onToggle, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);
  const done = isCompleted(habit, today);
  const weekCount = weeklyProgress(habit, today).count;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => { if (!ref.current?.contains(event.target)) setMenuOpen(false); };
    const escape = (event) => { if (event.key === "Escape") { setMenuOpen(false); ref.current?.querySelector("button")?.focus(); } };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, [menuOpen]);

  return (
    <article className={done ? "habit-row is-done" : "habit-row"} style={{ "--habit-color": paletteToken(habit.color) }}>
      <button className="habit-check" type="button" disabled={toggling} aria-pressed={done} aria-label={`${done ? "Mark incomplete" : "Mark complete"}: ${habit.name}`} onClick={() => onToggle(habit, !done)}>{done && <Check size={20} strokeWidth={2.6} />}</button>
      <button className="habit-row__main" type="button" disabled={toggling} onClick={() => onEdit(habit)}><strong>{habit.name}</strong><small>{cadenceLabel(habit)}{habit.category && habit.category !== "GENERAL" ? ` · ${habit.category.toLowerCase()}` : ""}</small>{habit.cadence === "WEEKLY" && <small>{weekCount} / {habit.targetPerWeek} this week{weekCount >= habit.targetPerWeek ? " · target reached" : " · choose your days"}</small>}</button>
      <div className="habit-row__stats"><span><strong>{done ? "Recorded" : "Check in"}</strong><small>today</small></span>{progress && <span><strong>{progress.currentStreak}{habit.cadence === "DAILY" ? "d" : "w"}</strong><small>window streak</small></span>}</div>
      <div className="row-menu" ref={ref}><button className="icon-button" type="button" aria-label={`Actions for ${habit.name}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}><MoreHorizontal size={19} /></button>{menuOpen && <div className="row-menu__popover"><button type="button" onClick={() => { setMenuOpen(false); onEdit(habit); }}><Pencil size={16} /> Edit</button><button className="danger-action" type="button" onClick={() => { setMenuOpen(false); onDelete(habit); }}><Trash2 size={16} /> Delete</button></div>}</div>
    </article>
  );
}
