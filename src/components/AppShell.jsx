import ThemeControl from "./ThemeControl";
import { CalendarRange, LogOut, Plus, Search, Sparkles, SunMedium } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  { to: "/", label: "Today", icon: SunMedium, end: true },
  { to: "/history", label: "History", icon: CalendarRange },
];

function Brand() {
  return (
    <div className="brand" aria-label="Mira Habit Manager">
      <span className="brand-mark" aria-hidden="true"><Sparkles size={21} strokeWidth={2} /></span>
      <span className="brand-copy"><strong>Mira</strong><small>Habit manager</small></span>
    </div>
  );
}

function Navigation({ mobile = false }) {
  return (
    <nav className={mobile ? "mobile-navigation" : "side-navigation"} aria-label="Habit manager">
      {navigation.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end}>
          <Icon size={mobile ? 20 : 18} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppShell({ loading, onAdd, onOpenIntelligence, onOpenAiCapture, onOpenAiSearch, user, onLogout, children }) {
  const initialLetter = (user?.displayName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Brand />
        <Navigation />
        <div className="sidebar-bottom">

          {user && (
            <div className="user-profile">
              <div className="user-profile__info">
                <div className="user-profile__avatar">{initialLetter}</div>
                <div className="user-profile__details">
                  <span className="user-profile__name">{user.displayName || "Mira Member"}</span>
                  <span className="user-profile__email">{user.email}</span>
                </div>
              </div>
              <button
                className="user-profile__signout"
                onClick={onLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="app-column">
        <header className="topbar">
          <div className="topbar-brand"><Brand /></div>
          <span className="topbar-context">Your routines</span>
          <ThemeControl />
            <button className="icon-button" type="button" onClick={onOpenAiSearch} aria-label="Search memory" title="AI Vector Memory Search (Ctrl+K)"><Search size={18} /></button>
          <button className="icon-button topbar-intelligence" type="button" onClick={onOpenIntelligence} aria-label="Open habit intelligence" title="Habit intelligence">
            <Sparkles size={18} />
          </button>
          <button className="button button--ghost topbar-capture" type="button" onClick={onOpenAiCapture} aria-label="AI Habit Builder" title="Create habit with AI">
            <Sparkles size={16} /> <span>AI Habit</span>
          </button>
          <button className="button button--primary topbar-add" type="button" onClick={onAdd}>
            <Plus size={18} strokeWidth={2.4} /> New habit
          </button>
          {user && (
            <div className="topbar-user">
              <div className="topbar-avatar" title={user.email}>{initialLetter}</div>
              <button
                className="topbar-signout-btn"
                onClick={onLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
          {loading && <span className="route-progress" aria-label="Loading habits" />}
        </header>

        <main className="main-content">{children}</main>
        <Navigation mobile />
        <div className="mobile-only-actions">
          <button className="mobile-add mobile-capture" type="button" onClick={onOpenAiCapture} aria-label="AI Habit Builder">
            <Sparkles size={22} strokeWidth={2.2} />
          </button>
          <button className="mobile-add" type="button" onClick={onAdd} aria-label="Create a habit"><Plus size={24} /></button>
        </div>
      </div>
    </div>
  );
}
