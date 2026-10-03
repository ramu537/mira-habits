import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usefulObservations } from "../lib/coaching";

export default function HabitInsights({ manager, onEdit, onNavigate }) {
  const { analysis, habits, analysisError, loading, writing, retry } = manager;
  const busy = loading || writing;
  const observations = usefulObservations(analysis?.observations);
  const primary = observations[0];
  const setup = habits.find(habit => !habit.cue) || habits[0];
  function evidence(item) {
    return <details className="coach-evidence"><summary>Why this appeared</summary>
      <dl>{item.evidence.map(fact => <div key={fact.key}><dt>{fact.label}</dt><dd>{fact.value || "Not provided"}</dd></div>)}</dl>
      <p>{item.coverage.note}</p></details>;
  }
  function brief(item, secondary = false) {
    const ai = item.assistantInterpretation;
    return <article className={secondary ? "coach-brief coach-brief--secondary" : "coach-brief"}>
      <span className="coach-source">{ai ? "Connected AI · based on your records" : "Calculated from your records"}</span>
      <h3>{item.headline}</h3><p>{ai?.explanation || item.explanation}</p>
      <div className="coach-action"><span>Try next</span><p>{ai?.nextAction || item.relevance}</p></div>
      {evidence(item)}
    </article>;
  }
  return <aside className="routine-coach" aria-busy={busy}>
    {analysis?.intelligence && <section className="coach-brief"><span className="coach-source">{analysis.intelligence.status === "READY" ? "AI interpretation" : analysis.intelligence.status === "PENDING" ? "AI review in progress" : "Calculated guidance"}</span><p>{analysis.intelligence.assistantInterpretation || analysis.intelligence.guidance}</p>{analysis.intelligence.providerMessage && <small>{analysis.intelligence.providerMessage}</small>}
      {analysis.intelligence.assistantGeneratedAt && <small>AI updated {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(analysis.intelligence.assistantGeneratedAt))}</small>}
      <details><summary>AI evidence & coverage</summary><p>{analysis.intelligence.coverage}</p>
        <dl>{(analysis.intelligence.evidence || []).map(fact => <div key={fact.key}><dt>{fact.label}{analysis.intelligence.assistantEvidenceKeys?.includes(fact.key) ? " · cited by AI" : ""}</dt><dd>{fact.value}</dd></div>)}</dl>
        <ul>{[...(analysis.intelligence.assumptions || []), ...(analysis.intelligence.safetyNotices || [])].map((item, index) => <li key={index}>{item}</li>)}</ul>
      </details></section>}
    {!analysis ? <div className="coach-placeholder">{analysisError
      ? <><p role="alert">Coaching couldn’t be refreshed. Your saved check-ins are unaffected.</p><button className="button button--secondary" type="button" onClick={retry} disabled={busy}>Retry coaching</button></>
      : <p role="status">{writing ? "Saving your check-in and refreshing the brief…" : "Looking for useful patterns…"}</p>}</div>
      : primary ? <>
        {brief(primary)}
        {observations.length > 1 && <details className="coach-more"><summary>{observations.length - 1} more {observations.length === 2 ? "finding" : "findings"}</summary>{observations.slice(1).map(item => <div key={item.id}>{brief(item, true)}</div>)}</details>}
      </> : <div className="coach-placeholder">
        <span className="coach-source">Setup suggestion · not a detected pattern</span>
        <h3>{setup ? "Make the next repetition easier" : "A useful review starts with your routine"}</h3>
        <p>{setup ? "There isn’t a strong pattern to report yet. You don’t need more statistics to take a small next step." : "Add a habit, then record what you actually do. Your brief will use that history—not guess at it."}</p>
        {setup && <div className="coach-action"><span>{setup.name}</span><p>{setup.cue
          ? "Use your saved cue for the next planned repetition: " + setup.cue + ". Review how it worked after a week."
          : "Pick a time or an existing routine to attach this habit to. A specific cue gives you something useful to review."}</p>
          <button className="coach-link" type="button" disabled={writing} onClick={() => onEdit(setup)}>{setup.cue ? "Refine this routine" : "Add a cue"} <ArrowUpRight size={16} /></button>
        </div>}
      </div>}
    <footer className="coach-footer"><Link to="/history" onClick={onNavigate}>Explore your history <ArrowUpRight size={16} /></Link>
      {analysis?.assistantStatus === "PENDING" && <p className="coach-status">AI review queued for Mira or your connected assistant. Calculated guidance is available now.</p>}
      {analysis?.assistantStatus === "UNAVAILABLE" && <p className="coach-status">The AI review is unavailable. Showing calculated guidance.</p>}
      <details><summary>About this brief</summary><p>Patterns use up to 90 days. Comparisons use complete weeks; blank dates are not confirmed failures. Health and learning outcomes are not measured.</p><p>Mira prepares AI interpretations automatically after changes. Connected assistants use the same evidence. Refresh requests a new interpretation without repeating your check-in.</p>
        {analysis && <p>Records refreshed {new Intl.DateTimeFormat("en-IN", { timeZone: analysis.timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(analysis.generatedAt))} · India time</p>}
      </details>
    </footer>
  </aside>;
}
