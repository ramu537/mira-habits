import { useState } from "react";
import { Sparkles, X, Loader2, CalendarRange } from "lucide-react";
import { captureApi } from "../api/captures";

export default function AiHabitCaptureModal({ open, onClose, onSuccess }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please describe your routine or habit goal.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        content: content.trim(),
        sourceType: "TEXT",
        captureDate: new Date().toISOString().slice(0, 10),
        metadata: {
          targetDomain: "HABIT",
          autoOrganize: true,
        },
      };

      await captureApi.create(payload);
      setContent("");
      onSuccess?.("Habit routine captured! Gemini AI set up your habit.");
      onClose();
    } catch (err) {
      setError(err?.message || "Could not create habit with AI. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dialog-overlay" onClick={onClose} role="presentation">
      <div
        className="dialog-card"
        style={{ maxWidth: "34rem", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-habit-modal-title"
      >
        <header className="dialog-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--accent-strong, #3b82f6)", display: "flex", alignItems: "center" }}>
              <CalendarRange size={22} />
            </span>
            <h2 id="ai-habit-modal-title" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              AI Routine & Habit Builder
            </h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
            Describe a routine or habit you want to build in natural language. Gemini AI will configure frequency, cues, and target parameters.
          </p>

          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
              What habit or routine would you like to track?
            </label>
            <textarea
              className="text-input"
              rows={3}
              placeholder="e.g. Drink 3 liters of water daily, Meditate for 10 minutes every morning after waking up, 30 minutes reading before bed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              style={{ width: "100%", resize: "vertical", borderRadius: "0.5rem" }}
            />
          </div>

          {error && (
            <div style={{ color: "var(--danger, #ef4444)", fontSize: "0.875rem", background: "var(--danger-soft, #fee2e2)", padding: "0.625rem", borderRadius: "0.5rem" }}>
              {error}
            </div>
          )}

          <footer className="dialog-footer" style={{ marginTop: "0.5rem" }}>
            <button className="button button--ghost" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="button button--primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  <span>Configuring with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Build with Gemini</span>
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
