import { RefreshCw, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";
import HabitInsights from "./HabitInsights";

export default function HabitIntelligenceDialog({ open, manager, onClose, onEdit }) {
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  const busy = manager.loading || manager.writing;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement;
      dialog.showModal();
      void manager.refreshIntelligence();
    }
    if (!open && dialog.open) {
      dialog.close();
      returnFocusRef.current?.focus?.();
    }
  }, [open]);

  function editHabit(habit) {
    if (dialogRef.current?.open) dialogRef.current.close();
    onClose();
    onEdit(habit);
  }

  return <dialog
    ref={dialogRef}
    className="dialog habit-intelligence-dialog"
    aria-labelledby="habit-intelligence-title"
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === dialogRef.current) onClose(); }}
  >
    <div className="dialog-card">
      <header className="dialog-header">
        <div><span className="eyebrow">Based on your check-ins</span><h2 id="habit-intelligence-title"><Sparkles size={19} /> Habit intelligence</h2><p>Review useful patterns and one practical next step when you need it.</p></div>
        <div className="habit-intelligence-dialog__actions">
          <button className="icon-button" type="button" aria-label="Refresh habit intelligence" title="Refresh" disabled={busy} onClick={manager.refreshIntelligence}><RefreshCw className={busy ? "spin" : ""} size={18} /></button>
          <button className="icon-button" type="button" aria-label="Close habit intelligence" title="Close" onClick={onClose}><X size={20} /></button>
        </div>
      </header>
      <div className="habit-intelligence-dialog__body"><HabitInsights manager={manager} onEdit={editHabit} onNavigate={onClose} /></div>
    </div>
  </dialog>;
}
