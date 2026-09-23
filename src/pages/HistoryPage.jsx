import { dateRange, habitToday, shortDate } from "../lib/dates";
import { isCompleted, paletteToken, cadenceLabel } from "../lib/habits";

export default function HistoryPage({ habits, today, analysis }) {
  const days = dateRange(today, 63);
  function state(habit, date) {
    if (isCompleted(habit, date)) return "Recorded";
    return habit.createdAt && date < habitToday(new Date(habit.createdAt)) ? "Before tracking" : "Unrecorded";
  }
  const rows = habits.flatMap(habit => days.map(date => ({ habit, date, state: state(habit, date) })));
  const completions = rows.filter(row => row.state === "Recorded").length;
  return <div className="page-stack history-page">
    <header className="page-heading"><div><h1>Habit history</h1><p>Last 63 days · unrecorded does not mean unsuccessful.</p></div></header>
    <div className="habit-progress-strip"><span><strong>{completions}</strong> recorded check-ins</span><span><strong>{habits.length}</strong> habits</span><span>Asia/Kolkata · weeks start Monday</span></div>
    <section className="panel history-card">
      <header className="panel-header"><div><h2>Nine weeks of records</h2><p className="habit-history-note">Weekly targets allow rest days. Streaks below use the current schedule within a 90-day window.</p></div><div className="history-legend"><span><i className="legend-done" />Recorded</span><span><i />Unrecorded</span></div></header>
      {habits.length ? <div className="history-list">{habits.map(habit => {
        const progress = analysis?.habits.find(item => item.id === habit.id);
        return <article className="history-row" key={habit.id} style={{ "--habit-color": paletteToken(habit.color) }}>
          <header><div><span className="habit-dot" /><strong>{habit.name}</strong></div>
            {progress && <div className="history-row__stats"><span><small>Current window streak</small><strong>{progress.currentStreak} {progress.streakUnit}</strong></span><span><small>Best in window</small><strong>{progress.bestStreak} {progress.streakUnit}</strong></span></div>}
          </header>
          <p className="habit-history-note">{cadenceLabel(habit)}{progress?.scheduleChanged ? " · Schedule changed; older check-ins are preserved, not rescored." : ""}</p>
          {progress && <p className="habit-history-note">{progress.completionRate == null ? "Not enough closed periods for a rate." : progress.completionRate + "% · " + progress.rateLabel}</p>}
          <div className="history-scroll"><div className="history-cells" role="img" aria-label={habit.name + ": recorded days shown; blank days are unrecorded, not confirmed misses."}>{days.map(date => <span key={date} className={state(habit, date) === "Recorded" ? "is-done" : state(habit, date) === "Before tracking" ? "is-untracked" : ""} title={shortDate(date) + ": " + state(habit, date)} />)}</div></div>
        </article>;
      })}</div> : <div className="panel-empty"><strong>No history yet</strong><span>Your actual check-ins will appear here.</span></div>}
      {!!habits.length && <details className="chart-data"><summary>View accessible history table</summary><table><thead><tr><th>Habit</th><th>Date</th><th>Record</th></tr></thead><tbody>{rows.map(row => <tr key={row.habit.id + "-" + row.date}><td>{row.habit.name}</td><td>{row.date}</td><td>{row.state}</td></tr>)}</tbody></table></details>}
    </section>
  </div>;
}
