import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import HabitRow from "../components/HabitRow";
import HabitInsights from "../components/HabitInsights";
import { fullDate } from "../lib/dates";
import { isCompleted, weeklyProgress } from "../lib/habits";

export default function TodayPage({ manager, deletingId, onAdd, onToggle, onEdit, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const { habits, today, writing, analysis } = manager;
  const daily = habits.filter(h => h.cadence === "DAILY"), weekly = habits.filter(h => h.cadence === "WEEKLY");
  const dailyDone = daily.filter(h => isCompleted(h, today)).length;
  const weeklyDone = weekly.filter(h => weeklyProgress(h, today).remaining === 0).length;
  async function confirmDelete() {
    if (pendingDelete && await onDelete(pendingDelete.id)) setPendingDelete(null);
  }
  function group(title, items, hint) {
    if (!items.length) return null;
    return <section className="panel habit-list-card"><header className="panel-header"><div><h2>{title}</h2><p>{hint}</p></div><span className="count-badge">{items.length}</span></header>
      <div className="habit-list">{items.map(habit => <HabitRow key={habit.id} habit={habit} today={today}
        progress={analysis?.habits.find(item => item.id === habit.id)} toggling={writing}
        onToggle={onToggle} onEdit={onEdit} onDelete={setPendingDelete} />)}</div></section>;
  }
  return <div className="page-stack habits-workspace">
    <header className="page-heading"><div><h1>Today’s habits</h1><p>{fullDate(today)} · Asia/Kolkata</p></div></header>
    <div className="habit-progress-strip" aria-label="Recorded progress">
      <span><strong>{dailyDone} / {daily.length}</strong> daily check-ins</span>
      <span><strong>{weeklyDone} / {weekly.length}</strong> weekly targets reached</span>
      <span>One check-in per habit per day</span>
    </div>
    <div className="habit-working-grid">
      <div className="habit-action-column">
        {group("Daily routines", daily, "Check in on what you actually did.")}
        {group("This week", weekly, "Flexible targets · choose your days, keep your rest.")}
        {!habits.length && <section className="panel empty-state"><Sparkles size={24} /><h2>One small routine is enough</h2><p>Start with something you want to repeat. No setup questionnaire.</p><button className="button button--primary" type="button" onClick={onAdd}><Plus size={17} />Create a habit</button></section>}
      </div>
      <HabitInsights manager={manager} />
    </div>
    <ConfirmDialog open={Boolean(pendingDelete)} habit={pendingDelete} busy={deletingId === pendingDelete?.id} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
  </div>;
}
