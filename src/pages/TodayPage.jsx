import { CalendarCheck2, Flame, Plus, Sparkles, Target } from "lucide-react";
import { useMemo, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import HabitRow from "../components/HabitRow";
import { fullDate } from "../lib/dates";
import { completionSeries, habitStats, todaySummary } from "../lib/habits";

function MomentumOrbit({ summary }) {
  const message = !summary.total
    ? "Ready when you are"
    : summary.remaining
      ? `${summary.remaining} ${summary.remaining === 1 ? "habit" : "habits"} left`
      : "Today is complete";
  return (
    <section className="momentum-card">
      <div className="momentum-card__glow" aria-hidden="true" />
      <div className="momentum-orbit" style={{ "--progress": `${summary.percent * 3.6}deg` }}>
        <div><Sparkles size={19} /><strong>{summary.percent}%</strong><span>complete</span></div>
      </div>
      <div className="momentum-copy"><span className="momentum-label">Today’s momentum</span><strong>{message}</strong><p>{summary.total ? `${summary.completed} of ${summary.total} checked in` : "Begin with one habit small enough to repeat."}</p></div>
    </section>
  );
}

function CompletionChart({ series, habitCount }) {
  const average = habitCount ? Math.round(series.reduce((sum, day) => sum + day.percent, 0) / series.length) : 0;
  return (
    <section className="panel rhythm-card">
      <header className="panel-header"><div><span className="eyebrow">Completion rhythm</span><h2>Last 14 days</h2></div><span className="average-badge">{average}% average</span></header>
      {habitCount ? (
        <>
          <div className="rhythm-chart" role="img" aria-label={`Average completion was ${average}% over the last 14 days.`}>
            {series.map((day, index) => <div className="rhythm-column" key={day.date}><span>{day.percent ? `${day.percent}%` : ""}</span><i className={index === series.length - 1 ? "is-current" : ""} style={{ height: `${Math.max(5, day.percent)}%` }} /><small>{day.label}</small></div>)}
          </div>
          <details className="chart-data"><summary>View chart data</summary><table><thead><tr><th>Date</th><th>Completed</th><th>Rate</th></tr></thead><tbody>{series.map((day) => <tr key={day.date}><td>{day.date}</td><td>{day.completed} of {day.total}</td><td>{day.percent}%</td></tr>)}</tbody></table></details>
        </>
      ) : <div className="panel-empty"><strong>No rhythm yet</strong><span>Create a habit and check it off to begin this view.</span></div>}
    </section>
  );
}

export default function TodayPage({ habits, today, togglingIds, deletingId, onAdd, onToggle, onEdit, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const summary = useMemo(() => todaySummary(habits, today), [habits, today]);
  const series = useMemo(() => completionSeries(habits, today, 14), [habits, today]);
  const strongest = useMemo(() => habits.map((habit) => ({ habit, stats: habitStats(habit, today) })).sort((left, right) => right.stats.currentStreak - left.stats.currentStreak)[0], [habits, today]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    if (await onDelete(pendingDelete.id)) setPendingDelete(null);
  }

  return (
    <div className="page-stack">
      <header className="page-heading"><div><span className="eyebrow">Build with consistency</span><h1>Today</h1><p>{fullDate(today)} · choose the easiest meaningful check.</p></div></header>

      <section className="overview-grid">
        <MomentumOrbit summary={summary} />
        <CompletionChart series={series} habitCount={habits.length} />
      </section>

      <section className="metric-grid" aria-label="Habit summary">
        <article className="metric"><span className="metric__icon"><CalendarCheck2 size={18} /></span><span>Done today</span><strong>{summary.completed} / {summary.total}</strong><small>{summary.remaining ? `${summary.remaining} remaining` : summary.total ? "all complete" : "no habits yet"}</small></article>
        <article className="metric"><span className="metric__icon"><Target size={18} /></span><span>Perfect days</span><strong>{summary.perfectDays}</strong><small>within the last 30 days</small></article>
        <article className="metric"><span className="metric__icon"><Flame size={18} /></span><span>Strongest streak</span><strong>{strongest ? `${strongest.stats.currentStreak}${strongest.habit.cadence === "DAILY" ? "d" : "w"}` : "—"}</strong><small>{strongest?.habit.name || "waiting for a check-in"}</small></article>
      </section>

      <section className="panel habit-list-card">
        <header className="panel-header"><div><span className="eyebrow">Your routines</span><h2>Today’s habits</h2></div><span className="count-badge">{habits.length}</span></header>
        {habits.length ? <div className="habit-list">{habits.map((habit) => <HabitRow key={habit.id} habit={habit} today={today} toggling={togglingIds.has(habit.id)} onToggle={onToggle} onEdit={onEdit} onDelete={setPendingDelete} />)}</div> : <div className="empty-state"><span className="empty-state__icon"><Sparkles size={24} /></span><h2>Start with one small habit</h2><p>Choose something realistic enough to repeat, even on a busy day.</p><button className="button button--secondary" type="button" onClick={onAdd}><Plus size={17} /> Create your first habit</button></div>}
      </section>

      <ConfirmDialog open={Boolean(pendingDelete)} habit={pendingDelete} busy={deletingId === pendingDelete?.id} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
    </div>
  );
}

