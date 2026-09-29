import { Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import HabitRow from "../components/HabitRow";
import HabitInsights from "../components/HabitInsights";
import { dateRange, fullDate, shortDate } from "../lib/dates";
import { isCompleted, weeklyProgress } from "../lib/habits";

export default function TodayPage({ manager, deletingId, onAdd, onToggle, onEdit, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const { habits, today, writing, analysis } = manager;
  const [activeDay, setActiveDay] = useState(today);
  useEffect(() => setActiveDay(today), [today]);
  const days = dateRange(today, 7);
  const daily = habits.filter(h => h.cadence === "DAILY");
  const weekly = habits.filter(h => h.cadence === "WEEKLY");
  const dailyDone = daily.filter(h => isCompleted(h, today)).length;
  const weeklyDone = weekly.filter(h => weeklyProgress(h, today).remaining === 0).length;
  async function confirmDelete() {
    if (pendingDelete && await onDelete(pendingDelete.id)) setPendingDelete(null);
  }
  return <div className="routine-workspace">
    <header className="routine-heading">
      <div><p className="eyebrow">{fullDate(today)}</p><h1>Your daily rhythm</h1></div>
      <div className="routine-totals" aria-label="Recorded progress">
        {daily.length > 0 && <span><strong>{dailyDone}<small>/{daily.length}</small></strong> today</span>}
        {weekly.length > 0 && <span><strong>{weeklyDone}<small>/{weekly.length}</small></strong> weekly targets</span>}
      </div>
    </header>
    <div className="routine-layout">
      <section className="routine-board" aria-label="Habit check-ins">
        <header className="routine-board__header"><h2>Your habits</h2><span>{shortDate(days[0])} – {shortDate(today)}</span></header>
        {!!habits.length && <label className="routine-mobile-date">Check-in date<select value={activeDay} onChange={event => setActiveDay(event.target.value)} disabled={writing}>{days.map(day => <option key={day} value={day}>{day === today ? "Today" : fullDate(day)}</option>)}</select></label>}
        {habits.length ? <>
          <table className="routine-table">
            <caption className="sr-only">Seven days of habits. Select a date to record or clear a check-in. Blank dates mean unrecorded.</caption>
            <thead><tr><th scope="col">Routine</th>{days.map(day => <th className={(day === today ? "is-today" : "past-day") + (day === activeDay ? " mobile-active-day" : " mobile-hidden-day")} key={day} scope="col">
              <span>{day === today ? "Today" : new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(day + "T12:00:00"))}</span><strong>{Number(day.slice(8))}</strong>
            </th>)}<th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{habits.map(habit => <HabitRow key={habit.id} habit={habit} today={today} days={days} activeDay={activeDay}
              progress={analysis?.habits.find(item => item.id === habit.id)} toggling={writing}
              onToggle={onToggle} onEdit={onEdit} onDelete={setPendingDelete} />)}</tbody>
          </table>
          <footer className="routine-board__footer"><span><i className="recorded-dot" /> Recorded <i className="unrecorded-dot" /> Unrecorded</span><span>India time · Weekly targets reset Monday</span></footer>
        </> : <div className="routine-empty"><Sparkles size={28} /><h3>Start with one small routine</h3><p>Give it a name and choose how often. Everything else is optional.</p><button className="button button--primary" type="button" onClick={onAdd}><Plus size={17} /> Create a habit</button></div>}
      </section>
      <HabitInsights manager={manager} onEdit={onEdit} />
    </div>
    <ConfirmDialog open={Boolean(pendingDelete)} habit={pendingDelete} busy={deletingId === pendingDelete?.id} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
  </div>;
}
