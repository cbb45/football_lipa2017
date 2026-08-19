import { Clock, FolderOpen, Save, Trash2 } from "lucide-react";

const navItems = ["Open Play Session", "History of Boss April"];

function formatDateKey(dateKey) {
  return new Date(dateKey).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimestamp(isoString) {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function HistoryEntry({ entry }) {
  const scheduleLabel = formatDateKey(entry.dateKey);

  if (entry.type === "opened") {
    return (
      <div className="flex items-start gap-3 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
        <FolderOpen size={18} className="text-blue-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-gray-800">
            Opened the <span className="font-semibold">{scheduleLabel}</span> schedule
          </p>
          <p className="text-xs text-gray-400 mt-1">{formatTimestamp(entry.timestamp)}</p>
        </div>
      </div>
    );
  }

  const statusColor =
    entry.status === "cancelled"
      ? "text-red-600"
      : entry.status === "happened"
      ? "text-green-600"
      : "text-gray-600";

  return (
    <div className="flex items-start gap-3 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <Save size={18} className="text-red-600 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-gray-800">
          Saved the <span className="font-semibold">{scheduleLabel}</span> schedule —{" "}
          <span className={`font-medium ${statusColor}`}>{entry.status}</span>
          {typeof entry.playerCount === "number" && (
            <span className="text-gray-500"> ({entry.playerCount} players)</span>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-1">{formatTimestamp(entry.timestamp)}</p>
      </div>
    </div>
  );
}

export default function History({ history, onSignOut, onNavigate, activeTab, onClearHistory }) {
  const handleClearClick = () => {
    const confirmed = window.confirm(
      "Clear all history? This cannot be undone."
    );
    if (confirmed) {
      onClearHistory();
    }
  };

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
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">History of Boss April</h1>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearClick}
              className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg border text-red-600 border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> Clear all history
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet. Open or save a schedule to see it here.</p>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {history.map((entry) => (
              <HistoryEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}