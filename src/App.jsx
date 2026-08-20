import { useState, useEffect } from "react";
import { onAuthStateChange, isSignInLink, completeSignIn } from "./lib/authHelpers";
import { auth, db } from "./lib/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import Welcome from "./components/Welcome";
import Dashboard from "./components/Dashboard";
import EventDetail from "./components/EventDetail";
import History from "./components/History";

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [screen, setScreen] = useState("dashboard");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventData, setEventData] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isSignInLink(window.location.href)) {
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Please confirm your email for sign-in");
      }
      completeSignIn(email, window.location.href).then(() => {
        window.localStorage.removeItem("emailForSignIn");
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoadingSession(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const eventsSnap = await getDocs(
        query(collection(db, "events"), where("userId", "==", user.uid))
      );
      const eventMap = {};
      eventsSnap.forEach((docSnap) => {
        const d = docSnap.data();
        eventMap[d.dateKey] = {
          roster: d.roster,
          status: d.status,
          playerCount: d.playerCount,
        };
      });
      setEventData(eventMap);

      const historySnap = await getDocs(
        query(
          collection(db, "history"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
      );
      setHistory(
        historySnap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            type: d.type,
            dateKey: d.dateKey,
            status: d.status,
            playerCount: d.playerCount,
            timestamp: d.createdAt,
          };
        })
      );
    };

    loadData();
  }, [user]);

  const logHistory = async (entry) => {
    const docRef = await addDoc(collection(db, "history"), {
      userId: user.uid,
      type: entry.type,
      dateKey: entry.dateKey,
      status: entry.status || null,
      playerCount: entry.playerCount ?? null,
      createdAt: new Date().toISOString(),
    });

    setHistory((prev) => [
      {
        id: docRef.id,
        type: entry.type,
        dateKey: entry.dateKey,
        status: entry.status,
        playerCount: entry.playerCount,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    logHistory({ type: "opened", dateKey: event.date });
    setScreen("eventDetail");
  };

  const handleSaveEvent = async (dateKey, roster, status, playerCount) => {
    const docId = `${user.uid}_${dateKey}`;
    await setDoc(doc(db, "events", docId), {
      userId: user.uid,
      dateKey,
      roster,
      status,
      playerCount,
      updatedAt: new Date().toISOString(),
    });

    setEventData((prev) => ({
      ...prev,
      [dateKey]: { roster, status, playerCount },
    }));
    logHistory({ type: "saved", dateKey, status, playerCount });
    setScreen("dashboard");
  };

  const handleSignOut = async () => {
    await auth.signOut();
    setSelectedEvent(null);
    setScreen("dashboard");
  };

  const handleNavigate = (tabName) => {
    setScreen(tabName === "History of Boss April" ? "history" : "dashboard");
  };

  const handleClearHistory = async () => {
    const historySnap = await getDocs(
      query(collection(db, "history"), where("userId", "==", user.uid))
    );
    await Promise.all(historySnap.docs.map((d) => deleteDoc(d.ref)));
    setHistory([]);
  };

  if (loadingSession) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  if (!user) {
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