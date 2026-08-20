import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Clock, MapPin, CheckCircle2, XCircle, Menu, X } from "lucide-react";
import { getSaturdaysInMonth, toDateKey } from "../utils/dates";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SEASON_START = new Date(2026, 7, 22); // August 22, 2026

function buildMonths(year, eventData) {
  const startMonthIndex = year === 2026 ? 7 : 0;

  return MONTH_NAMES.slice(startMonthIndex).map((name) => {
    const monthIndex = MONTH_NAMES.indexOf(name);
    let saturdays = getSaturdaysInMonth(year, monthIndex);

    if (year === 2026 && monthIndex === 7) {
      saturdays = saturdays.filter((d) => d >= SEASON_START);
    }

    const events = saturdays.map((date) => {
      const dateKey = toDateKey(date);
      const data = eventData[dateKey];
      return {
        id: dateKey,
        date: dateKey,
        title: "Open Play Football",
        time: "6:00 pm - 8:00 pm",
        location: "Aboitiz Pitch",
        status: data?.status || "scheduled",
        playerCount: data?.playerCount ?? 0,
      };
    });
    return { name, events };
  });
}

function StatusBadge({ status }) {
  if (status === "happened") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
        <CheckCircle2 size={12} /> Happened
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
        <XCircle size={12} /> Cancelled
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
      Scheduled
    </span>
  );
}

function EventRow({ event, onClick }) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className="relative w-full bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          event.status === "cancelled"
            ? "bg-red-500"
            : event.status === "happened"
            ? "bg-green-500"
            : "bg-blue-600"
        }`}
      />
      <div className="pl-5 pr-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-blue-700 text-sm truncate">{event.title}</h4>
            <span className="text-xs text-gray-400 shrink-0">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 flex-wrap">
            <Clock size={12} className="shrink-0" />
            <span>{event.time}</span>
            <MapPin size={12} className="ml-2 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={event.status} />
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
            {event.playerCount} player{event.playerCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function MonthRow({ month, isOpen, onToggle, onSelectEvent }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden mb-3">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left transition-colors ${
          isOpen ? "bg-red-50" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800">{month.name}</span>
          <span className="text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5">
            {month.events.length} Event{month.events.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-gray-100">
          {month.events.length > 0 ? (
            <div className="flex flex-col gap-3 mt-4">
              {month.events.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  onClick={() => onSelectEvent(event)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-4">No Saturdays scheduled this month.</p>
          )}
        </div>
      )}
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <span className="text-xs text-gray-500 font-mono">
      {dateStr} • {timeStr}
    </span>
  );
}

export default function Dashboard({ eventData, onSelectEvent, onSignOut, onNavigate, activeTab }) {
  const [currentYear, setCurrentYear] = useState(2026);
  const [openMonth, setOpenMonth] = useState("August");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navItems = ["Open Play Session","History of Boss April"];

  const months = buildMonths(currentYear, eventData);

  const handleToggleMonth = (name) => {
    setOpenMonth((prev) => (prev === name ? null : name));
  };

  const handleNavClick = (item) => {
    onNavigate(item);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Football Lipa" className="h-7 w-7 object-contain" />
          <span className="font-bold text-gray-800 text-sm">Football Lipa</span>
        </div>
        <button onClick={() => setMobileNavOpen((v) => !v)}>
          {mobileNavOpen ? <X size={22} className="text-gray-600" /> : <Menu size={22} className="text-gray-600" />}
        </button>
      </div>

      {/* Mobile dropdown nav */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 space-y-1 sticky top-[57px] z-20">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => handleNavClick(item)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item
                  ? "bg-red-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          ))}
          <button
            onClick={onSignOut}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-red-600 border-t border-gray-100 pt-3 mt-1"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-100 p-4 flex-col shrink-0">
        <div className="flex items-center gap-2 mb-6 px-2">
          <img src="/logo.png" alt="Football Lipa" className="h-8 w-8 object-contain" />
          <span className="font-bold text-gray-800">Football Lipa</span>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => onNavigate(item)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item
                  ? "bg-red-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
        <button
          onClick={onSignOut}
          className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-red-600 border-t border-gray-100 pt-3 mt-3"
        >
          Sign Out
        </button>
      </aside>

      <main className="flex-1 p-4 sm:p-6 min-w-0">
                              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Open Play</h1>
          <div className="flex items-center gap-2 flex-wrap text-sm font-medium">
            <span className="text-red-600">Idol ni boss april si grant</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              <LiveClock />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="font-semibold text-gray-700">{currentYear}</span>
          <button
            onClick={() => setCurrentYear((y) => Math.max(2026, y - 1))}
            disabled={currentYear <= 2026}
            className={currentYear <= 2026 ? "opacity-30 cursor-not-allowed" : ""}
          >
            <ChevronLeft size={16} className="text-gray-400 hover:text-red-600" />
          </button>
          <button onClick={() => setCurrentYear((y) => y + 1)}>
            <ChevronRight size={16} className="text-gray-400 hover:text-red-600" />
          </button>
          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
            All Saturdays
          </span>
        </div>

        <div className="w-full">
          {months.map((month) => (
            <MonthRow
              key={month.name}
              month={month}
              isOpen={openMonth === month.name}
              onToggle={() => handleToggleMonth(month.name)}
              onSelectEvent={onSelectEvent}
            />
          ))}
        </div>
      </main>
    </div>
  );
}