import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Welcome from "./components/Welcome";
import Dashboard from "./components/Dashboard";
import EventDetail from "./components/EventDetail";
import History from "./components/History";

export default function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [screen, setScreen] = useState("dashboard");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventData, setEventData] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const loadData = async () => {
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", session.user.id);

      const eventMap = {};
      (events || []).forEach((e) => {
        eventMap[e.date_key] = {
          roster: e.roster,
          status: e.status,
          playerCount: e.player_count,
        };
      });
      setEventData(eventMap);

      const { data: historyRows } = await supabase
        .from("history")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setHistory(
        (historyRows || []).map((h) => ({
          id: h.id,
          type: h.type,
          dateKey: h.date_key,
          status: h.status,
          playerCount: h.player_count,
          timestamp: h.created_at,
        }))
      );
    };

    loadData();
  }, [session]);

  const logHistory = async (entry) => {
    const { data } = await supabase
      .from("history")
      .insert({
        user_id: session.user.id,
        type: entry.type,
        date_key: entry.dateKey,
        status: entry.status,
        player_count: entry.playerCount,
      })
      .select()
      .single();

    if (data) {
      setHistory((prev) => [
        {
          id: data.id,
          type: data.type,
          dateKey: data.date_key,
          status: data.status,
          playerCount: data.player_count,
          timestamp: data.created_at,
        },
        ...prev,
      ]);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    logHistory({ type: "opened", dateKey: event.date });
    setScreen("eventDetail");
  };

  const handleSaveEvent = async (dateKey, roster, status, playerCount) => {
    await supabase.from("events").upsert(
      {
        user_id: session.user.id,
        date_key: dateKey,
        roster,
        status,
        player_count: playerCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date_key" }
    );

    setEventData((prev) => ({
      ...prev,
      [dateKey]: { roster, status, playerCount },
    }));
    logHistory({ type: "saved", dateKey, status, playerCount });
    setScreen("dashboard");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSelectedEvent(null);
    setScreen("dashboard");
  };

  const handleNavigate = (tabName) => {
    setScreen(tabName === "History of Boss April" ? "history" : "dashboard");
  };

  const handleClearHistory = async () => {
    await supabase.from("history").delete().eq("user_id", session.user.id);
    setHistory([]);
  };

  if (loadingSession) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  if (!session) {
    return <Welcome />;
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