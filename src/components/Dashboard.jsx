import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { getSaturdaysInMonth, toDateKey } from "../utils/dates";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ------------------------------------------------------------
// Build months from August 2026 onwards
// ------------------------------------------------------------
function buildMonths(year, rosters) {
  // Determine which months to show for this year
  let monthIndices;
  if (year === 2026) {
    // Only August (index 7) through December (index 11)
    monthIndices = [7, 8, 9, 10, 11];
  } else if (year > 2026) {
    // All months (0 to 11)
    monthIndices = Array.from({ length: 12 }, (_, i) => i);
  } else {
    // Years before 2026 – should not happen because we disable the left arrow
    return [];
  }

  return monthIndices.map((monthIndex) => {
    const name = MONTH_NAMES[monthIndex];
    const saturdays = getSaturdaysInMonth(year, monthIndex);
    const events = saturdays.map((date) => {
      const dateKey = toDateKey(date);
      return {
        id: dateKey,
        date: dateKey,
        title: "Open Play Football",
        time: "6:00 pm - 8:00 pm",
        location: "Aboitiz Pitch",
        hasRoster: Boolean(rosters[dateKey]),
      };
    });
    return { name, events };
  });
}

// ------------------------------------------------------------
// EventCard – unchanged
// ------------------------------------------------------------
function EventCard({ event, onClick }) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-lg border border-gray-100 shadow-sm pl-4 pr-4 py-3 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg" />
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-blue-700 text-sm">{event.title}</h4>
        <span className="text-xs text-gray-400">{formattedDate}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
        <Clock size={12} />
        <span>{event.time}</span>
        <MapPin size={12} className="ml-2" />
        <span>{event.location}</span>
      </div>
      <div className="border-t border-gray-100 mt-3 pt-2 flex justify-between items-center">
        {event.hasRoster ? (
          <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
            <CheckCircle2 size={12} /> Roster set
          </span>
        ) : (
          <span className="text-xs text-gray-400">No roster yet</span>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// MonthSection – unchanged
// ------------------------------------------------------------
function MonthSection({ month, onSelectEvent }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-2 text-left"
      >
        <span className="font-semibold text-gray-700 text-sm">{month.name}</span>
        <span className="text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5">
          {month.events.length} Event{month.events.length !== 1 ? "s" : ""}
        </span>
        <span className="ml-auto text-gray-400">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {open && month.events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {month.events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => onSelectEvent(event)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Main Dashboard
// ------------------------------------------------------------
export default function Dashboard({ eventData, onSelectEvent, onSignOut, onNavigate, activeTab }) {
  const [currentYear, setCurrentYear] = useState(2026);
  const navItems = ["Open Play Session","History of Boss April"];

  const months = buildMonths(currentYear, eventData);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-100 p-4 flex flex-col">
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

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Open Play</h1>
        </div>

        <div className="flex items-center gap-3 mb-4">
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

        {months.map((month) => (
          <MonthSection key={month.name} month={month} onSelectEvent={onSelectEvent} />
        ))}
      </main>
    </div>
  );
}