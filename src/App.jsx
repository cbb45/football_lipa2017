import { useState, useEffect } from "react";
import Welcome from "./components/Welcome";
import Dashboard from "./components/Dashboard";
import EventDetail from "./components/EventDetail";
import History from "./components/History";

const STORAGE_KEY = "footballLipa";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { signedIn: false, eventData: {}, history: [] };
    return JSON.parse(raw);
  } catch {
    return { signedIn: false, eventData: {}, history: [] };
  }
}

function saveToStorage(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function App() {
  const initial = loadFromStorage();
  const [signedIn, setSignedIn] = useState(initial.signedIn);
  const [screen, setScreen] = useState("dashboard");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventData, setEventData] = useState(initial.eventData);
  const [history, setHistory] = useState(initial.history);

  // Persist to localStorage whenever any of this changes
  useEffect(() => {
    saveToStorage({ signedIn, eventData, history });
  }, [signedIn, eventData, history]);

  const logHistory = (entry) => {
    setHistory((prev) => [
      { id: Date.now() + Math.random(), timestamp: new Date().toISOString(), ...entry },
      ...prev,
    ]);
  };

  const handleSignUp = () => {
    setSignedIn(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    logHistory({ type: "opened", dateKey: event.date });
    setScreen("eventDetail");
  };

  const handleSaveEvent = (dateKey, roster, status, playerCount) => {
    setEventData((prev) => ({
      ...prev,
      [dateKey]: { roster, status, playerCount },
    }));
    logHistory({ type: "saved", dateKey, status, playerCount });
    setScreen("dashboard");
  };

  const handleSignOut = () => {
    setSignedIn(false);
    setSelectedEvent(null);
    setScreen("dashboard");
  };

  const handleNavigate = (tabName) => {
    setScreen(tabName === "History of Boss April" ? "history" : "dashboard");
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  if (!signedIn) {
    return <Welcome onSignUp={handleSignUp} />;
  }

  if (screen === "eventDetail" && selectedEvent) {
    const existing = eventData[selectedEvent.id];
    return (
      <EventDetail
        event={selectedEvent}
        roster={existing?.roster}
        status={existing?.status || "scheduled"}
        onBack={() => setScreen("dashboard")}
        onSave={handleSaveEvent}
        onSignOut={handleSignOut}
        onNavigate={handleNavigate}
        activeTab="Open Play Session"
      />
    );
  }

  if (screen === "history") {
    return (
      <History
        history={history}
        onSignOut={handleSignOut}
        onNavigate={handleNavigate}
        activeTab="History of Boss April"
        onClearHistory={handleClearHistory}
      />
    );
  }

  return (
    <Dashboard
      eventData={eventData}
      onSelectEvent={handleSelectEvent}
      onSignOut={handleSignOut}
      onNavigate={handleNavigate}
      activeTab="Open Play Session"
    />
  );
}