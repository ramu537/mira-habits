import { Award, CalendarDays, CheckCircle2, Flame } from "lucide-react";
import { dateRange, shortDate } from "../lib/dates";
import { habitStats, isCompleted, paletteToken } from "../lib/habits";

export default function HistoryPage({ habits, today }) {
  const days = dateRange(today, 63);
  const rows = habits.flatMap((habit) => days.map((date) => ({ habit, date, completed: isCompleted(habit, date) })));
  const completions = rows.filter((row) => row.completed).length;
  const best = habits.map((habit) => ({ habit, stats: habitStats(habit, today, 63) })).sort((left, right) => right.stats.bestStreak - left.stats.bestStreak)[0];

  return (
    <div className="page-stack history-page">
      <header className="page-heading"><div><span className="eyebrow">Progress compounds</span><h1>Habit history</h1><p>Last 63 days · a missed day is information, not failure.</p></div></header>

      <section className="metric-grid history-metrics" aria-label="History summary">
        <article className="metric"><span className="metric__icon"><CheckCircle2 size={18} /></span><span>Check-ins</span><strong>{completions}</strong><small>across this window</small></article>
        <article className="metric"><span className="metric__icon"><CalendarDays size={18} /></span><span>Active habits</span><strong>{habits.length}</strong><small>included in history</small></article>
        <article className="metric"><span className="metric__icon"><Award size={18} /></span><span>Best streak</span><strong>{best ? `${best.stats.bestStreak}${best.habit.cadence === "DAILY" ? "d" : "w"}` : "—"}</strong><small>{best?.habit.name || "no history yet"}</small></article>
      </section>

      <section className="panel history-card">
        <header className="panel-header"><div><span className="eyebrow">Completion map</span><h2>Nine weeks at a glance</h2></div><div className="history-legend"><span><i className="legend-done" />Done</span><span><i />Not done</span></div></header>
        {habits.length ? (
          <div className="history-list">
            {habits.map((habit) => {
              const stats = habitStats(habit, today, 63);
              return (
                <article className="history-row" key={habit.id} style={{ "--habit-color": paletteToken(habit.color) }}>
                  <header><div><span className="habit-dot" /><strong>{habit.name}</strong></div><div className="history-row__stats"><span><small>Current</small><strong><Flame size={13} />{stats.currentStreak}{habit.cadence === "DAILY" ? "d" : "w"}</strong></span><span><small>Best</small><strong>{stats.bestStreak}{habit.cadence === "DAILY" ? "d" : "w"}</strong></span><span><small>Rate</small><strong>{stats.rate}%</strong></span></div></header>
                  <div className="history-scroll"><div className="history-cells" role="img" aria-label={`${habit.name}: ${stats.completedInPeriod} completions during the last 63 days.`}>{days.map((date) => <span key={date} className={isCompleted(habit, date) ? "is-done" : ""} title={`${shortDate(date)}: ${isCompleted(habit, date) ? "completed" : "not completed"}`} />)}</div></div>
                </article>
              );
            })}
          </div>
        ) : <div className="panel-empty"><strong>No completion history yet</strong><span>Create a habit and complete it to start building this view.</span></div>}

        {habits.length > 0 && <details className="chart-data"><summary>View history as a table</summary><table><thead><tr><th>Habit</th><th>Date</th><th>Status</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.habit.id}-${row.date}`}><td>{row.habit.name}</td><td>{row.date}</td><td>{row.completed ? "Completed" : "Not completed"}</td></tr>)}</tbody></table></details>}
      </section>
    </div>
  );
}

