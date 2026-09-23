import { Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { habitPalette } from "../lib/habits";

const blankHabit = { name: "", cadence: "DAILY", targetPerWeek: 3, color: habitPalette[0].value, category: "GENERAL", purpose: "" };

export default function HabitDialog({ open, habit, busy, onClose, onSave }) {
  const ref = useRef(null);
  const [form, setForm] = useState(blankHabit);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(habit ? { name: habit.name, cadence: habit.cadence, targetPerWeek: habit.targetPerWeek, color: habit.color, category: habit.category || "GENERAL", purpose: habit.purpose || "" } : blankHabit);
    setAttempted(false);
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const valid = useMemo(() => {
    const target = form.cadence === "DAILY" ? 7 : Number(form.targetPerWeek);
    return form.name.trim().length > 0 && form.name.trim().length <= 80
      && ["DAILY", "WEEKLY"].includes(form.cadence)
      && Number.isInteger(target) && target >= 1 && target <= 7
      && /^#[0-9A-Fa-f]{6}$/.test(form.color);
  }, [form]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event) {
    event.preventDefault();
    setAttempted(true);
    if (!valid || busy) return;
    await onSave({ ...form, name: form.name.trim(), targetPerWeek: form.cadence === "DAILY" ? 7 : Number(form.targetPerWeek) });
  }

  return (
    <dialog ref={ref} className="dialog habit-dialog" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} onClick={(event) => { if (event.target === ref.current && !busy) onClose(); }}>
      <form className="dialog-card habit-form" onSubmit={submit} noValidate>
        <header className="dialog-header"><div><span className="eyebrow">{habit ? "Refine the routine" : "A small step, repeated"}</span><h2>{habit ? "Edit habit" : "Create a habit"}</h2><p>Choose a rhythm that still feels realistic on a difficult week.</p></div><button className="icon-button" type="button" onClick={onClose} disabled={busy} aria-label="Close habit form"><X size={20} /></button></header>
        <div className="form-body">
          <label className="field"><span>Habit name</span><input autoFocus required maxLength="80" placeholder="Morning walk, read for 20 minutes…" value={form.name} onChange={(event) => update("name", event.target.value)} aria-invalid={attempted && !form.name.trim()} />{attempted && !form.name.trim() && <small className="field-error">Give this habit a clear name.</small>}</label>

          <fieldset className="choice-fieldset"><legend>Cadence</legend><div className="cadence-choices">
            <button type="button" className={form.cadence === "DAILY" ? "cadence-choice is-selected" : "cadence-choice"} onClick={() => update("cadence", "DAILY")} aria-pressed={form.cadence === "DAILY"}><span><strong>Daily</strong><small>A consistent everyday routine</small></span>{form.cadence === "DAILY" && <Check size={17} />}</button>
            <button type="button" className={form.cadence === "WEEKLY" ? "cadence-choice is-selected" : "cadence-choice"} onClick={() => update("cadence", "WEEKLY")} aria-pressed={form.cadence === "WEEKLY"}><span><strong>Weekly</strong><small>A flexible weekly target</small></span>{form.cadence === "WEEKLY" && <Check size={17} />}</button>
          </div></fieldset>

          {form.cadence === "WEEKLY" && <label className="field"><span>Times per week</span><select value={form.targetPerWeek} onChange={(event) => update("targetPerWeek", Number(event.target.value))}>{[1, 2, 3, 4, 5, 6, 7].map((value) => <option key={value} value={value}>{value} {value === 1 ? "time" : "times"}</option>)}</select></label>}

          <details className="habit-context-fields"><summary>Personalise insights · optional</summary><label className="field"><span>Area of life</span><select value={form.category} onChange={(event) => update("category", event.target.value)}>{[["GENERAL", "General"], ["HEALTH", "Health"], ["FITNESS", "Fitness"], ["STUDY", "Study"], ["WELLBEING", "Wellbeing"], ["CUSTOM", "Something else"]].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="field"><span>What does this support?</span><input maxLength={300} value={form.purpose} placeholder="For example: a small reading session after breakfast" onChange={(event) => update("purpose", event.target.value)} /></label><p>Only add context you want stored and shared with your connected assistant. No medical outcomes are inferred.</p></details>
          {habit && <p className="habit-schedule-note">Changing the cadence or weekly target starts a new statistical schedule. Previous check-ins remain in history.</p>}

          <fieldset className="choice-fieldset"><legend>Color</legend><div className="color-choices">
            {habitPalette.map((item) => <button key={item.value} type="button" className={form.color.toUpperCase() === item.value ? "color-choice is-selected" : "color-choice"} style={{ "--habit-color": item.token }} onClick={() => update("color", item.value)} aria-label={`Use ${item.label}`} aria-pressed={form.color.toUpperCase() === item.value}><span />{form.color.toUpperCase() === item.value && <Check size={15} />}</button>)}
          </div></fieldset>
        </div>
        <footer className="dialog-actions form-actions"><button className="button button--ghost" type="button" onClick={onClose} disabled={busy}>Cancel</button><button className="button button--primary" type="submit" disabled={busy}>{busy ? "Saving…" : habit ? "Save changes" : "Create habit"}</button></footer>
      </form>
    </dialog>
  );
}
