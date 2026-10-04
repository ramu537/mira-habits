import FloatingAssistant from "./components/FloatingAssistant";
import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider, signInWithPopup, signOut } from "./config/firebase";
import { configureAccessTokenProvider } from "./api/client";
import AppShell from "./components/AppShell";
import HabitDialog from "./components/HabitDialog";
import HabitIntelligenceDialog from "./components/HabitIntelligenceDialog";
import AiHabitCaptureModal from "./components/AiHabitCaptureModal";
import AiMemorySearchDialog from "./components/AiMemorySearchDialog";
import LoginScreen from "./components/LoginScreen";
import { ErrorState, LoadingState } from "./components/PageState";
import Toast from "./components/Toast";
import { useHabitManager } from "./hooks/useHabitManager";
import HistoryPage from "./pages/HistoryPage";
import TodayPage from "./pages/TodayPage";

function loginMessage(error) {
  const code = error?.code || "";
  if (code === "auth/popup-closed-by-user") return "Sign-in was closed before it finished. Try again when you are ready.";
  if (code === "auth/popup-blocked") return "Your browser blocked the sign-in window. Allow pop-ups for Mira and try again.";
  if (code === "auth/network-request-failed") return "Could not reach Google authentication. Check your connection and try again.";
  return "Could not sign you in right now. Please try again.";
}

if (typeof window !== "undefined" && import.meta.env.DEV && window.location.search.includes("dev=true")) {
  localStorage.setItem("mira-dev-user", "true");
}

export default function App() {
  const [user, setUser] = useState(() => {
    if (import.meta.env.DEV && typeof window !== "undefined" && (window.location.search.includes("dev=true") || localStorage.getItem("mira-dev-user") === "true")) {
      return { uid: "dev-user", email: "mani@mira.app", displayName: "Mani", getIdToken: async () => "dev-mock-token" };
    }
    return null;
  });
  const [authReady, setAuthReady] = useState(() => {
    if (import.meta.env.DEV && typeof window !== "undefined" && (window.location.search.includes("dev=true") || localStorage.getItem("mira-dev-user") === "true")) {
      return true;
    }
    return false;
  });
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        configureAccessTokenProvider(async () => currentUser.getIdToken());
        setUser(currentUser);
      } else if (import.meta.env.DEV && (window.location.search.includes("dev=true") || localStorage.getItem("mira-dev-user") === "true")) {
        configureAccessTokenProvider(async () => "dev-mock-token");
        setUser({ uid: "dev-user", email: "mani@mira.app", displayName: "Mani", getIdToken: async () => "dev-mock-token" });
      } else {
        configureAccessTokenProvider(null);
        setUser(null);
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  async function login() {
    setAuthBusy(true);
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(loginMessage(err));
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    setAuthError("");
    try {
      localStorage.removeItem("mira-dev-user");
      await signOut(auth);
      configureAccessTokenProvider(null);
      setUser(null);
    } catch {
      setAuthError("Could not sign you out right now. Please try again.");
    }
  }

  if (!authReady) return <LoadingState message="Connecting to your habits workspace..." />;
  if (!user) return <LoginScreen onLogin={login} error={authError} loading={authBusy} />;
  return <HabitWorkspace key={user.uid} user={user} onLogout={logout} />;
}

function HabitWorkspace({ user, onLogout }) {
  const manager = useHabitManager(user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [aiCaptureOpen, setAiCaptureOpen] = useState(false);
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAiSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function openManualCreate() { setEditingHabit(null); setDialogOpen(true); }
  function openCreate() { setAiCaptureOpen(true); }
  function openEdit(habit) { setEditingHabit(habit); setDialogOpen(true); }
  function closeDialog() { if (!saving) { setDialogOpen(false); setEditingHabit(null); } }

  async function saveHabit(payload) {
    setSaving(true);
    try {
      await manager.actions.saveHabit(payload, editingHabit?.id);
      setDialogOpen(false);
      setEditingHabit(null);
      setToast({ tone: "success", message: editingHabit ? "Habit updated." : "Habit created." });
    } catch (error) {
      setToast({ tone: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function toggleHabit(habit, completed, day) {
    try {
      await manager.actions.toggleHabit(habit, completed, day);
      if (day && day !== manager.today) setToast({ tone: "success", message: `${habit.name}: ${day} ${completed ? "recorded" : "cleared"}.` });
    } catch (error) {
      setToast({ tone: "error", message: error.message });
    }
  }

  async function deleteHabit(id) {
    setDeletingId(id);
    try {
      await manager.actions.deleteHabit(id);
      setToast({ tone: "success", message: "Habit deleted." });
      return true;
    } catch (error) {
      setToast({ tone: "error", message: error.message });
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  let content;
  if (!manager.ready && manager.loading) content = <LoadingState />;
  else if (!manager.ready && manager.loadError) content = <ErrorState message={manager.loadError} onRetry={manager.retry} />;
  else content = (
    <Routes>
      <Route path="/" element={<TodayPage manager={manager} deletingId={deletingId} onAdd={openCreate} onToggle={toggleHabit} onEdit={openEdit} onDelete={deleteHabit} />} />
      <Route path="/history" element={<HistoryPage habits={manager.habits} today={manager.today} analysis={manager.analysis} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  return (
    <>
      <AppShell
        loading={manager.loading}
        onAdd={openManualCreate}
        onOpenIntelligence={() => setIntelligenceOpen(true)}
        onOpenAiCapture={() => setAiCaptureOpen(true)}
        onOpenAiSearch={() => setAiSearchOpen(true)}
        user={user}
        onLogout={onLogout}
      >
        {manager.ready && manager.loadError && <div className="habit-refresh-error" role="alert"><p>Your habits could not be refreshed. Displayed records may be out of date.</p><button className="button button--secondary" type="button" disabled={manager.loading || manager.writing} onClick={manager.retry}>Refresh records</button></div>}
        {content}
      </AppShell>
      <HabitDialog open={dialogOpen} habit={editingHabit} busy={saving} onClose={closeDialog} onSave={saveHabit} />
      <HabitIntelligenceDialog userId={user.uid} open={intelligenceOpen} manager={manager} onClose={() => setIntelligenceOpen(false)} onEdit={openEdit} />
      <AiHabitCaptureModal
        onManual={() => { setAiCaptureOpen(false); openManualCreate(); }}
        key={user.uid}
        open={aiCaptureOpen}
        onClose={() => setAiCaptureOpen(false)}
        onSuccess={(msg) => {
          manager.retry();
          setToast({ tone: "success", message: msg });
        }}
      />
      <AiMemorySearchDialog
        open={aiSearchOpen}
        onClose={() => setAiSearchOpen(false)}
      />
      <FloatingAssistant domain={"habits"} userId={user.uid} date={manager.today} />
      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}
