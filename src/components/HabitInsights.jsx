import { RefreshCw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function HabitInsights({ manager }) {
  const { analysis, analysisError, loading, writing, retry } = manager;
  const busy = loading || writing;
  if (!analysis) return <aside className="panel habit-insights" aria-busy={busy}><header><Sparkles size={18} /><h2>Habit insights</h2></header>
    {analysisError ? <><p role="alert">Insights couldn’t be refreshed. Your saved habits are not affected.</p><button className="button button--secondary" type="button" onClick={retry} disabled={busy}>Retry insights</button></> : <p role="status">{writing ? "Saving your check-in…" : "Reading your habit patterns…"}</p>}</aside>;
  const observations = analysis.observations;
  const next = analysis.habits.find(habit => !habit.completedToday && (habit.cadence === "DAILY" || habit.weekRemaining > 0)) || analysis.habits[0];
  function observation(item) {
    return <article className="habit-observation" key={item.id}><h3>{item.headline}</h3>
      {item.assistantInterpretation ? <><span className="habit-insight-origin">Connected AI explanation</span><p>{item.assistantInterpretation.explanation}</p></> : <><span className="habit-insight-origin">From your records</span><p>{item.explanation}</p></>}
      <details><summary>Supporting records</summary><dl>{item.evidence.map(fact => <div key={fact.key}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl><p>{item.coverage.note}</p></details>
    </article>;
  }
  return <aside className="panel habit-insights" aria-busy={busy}>
    <header><Sparkles size={18} /><h2>Habit insights</h2><button type="button" className="icon-button" aria-label="Refresh habit insights" disabled={busy} onClick={retry}><RefreshCw size={16} /></button></header>
    <p className="habit-insight-summary">{analysis.summary}</p>
    {observations.length ? <>{observations.slice(0, 3).map(observation)}{observations.length > 3 && <details className="more-habit-insights"><summary>More habit observations ({observations.length - 3})</summary>{observations.slice(3).map(observation)}</details>}</> : <p className="habit-insight-empty">Not enough recorded history for a pattern yet. Check in when you complete something; there’s no need to fill gaps with guesses.</p>}
    {next && <section className="habit-next-step"><span className="eyebrow">One next step</span><h3>{next.name}</h3><p>{next.nextStep}</p>{next.purpose && <p className="habit-purpose">Your purpose: {next.purpose}</p>}</section>}
    <Link className="habit-history-link" to="/history">View history →</Link>
    <details className="habit-analysis-method"><summary>How these insights work</summary><p>Numbers are calculated from your records. Connected-AI explanations appear when your assistant submits an insight; the app does not pretend one was generated when it wasn’t.</p><ul>{analysis.assumptions.map(text => <li key={text}>{text}</li>)}</ul><p>Updated {new Intl.DateTimeFormat("en-IN", { timeZone: analysis.timeZone, dateStyle: "medium", timeStyle: "short" }).format(new Date(analysis.generatedAt))} · {analysis.timeZone}</p><a href="https://www.niddk.nih.gov/health-information/diet-nutrition/changing-habits-better-health" target="_blank" rel="noopener noreferrer">Background: small steps, tracking and setbacks</a></details>
  </aside>;
}
