import { Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cadenceLabel, isCompleted, paletteToken, weeklyProgress, canRecordDay } from "../lib/habits";
import { fullDate } from "../lib/dates";

export default function HabitRow({ habit, today, days, activeDay, progress, toggling, onToggle, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);
  const week = weeklyProgress(habit, today);
  useEffect(() => {
    if (!menuOpen) return;
    const close = event => { if (!ref.current?.contains(event.target)) setMenuOpen(false); };
    const escape = event => { if (event.key === "Escape") { setMenuOpen(false); ref.current?.querySelector("button")?.focus(); } };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, [menuOpen]);
  return <tr className="routine-row" style={{ "--habit-color": paletteToken(habit.color) }}>
    <th scope="row"><button type="button" className="routine-name" disabled={toggling} onClick={() => onEdit(habit)}>
      <span className="routine-color" /><span><strong>{habit.name}</strong><small>{habit.cadence === "WEEKLY"
        ? week.count + "/" + week.target + " this week" + (week.remaining === 0 ? " · target reached" : " · flexible days")
        : cadenceLabel(habit)}{progress?.currentStreak > 1 ? " · " + progress.currentStreak + (habit.cadence === "DAILY" ? " day" : " week") + " streak" : ""}</small>
        {habit.cue && <small className="routine-cue">{habit.cue}</small>}
      </span></button>
      <div className="routine-mini-week" aria-label="Last seven days">{days.map(day => <span key={day} title={fullDate(day) + ": " + (isCompleted(habit, day) ? "recorded" : "unrecorded")} className={isCompleted(habit, day) ? "is-recorded" : ""}>{day === today ? "T" : ""}</span>)}</div>
    </th>
    {days.map(day => {
      const done = isCompleted(habit, day), allowed = canRecordDay(habit, day, today);
      return <td className={(day === today ? "is-today" : "past-day") + (day === activeDay ? " mobile-active-day" : " mobile-hidden-day")} key={day}>
        <button type="button" className={"routine-cell" + (done ? " is-recorded" : "")} disabled={toggling || !allowed}
          aria-pressed={done} aria-label={habit.name + ", " + fullDate(day) + ": " + (done ? "clear check-in" : allowed ? "record completion" : "before tracking began")}
          title={fullDate(day) + " · " + (done ? "Recorded — select to clear" : allowed ? "Not recorded — select to check in" : "Before tracking began")}
          onClick={() => onToggle(habit, !done, day)}>{done ? <Check size={18} strokeWidth={2.5} /> : <span aria-hidden="true">{allowed ? "·" : "–"}</span>}</button>
      </td>;
    })}
    <td><div className="row-menu" ref={ref}><button className="icon-button" type="button" disabled={toggling} aria-label={"Actions for " + habit.name} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}><MoreHorizontal size={18} /></button>
      {menuOpen && <div className="row-menu__popover"><button type="button" disabled={toggling} onClick={() => { setMenuOpen(false); onEdit(habit); }}><Pencil size={16} /> Edit habit</button><button className="danger-action" type="button" disabled={toggling} onClick={() => { setMenuOpen(false); onDelete(habit); }}><Trash2 size={16} /> Delete</button></div>}
    </div></td>
  </tr>;
}
