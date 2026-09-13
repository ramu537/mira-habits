import { CalendarRange, CheckCircle2, Flame, Lock, ShieldCheck, Sparkles, SunMedium, Zap } from "lucide-react";

export default function LoginScreen({ onLogin, error, loading }) {
  const HIGHLIGHTS = [
    {
      icon: CheckCircle2,
      title: "Daily Check-ins",
      desc: "Frictionless one-tap tracking to capture positive routines without friction.",
      color: "oklch(0.72 0.16 142 / 18%)",
      border: "oklch(0.72 0.16 142 / 35%)",
    },
    {
      icon: Flame,
      title: "Streaks & Momentum",
      desc: "Celebrate compounding consistency with current and best streak counters.",
      color: "oklch(0.75 0.16 55 / 18%)",
      border: "oklch(0.75 0.16 55 / 35%)",
    },
    {
      icon: CalendarRange,
      title: "Flexible Cadences",
      desc: "Tailor routines with daily commitments or custom weekly frequency targets.",
      color: "oklch(0.68 0.14 285 / 18%)",
      border: "oklch(0.68 0.14 285 / 35%)",
    },
    {
      icon: Zap,
      title: "History & Insights",
      desc: "Visual completion matrices and 90-day consistency views at a glance.",
      color: "oklch(0.68 0.14 225 / 18%)",
      border: "oklch(0.68 0.14 225 / 35%)",
    },
  ];

  return (
    <main className="login-screen">
      {/* Ambient background decoration */}
      <div className="login-ambient" aria-hidden="true">
        <div className="login-glow login-glow--top" />
        <div className="login-glow login-glow--bottom" />
        <div className="login-grid-mesh" />
      </div>

      <div className="login-container">
        {/* Brand Header */}
        <header className="login-header">
          <div className="login-brand">
            <span className="brand-mark" aria-hidden="true">
              <Sparkles size={22} strokeWidth={2.2} />
            </span>
            <span className="login-brand__name">Mira</span>
            <span className="login-badge-tag">Habits</span>
          </div>

          <div className="login-badge">
            <Sparkles size={14} className="login-badge__sparkle" />
            <span>Dedicated Habits & Consistency Workspace</span>
          </div>

          <h1 className="login-title">
            Small steps compound into{" "}
            <span className="login-title__gradient">lasting transformation</span>
          </h1>

          <p className="login-copy">
            A calm, distraction-free companion to build daily momentum, track personal streaks,
            and stay accountable — connected directly to your private Mira cloud.
          </p>
        </header>

        {/* Feature Grid */}
        <div className="login-features-grid" role="list" aria-label="Key features">
          {HIGHLIGHTS.map(({ icon: Icon, title, desc, color, border }) => (
            <div
              key={title}
              className="login-feature-card"
              role="listitem"
              style={{ backgroundColor: color, borderColor: border }}
            >
              <div className="login-feature-card__icon" aria-hidden="true">
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <div className="login-feature-card__content">
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
            </div>
          ))}
        </div>

        {/* Sign-in Action Card */}
        <section className="login-card" aria-label="Sign in">
          <div className="login-card__header">
            <div className="login-lock-icon" aria-hidden="true">
              <Lock size={18} />
            </div>
            <h2>Sign in to continue</h2>
            <p>Access your habits, streak milestones, and completion history.</p>
          </div>

          {error && (
            <div className="login-error-alert" role="alert">
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            className="login-google-btn"
            onClick={onLogin}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="login-spinner" aria-hidden="true" />
            ) : (
              <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{loading ? "Signing in..." : "Continue with Google"}</span>
          </button>

          <footer className="login-card__footer">
            <ShieldCheck size={13} />
            <span>Encrypted cloud storage with zero advertising tracking.</span>
          </footer>
        </section>
      </div>
    </main>
  );
}
